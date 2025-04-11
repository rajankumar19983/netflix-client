import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import socket from "../utils/socketInstance.js";
import {
  endCall,
  sendWebRTCOffer,
  emitIceCandidate,
  callEndedExternally,
} from "../store/call-Slice.js";
import toast from "react-hot-toast";

const VideoCallModal = () => {
  const { callInfo } = useSelector((state) => state.call);
  const dispatch = useDispatch();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const screenVideoRef = useRef(null);

  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const screenStreamRef = useRef(null);

  const peerConnectionRef = useRef(null);
  const pendingOfferRef = useRef(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRemoteSharing, setIsRemoteSharing] = useState(false);

  const isOpen = true;

  const getTargetUser = () => {
    return socket.id === callInfo.caller.socketId
      ? callInfo.receiver
      : callInfo.caller;
  };

  const attachStreamWithDelay = (ref, stream) => {
    const tryAttach = () => {
      if (ref.current) {
        ref.current.srcObject = stream;
      } else {
        setTimeout(tryAttach, 300);
      }
    };
    tryAttach();
  };

  useEffect(() => {
    if (localStreamRef.current) {
      attachStreamWithDelay(localVideoRef, localStreamRef.current);
    }
    if (remoteStreamRef.current) {
      attachStreamWithDelay(remoteVideoRef, remoteStreamRef.current);
    }
    if (screenStreamRef.current && (isScreenSharing || isRemoteSharing)) {
      attachStreamWithDelay(screenVideoRef, screenStreamRef.current);
    }
  }, [isScreenSharing, isRemoteSharing]);

  useEffect(() => {
    if (!isOpen) return;

    const setupCall = async () => {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = localStream;

      attachStreamWithDelay(localVideoRef, localStream);

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.1.google.com:19302" }],
      });
      peerConnectionRef.current = pc;

      localStream
        .getTracks()
        .forEach((track) => pc.addTrack(track, localStream));

      pc.ontrack = (event) => {
        const track = event.track;
        const incomingStream = event.streams[0];

        const isScreen =
          track.label.toLowerCase().includes("screen") ||
          track.label.toLowerCase().includes("display");

        if (track.kind === "video") {
          if (isScreen) {
            screenStreamRef.current = incomingStream;
            setIsRemoteSharing(true);
            attachStreamWithDelay(screenVideoRef, incomingStream);
          } else {
            remoteStreamRef.current = incomingStream;
            attachStreamWithDelay(remoteVideoRef, incomingStream);
          }
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const { candidate, sdpMid, sdpMLineIndex } = event.candidate;
          dispatch(
            emitIceCandidate({
              candidate: {
                candidate,
                sdpMid,
                sdpMLineIndex,
              },
              callId: callInfo.callId,
              receiver: getTargetUser(),
            })
          );
        }
      };

      if (pendingOfferRef.current) {
        const { offer, sender } = pendingOfferRef.current;
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc-answer", {
          answer,
          callId: callInfo.callId,
          receiver: sender,
        });
        pendingOfferRef.current = null;
      }

      if (socket.id === callInfo.caller.socketId) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        dispatch(
          sendWebRTCOffer({
            offer,
            callId: callInfo.callId,
            sender: callInfo.caller,
            receiver: getTargetUser(),
          })
        );
      }
    };

    setupCall();

    socket.on("ice-candidate", ({ candidate }) => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }
    });

    socket.on("webrtc-offer", async ({ offer, callId, sender }) => {
      if (!peerConnectionRef.current) {
        pendingOfferRef.current = { offer, sender };
        return;
      }

      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const answer = await peerConnectionRef.current.createAnswer();

      await peerConnectionRef.current.setLocalDescription(answer);

      socket.emit("webrtc-answer", {
        answer,
        callId,
        receiver: sender,
      });
    });

    socket.on("webrtc-answer", async ({ answer }) => {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    socket.on("screen-sharing-stopped", () => {
      screenStreamRef.current = null;
      setIsRemoteSharing(false);

      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = null;
      }
    });

    return () => {
      socket.off("ice-candidate");
      socket.off("webrtc-offer");
      socket.off("webrtc-answer");
      peerConnectionRef.current?.close();
      peerConnectionRef.current = null;
    };
  }, [isOpen]);

  const handleToggleMic = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks?.()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
    }
  };

  const handleToggleVideo = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks?.()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(videoTrack.enabled);
    }
  };

  // const handleScreenShare = async () => {
  //   if (!isScreenSharing) {
  //     try {
  //       const screenStream = await navigator.mediaDevices.getDisplayMedia({
  //         video: true,
  //         audio: true,
  //       });

  //       const screenTrack = screenStream.getVideoTracks()[0];

  //       screenTrack.onended = () => handleStopScreenShare();

  //       screenStream.getTracks().forEach((track) => {
  //         peerConnectionRef.current?.addTrack(track, screenStream);
  //       });

  //       screenStreamRef.current = screenStream;

  //       setIsScreenSharing(true);

  //       attachStreamWithDelay(screenVideoRef, screenStream);

  //       const offer = await peerConnectionRef.current.createOffer();
  //       await peerConnectionRef.current.setLocalDescription(offer);

  //       dispatch(
  //         sendWebRTCOffer({
  //           offer,
  //           callId: callInfo.callId,
  //           sender:
  //             socket.id === callInfo.caller.socketId
  //               ? callInfo.caller
  //               : callInfo.receiver,
  //           receiver: getTargetUser(),
  //         })
  //       );
  //     } catch (err) {
  //       console.error("Screen share error:", err);
  //     }
  //   } else {
  //     handleStopScreenShare();
  //   }
  // };

  const handleScreenShare = () => {
    toast("Feature Coming soon!");
  };

  const handleStopScreenShare = async () => {
    if (!screenStreamRef.current) return;

    screenStreamRef.current.getTracks().forEach((track) => {
      track.stop();
      peerConnectionRef.current?.getSenders().forEach((sender) => {
        if (sender.track === track) {
          peerConnectionRef.current.removeTrack(sender);
        }
      });
    });

    screenStreamRef.current = null;
    setIsScreenSharing(false);
    setIsRemoteSharing(false);

    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);
    dispatch(
      sendWebRTCOffer({
        offer,
        callId: callInfo.callId,
        sender:
          socket.id === callInfo.caller.socketId
            ? callInfo.caller
            : callInfo.receiver,
        receiver: getTargetUser(),
      })
    );
  };

  useEffect(() => {
    const cleanupMedia = (data) => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());

      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      if (screenVideoRef.current) screenVideoRef.current.srcObject = null;

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      setIsScreenSharing(false);
      setIsRemoteSharing(false);

      dispatch(callEndedExternally(data));
    };

    socket.on("callEnded", (data) => {
      cleanupMedia(data);
    });

    return () => {
      socket.off("callEnded", (data) => {
        cleanupMedia(data);
      });
    };
  }, []);

  const handleEndCall = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());

    remoteVideoRef.current && (remoteVideoRef.current.srcObject = null);

    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    dispatch(endCall());
  };

  const isShowingScreen = screenStreamRef.current || isRemoteSharing;

  return (
    <div className="z-[90]">
      <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
        <div className="bg-gray-900 w-screen h-screen p-4 flex gap-2">
          {isShowingScreen ? (
            <>
              <video
                ref={screenVideoRef}
                autoPlay
                playsInline
                className="w-[70%] h-full object-contain bg-black rounded"
              />
              <div className="w-[30%] h-full flex flex-col gap-2">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  className="w-full h-1/2 object-contain bg-black rounded"
                />
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  className="w-full h-1/2 object-contain bg-black rounded"
                />
              </div>
            </>
          ) : (
            <>
              <video
                ref={localVideoRef}
                autoPlay
                muted
                className="w-1/2 h-full object-contain bg-black rounded"
              />
              <video
                ref={remoteVideoRef}
                autoPlay
                className="w-1/2 h-full object-contain bg-black rounded"
              />
            </>
          )}
        </div>
      </div>

      <div className="z-[100] fixed opacity-10 hover:opacity-100 bottom-4 left-1/2 -translate-x-1/2 bg-neutral-800 bg-opacity-80 text-white rounded-xl px-6 py-3 flex gap-4">
        <button onClick={handleToggleMic}>
          {isMicOn ? "Mute Mic" : "Unmute Mic"}
        </button>
        <button onClick={handleToggleVideo}>
          {isVideoOn ? "Turn Off Cam" : "Turn On Cam"}
        </button>
        <button onClick={handleScreenShare}>
          {isScreenSharing ? "Stop Sharing" : "Share Screen"}
        </button>
        <button
          onClick={handleEndCall}
          className="text-red-500"
        >
          End Call
        </button>
      </div>
    </div>
  );
};

export default VideoCallModal;
