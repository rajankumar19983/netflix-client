import { emitIceCandidate } from "../store/call-Slice.js";

export const createPeerConnection = (
  socket,
  dispatch,
  { remoteVideoRef, remoteScreenRef }
) => {
  const peer = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.1.google.com:19302",
      },
    ],
  });

  peer.onicecandidate = (event) => {
    if (event.candidate) {
      dispatch(emitIceCandidate(event.candidate));
    }
  };
  peer.ontrack = (event) => {
    const stream = event.streams[0]; // only use the first stream
    const track = event.track;

    if (track.kind === "video") {
      // Detect screen share by label or other heuristics
      const isScreen =
        track.label.toLowerCase().includes("screen") ||
        track.label.toLowerCase().includes("display");

      if (isScreen && remoteScreenRef?.current) {
        remoteScreenRef.current.srcObject = stream;
      } else if (remoteVideoRef?.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    } else if (track.kind === "audio" && remoteVideoRef?.current) {
      // Attach audio to same stream if needed
      remoteVideoRef.current.srcObject = stream;
    }
  };

  return peer;
};
