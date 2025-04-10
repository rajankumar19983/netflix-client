import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { acceptCall, rejectCall } from "../store/call-Slice";
import { BsTelephoneX, BsTelephoneFill } from "react-icons/bs";
import socket from "../utils/socketInstance";

const CallModal = () => {
  const dispatch = useDispatch();
  const callInfo = useSelector((state) => state.call.callInfo);

  if (!callInfo || callInfo.status !== "incoming") return null;

  const { caller } = callInfo;

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-white text-black px-6 py-4 rounded-xl shadow-xl flex flex-col items-center gap-3 border border-gray-300">
      <img
        src={caller?.avatar || "/avatar.png"}
        alt="caller"
        className="w-12 h-12 rounded-full"
      />
      <div className="text-center font-semibold">
        {caller?.username} is calling...
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => dispatch(acceptCall())}
          className="text-green-500 border-2 border-green-500 rounded-full p-2 hover:bg-green-500 hover:text-white hover:animate-pulse"
        >
          <BsTelephoneFill size={24} />
        </button>
        <button
          onClick={() => dispatch(rejectCall())}
          className="text-red-500 border-2 border-red-500 rounded-full p-2 hover:bg-red-500 hover:text-white hover:animate-pulse"
        >
          <BsTelephoneX size={24} />
        </button>
      </div>
    </div>
  );
};

export default CallModal;
