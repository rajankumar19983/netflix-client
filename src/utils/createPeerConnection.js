export const createPeerConnection = (socket, remoteVideoRef) => {
  const peer = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.1.google.com:19302",
      },
    ],
  });
  peer.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", event.candidate);
    }
  };
  peer.ontrack = (event) => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = event.streams[0];
    }
  };
};
