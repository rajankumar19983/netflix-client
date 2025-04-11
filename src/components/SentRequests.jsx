import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { revokeFriendRequest } from "../store/friend-slice";
import axios from "../config/axios";
import { confirm } from "./confirm.jsx";

const SentRequests = () => {
  const { sentRequests } = useSelector((state) => state.friend);
  const [sentData, setSentData] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (sentRequests.length > 0) {
      (async () => {
        try {
          const response = await axios.post(
            "/users/searchusers",
            { userIds: sentRequests },
            {
              headers: { Authorization: localStorage.getItem("token") },
            }
          );
          setSentData(response.data);
        } catch (err) {
          console.error("Failed to fetch friends' data:", err);
        }
      })();
    }
  }, [sentRequests]);

  const handleRevoke = async (id) => {
    const userConfirm = await confirm(
      "Are you sure you want to revoke this friend request?"
    );
    if (userConfirm) {
      try {
        await dispatch(revokeFriendRequest({ id }));
        setSentData((prev) => prev.filter((ele) => ele.userId !== id));
      } catch (err) {
        console.error("Failed to revoke:", err);
      }
    }
  };

  return (
    <div>
      {sentData.map((ele) => (
        <div
          key={ele.userId}
          className="flex flex-col md:flex-row gap-2 justify-between items-center p-2 border rounded-lg shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div>
              <img
                src={ele.image || "/avatar.png"}
                alt="Friend avatar"
                className="w-10 h-10 rounded-full"
              />
            </div>
            <div className="text-[14px] md:flex md:flex-row md:gap-5">
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

          <button
            className="border border-red-500 hover:bg-red-500 py-2 px-4 rounded-lg shadow-md shadow-red-600"
            onClick={() => handleRevoke(ele.userId)}
          >
            Revoke
          </button>
        </div>
      ))}
    </div>
  );
};

export default SentRequests;
