import { useState, useEffect, useRef } from "react";
import { getLocalStream } from "../utils/getLocalStream.js";
import { createPeerConnection } from "../utils/createPeerConnection.js";
import { startScreenShare, StopScreenShare } from "../store/call-Slice.js";
import { useDispatch } from "react-redux";

export const useWebRTC = (socket, isCaller, remoteUserId) => {
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const screenStreamRef = useRef(null);
  const remoteScreenRef = useRef(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const dispatch = useDispatch();

  const shareScreenStart = async () => {
    try {
      if (!peerConnectionRef.current) {
        console.error("PeerConnection is not initialized yet.");
        return;
      }
      screenStreamRef.current = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      setIsScreenSharing(true);
      dispatch(startScreenShare());

      setTimeout(() => {
        if (remoteScreenRef.current && screenStreamRef.current) {
          remoteScreenRef.current.srcObject = screenStreamRef.current;
        } else {
          console.warn("⚠️ remoteScreenRef or screenStreamRef is null");
        }
      }, 100);

      screenStreamRef.current.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, screenStreamRef.current);
      });

      screenStreamRef.current.getVideoTracks()[0].onended = () => {
        shareScreenStop();
      };
    } catch (err) {
      console.error("Error sharing screen:", err);
    }
  };

  const shareScreenStop = () => {
    if (!screenStreamRef.current) return;

    screenStreamRef.current.getTracks().forEach((track) => track.stop());
    setIsScreenSharing(false);
    dispatch(StopScreenShare());
    const senders = peerConnectionRef.current.getSenders();
    senders.forEach((sender) => {
      if (
        sender.track?.kind === "video" &&
        sender.track.label.toLowerCase().includes("screen")
      ) {
        peerConnectionRef.current.removeTrack(sender);
      }
    });
    screenStreamRef.current = null;
  };

  const leaveCall = () => {
    shareScreenStop();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  useEffect(() => {
    if (!socket) return;

    const init = async () => {
      localStreamRef.current = await getLocalStream();
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      peerConnectionRef.current = createPeerConnection(socket, dispatch, {
        remoteVideoRef,
        remoteScreenRef,
      });

      localStreamRef.current
        .getTracks()
        .forEach((track) =>
          peerConnectionRef.current.addTrack(track, localStreamRef.current)
        );

      if (isCaller) {
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        socket.emit("offer", { offer, to: remoteUserId });
      }
    };

    init();

    socket.on("screen-sharing-started", ({ caller, receiver, callId }) => {
      setIsScreenSharing(true);
    });

    socket.on("screen-sharing-stopped", ({ caller, receiver, callId }) => {
      setIsScreenSharing(false);
    });
    socket.on("offer", async ({ offer, from }) => {
      if (!peerConnectionRef.current) {
        peerConnectionRef.current = createPeerConnection(socket, {
          remoteVideoRef,
          remoteScreenRef,
        });
        localStreamRef.current = await getLocalStream();
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
        localStreamRef.current.getTracks().forEach((track) => {
          peerConnectionRef.current.addTrack(track, localStreamRef.current);
        });
      }
      await peerConnectionRef.current.setRemoteDescription(offer);
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      socket.emit("answer", { answer, to: from });
    });

    socket.on("answer", async ({ answer }) => {
      await peerConnectionRef.current.setRemoteDescription(answer);
      setCallAccepted(true);
    });

    socket.on("ice-candidate", (candidate) => {
      peerConnectionRef.current?.addIceCandidate(candidate);
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [socket, isCaller, remoteUserId]);

  return {
    localStreamRef,
    localVideoRef,
    remoteVideoRef,
    remoteScreenRef,
    callAccepted,
    isScreenSharing,
    shareScreenStart,
    shareScreenStop,
    leaveCall,
  };
};
