import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  acceptFriendRequest,
  rejectFriendRequest,
} from "../store/friend-slice";
import axios from "../config/axios";
import { confirm } from "./confirm";

const FriendRequests = () => {
  const { friendRequests } = useSelector((state) => state.friend);
  const [receivedData, setReceivedData] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (friendRequests.length > 0) {
      (async () => {
        try {
          const response = await axios.post(
            "/users/searchusers",
            { userIds: friendRequests },
            {
              headers: { Authorization: localStorage.getItem("token") },
            }
          );
          setReceivedData(response.data);
        } catch (err) {
          console.error("Failed to fetch friends' data:", err);
        }
      })();
    }
  }, [friendRequests]);

  const handleAccept = async (id) => {
    try {
      await dispatch(acceptFriendRequest({ id }));
      setReceivedData((prev) => prev.filter((ele) => ele.userId !== id));
    } catch (err) {
      console.error("Failed to accept:", err);
    }
  };

  const handleReject = async (id) => {
    const userConfirm = await confirm(
      "Are you sure you want to reject this request?"
    );
    if (userConfirm) {
      try {
        await dispatch(rejectFriendRequest({ id }));
        setReceivedData((prev) => prev.filter((ele) => ele.userId !== id));
      } catch (err) {
        console.error("Failed to reject:", err);
      }
    }
  };

  return (
    <div>
      {receivedData.map((ele) => (
        <div
          key={ele.userId}
          className="flex flex-col gap-2 md:flex-row justify-between items-center p-2 border rounded-lg shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div>
              <img
                src={ele.image || "/avatar.png"}
                alt="Friend avatar"
                className="w-10 h-10 rounded-full"
              />
            </div>
            <div className="text-[14px] md:flex md:flex-row md:gap-3">
              <div>
                <span className="text-gray-600">username:</span> {ele.username}
              </div>
              <div>
                <span className="text-gray-600">userId:</span> {ele.userId}
              </div>
              <div>
                <span className="text-gray-600">email:</span> {ele.email}
              </div>
            </div>
          </div>

          <div className="flex md:flex-col gap-2">
            <button
              className="border border-green-500 hover:bg-green-500 py-2 px-4 rounded-lg shadow-md shadow-green-600"
              onClick={() => handleAccept(ele.userId)}
            >
              Accept
            </button>
            <button
              className="border border-red-500 hover:bg-red-500 py-2 px-4 rounded-lg shadow-md shadow-red-600"
              onClick={() => handleReject(ele.userId)}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendRequests;
