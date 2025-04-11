import React, { use, useState } from "react";
import { FaLink, FaSignInAlt, FaVideo } from "react-icons/fa";
import socket from "../utils/socketInstance.js";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { confirm } from "./confirm.jsx";

const WatchWithFriends = () => {
  const { user } = useSelector((state) => state.user);
  const { participants } = useSelector((state) => state.watchParty);
  const [partyCode, setPartyCode] = useState("");
  const [createdCode, setCreatedCode] = useState(
    localStorage.getItem("watchPartyCode") || null
  );

  const handleCreateParty = () => {
    const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    setCreatedCode(newCode);
    localStorage.setItem("watchPartyCode", newCode);
    setPartyCode("");
    socket.emit("startWatchParty", { roomId: newCode, userId: user?._id });
    toast.success("Watch party created! Share the code.");
  };

  const handleJoinParty = () => {
    if (!partyCode) {
      return toast.error("Enter a valid party code!");
    }
    localStorage.setItem("watchPartyCode", partyCode);
    socket.emit("joinWatchParty", {
      roomId: partyCode,
      userId: user?._id,
    });
    toast.success("Joined the watch party");
  };

  const handleLeaveParty = async () => {
    const userConfirm = await confirm(
      "Are you sure you want to leave the watch party?"
    );
    if (userConfirm) {
      socket.emit("leaveWatchParty", {
        roomId: localStorage.getItem("watchPartyCode"),
        userId: user?._id,
      });
      localStorage.removeItem("watchPartyCode");
      sessionStorage.removeItem("watchPartyParticipants");
      setPartyCode("");
      toast.success("Left the watch party");
    }
  };

  const handleCloseParty = () => {
    socket.emit("closeWatchParty", {
      roomId: partyCode,
      userId: user?._id,
    });
  };

  const handleStartVideoCall = () => {
    toast.dismiss();
    toast("Video call feature coming soon!");
  };

  return (
    <div className="p-4">
      <div className="space-y-4">
        <button
          className="w-full flex items-center justify-center gap-2 p-2 bg-blue-500 text-white rounded"
          onClick={handleCreateParty}
        >
          <FaLink /> Create Watch Party
        </button>
        {createdCode && (
          <div>
            <div className="mt-2 p-2 bg-gray-100 rounded text-center">
              Watch Party Code: <strong>{createdCode}</strong>
              <button
                className="ml-2 text-red-500 underline"
                onClick={handleLeaveParty}
              >
                Leave Party
              </button>
              {/* <button
                className="ml-2 text-white bg-red-500 px-3 py-1 rounded"
                onClick={handleCloseParty}
              >
                Close Watch Party
              </button> */}
            </div>
            {/*<div>No of participants: {participants.length}</div>*/}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold mt-4">Join a Watch Party</h3>
          <input
            type="text"
            placeholder="Enter party code"
            value={partyCode}
            onChange={(e) => setPartyCode(e.target.value)}
            className="p-2 mb-2 border rounded w-full"
          />
          <button
            className={`w-full flex items-center justify-center gap-2 p-2 text-white rounded ${
              createdCode ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"
            }`}
            onClick={handleJoinParty}
          >
            <FaSignInAlt /> Join Party
          </button>
        </div>
        {/* <div>
          <h3 className="text-lg font-semibold mt-4">Start a Video Call</h3>
          <button
            className="w-full flex items-center justify-center gap-2 p-2 bg-red-500 text-white rounded"
            onClick={handleStartVideoCall}
          >
            <FaVideo /> Start a Video call
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default WatchWithFriends;
