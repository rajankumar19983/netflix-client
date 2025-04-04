import { useState, useEffect, useRef } from "react";
import { getLocalStream } from "../utils/getLocalStream.js";
import { createPeerConnection } from "../utils/createPeerConnection.js";

export const useWebRTC = (socket, isCaller, remoteUserId) => {
  const localStreamRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const [callAccepted, setCallAccepted] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const init = async () => {
      localStreamRef.current = await getLocalStream();
      peerConnectionRef.current = createPeerConnection(socket, remoteVideoRef);

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

    socket.on("offer", async ({ offer, from }) => {
      if (!peerConnectionRef.current) {
        peerConnectionRef.current = createPeerConnection(
          socket,
          remoteVideoRef
        );
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

  return { localStreamRef, remoteVideoRef, callAccepted };
};
