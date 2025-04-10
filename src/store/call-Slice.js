import { createSlice } from "@reduxjs/toolkit";
import socket from "../utils/socketInstance";
import ringtone from "../assets/ringtone.mp3";
import callertune from "../assets/callertune.mp3";
import toast from "react-hot-toast";

const initialState = {
  callInfo: null, // {caller, receiver, callId, status}
};

let ringtoneAudio = new Audio(ringtone);
let callertuneAudio = new Audio(callertune);
let timeoutId = null;

const callSlice = createSlice({
  name: "call",
  initialState,
  reducers: {
    startCall: (state, action) => {
      const { caller, receiver } = action.payload;
      const callId = `${caller.id}-${receiver.id}-${Date.now()}`;
      state.callInfo = {
        caller: { ...caller, socketId: socket.id },
        receiver,
        callId,
        status: "calling",
      };
      socket.emit("callUser", { caller, receiver, callId });

      callertuneAudio.loop = true;
      callertuneAudio.play();

      // timeoutId = setTimeout(() => {
      //   callSlice.caseReducers.endCall(state);
      //   toast.error("No Answer");
      // }, 30000);

      timeoutId = setTimeout(() => {
        toast.error("No Answer");
        socket.emit("endCall", { callId });
        callertuneAudio.pause();
        callertuneAudio.currentTime = 0;
      }, 30000);
    },
    incomingCall: (state, action) => {
      if (state.callInfo) return;
      const { caller, receiver, callId } = action.payload;
      state.callInfo = {
        caller,
        receiver: { ...receiver, socketId: socket.id },
        callId,
        status: "incoming",
      };

      ringtoneAudio.loop = true;
      ringtoneAudio.play();

      // timeoutId = setTimeout(() => {
      //   callSlice.caseReducers.rejectCall(state);
      // }, 30000);
      timeoutId = setTimeout(() => {
        ringtoneAudio.pause();
        ringtoneAudio.currentTime = 0;
        socket.emit("rejectCall", { caller, receiver, callId });
        toast.error("Missed call");
        state.callInfo = null;
      }, 30000);
    },
    acceptCall: (state) => {
      if (!state.callInfo || state.callInfo.status !== "incoming") return;

      socket.emit("acceptCall", {
        caller: state.callInfo.caller,
        receiver: state.callInfo.receiver,
        callId: state.callInfo.callId,
      });

      callertuneAudio.pause();
      callertuneAudio.currentTime = 0;
      ringtoneAudio.pause();
      ringtoneAudio.currentTime = 0;
      clearTimeout(timeoutId);
      state.callInfo.status = "in-call";
    },
    rejectCall: (state) => {
      if (!state.callInfo || state.callInfo?.status !== "incoming") return;

      socket.emit("rejectCall", {
        caller: state.callInfo.caller,
        receiver: state.callInfo.receiver,
        callId: state.callInfo.callId,
      });

      ringtoneAudio.pause();
      ringtoneAudio.currentTime = 0;
      clearTimeout(timeoutId);
      state.callInfo = null;
    },
    callAccepted: (state) => {
      callertuneAudio.pause();
      callertuneAudio.currentTime = 0;
      clearTimeout(timeoutId);
      if (state.callInfo) state.callInfo.status = "in-call";
    },
    callRejected: (state) => {
      toast.error("Call was rejected");
      callertuneAudio.pause();
      callertuneAudio.currentTime = 0;
      clearTimeout(timeoutId);
      state.callInfo = null;
    },
    endCall: (state) => {
      if (!state.callInfo) return;
      socket.emit("endCall", {
        callId: state.callInfo.callId,
      });
      ringtoneAudio.pause();
      ringtoneAudio.currentTime = 0;
      callertuneAudio.pause();
      callertuneAudio.currentTime = 0;
      clearTimeout(timeoutId);
      state.callInfo = null;
    },
    callEndedExternally: (state) => {
      ringtoneAudio.pause();
      ringtoneAudio.currentTime = 0;
      callertuneAudio.pause();
      callertuneAudio.currentTime = 0;
      clearTimeout(timeoutId);
      state.callInfo = null;
    },
    sendWebRTCOffer: (state, action) => {
      const { offer, sender, receiver, callId } = action.payload;
      socket.emit("webrtc-offer", {
        offer,
        callId,
        sender,
        receiver,
      });
    },
    startScreenShare: (state) => {
      if (!state.callInfo) return;
      socket.emit("screen-sharing-started", {
        caller: state.callInfo.caller,
        receiver: state.callInfo.receiver,
        callId: state.callInfo.callId,
      });
    },
    StopScreenShare: (state) => {
      if (!state.callInfo) return;
      socket.emit("screen-sharing-stopped", {
        caller: state.callInfo.caller,
        receiver: state.callInfo.receiver,
        callId: state.callInfo.callId,
      });
    },
    // emitIceCandidate: (state, action) => {
    //   const candidate = action.payload;
    //   if (!candidate || !state.callInfo) return;

    //   // emit infos to consumer (may be caller or receiver)
    //   const { caller, receiver, callId } = state.callInfo;
    //   const myId = socket.id;
    //   // Am I the caller?
    //   const isCaller = myId === caller.socketId;
    //   // If I am the caller, target is receiver else target is caller
    //   const target = isCaller ? receiver : caller;
    //   socket.emit("ice-candidate", {
    //     candidate,
    //     receiver: target,
    //     callId,
    //   });
    // },
    emitIceCandidate: (state, action) => {
      const { candidate, callId, receiver } = action.payload;
      socket.emit("ice-candidate", {
        candidate,
        callId,
        receiver,
      });
    },
  },
});

export const {
  startCall,
  incomingCall,
  acceptCall,
  rejectCall,
  callAccepted,
  callRejected,
  endCall,
  callEndedExternally,
  startScreenShare,
  StopScreenShare,
  sendWebRTCOffer,
  emitIceCandidate,
  receivedIceCandidate,
} = callSlice.actions;

export default callSlice.reducer;
