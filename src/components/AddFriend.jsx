import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "../config/axios";
import {
  fetchFriendsData,
  sendFriendRequest,
  revokeFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  unfriend,
} from "../store/friend-slice";
import toast from "react-hot-toast";
import { FaUserCheck, FaUserPlus, FaUserTimes } from "react-icons/fa";

const AddFriend = () => {
  const [id, setId] = useState("");
  const [user, setUser] = useState(null);
  const dispatch = useDispatch();

  const { friends, friendRequests, sentRequests } = useSelector(
    (state) => state.friend
  );
  const handleSearch = async (e) => {
    if (id.trim().length === 6) {
      const formData = {
        userId: id,
      };
      try {
        const response = await axios.post("/users/searchuser", formData, {
          headers: { Authorization: localStorage.getItem("token") },
        });
        setUser(response.data);
      } catch (err) {}
    } else {
      toast.error("Invalid User Id");
    }
  };

  const handleSendRequest = () => {
    if (!sentRequests.includes(user.userId)) {
      toast.dismiss();
      dispatch(sendFriendRequest({ id: user.userId }));
      setId("");
    } else {
      toast.dismiss();
      dispatch(revokeFriendRequest({ id: user.userId }));
    }
  };

  useEffect(() => {
    const res = dispatch(fetchFriendsData());
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg shadow-md">
      <div>
        <p className="text-[18px]">Add Friends by unique Id</p>
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            placeholder="A1B2C3 (6 characters)"
            className="border border-gray-500 focus:outline-none p-2 max-w-48 mt-2 rounded-lg "
            value={id}
            onChange={(e) => setId(e.target.value)}
            maxLength={6}
          />
          <button
            className="mt-2 bg-blue-500 text-white p-2 rounded max-w-48"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>

      {user?.email && (
        <div className="flex gap-2 items-center text-[14px] bg-gray-200 p-1 relative top-2 -left-2 rounded-lg max-w-max animate-[mobileMenu_0.3s_ease_forwards]">
          <div>
            <img
              src={user?.image || "/avatar.png"}
              alt="user image"
              className="w-10 h-10 rounded-full"
            />
          </div>
          <div>
            <p>
              <span className="font-semibold">username:</span> {user?.username}
            </p>
            <p>
              <span className="font-semibold">email:</span> {user?.email}
            </p>
          </div>
          {/* already friends */}
          {friends?.includes(user.userId) && (
            <div className="flex">
              <FaUserCheck
                size={20}
                className="m-4 text-green-500"
                title="Friends"
              />
              <FaUserTimes
                size={20}
                className="m-4 text-red-500 cursor-pointer"
                title="Unfriend?"
                onClick={() => dispatch(unfriend({ id: user.userId }))}
              />
            </div>
          )}
          {/* friend request sent */}
          {sentRequests && sentRequests.includes(user.userId) && (
            <div>
              <FaUserPlus
                size={20}
                className={`m-4  cursor-pointer ${
                  sentRequests.includes(user.userId) ? "text-blue-500" : ""
                }`}
                onClick={handleSendRequest}
                title={`${
                  sentRequests.includes(user.userId)
                    ? "Request Already Sent!"
                    : "Send Request"
                }`}
              />
            </div>
          )}
          {/* friend request received */}
          {friendRequests && friendRequests.includes(user.userId) && (
            <div className="flex gap-2">
              <button
                className="bg-green-500 rounded-lg px-2 py-1"
                onClick={() => {
                  dispatch(acceptFriendRequest({ id: user?.userId }));
                }}
              >
                Accept
              </button>
              <button
                className="bg-red-500 rounded-lg px-2 py-1"
                onClick={() => {
                  dispatch(rejectFriendRequest({ id: user?.userId }));
                }}
              >
                Reject
              </button>
            </div>
          )}
          {!friends?.includes(user.userId) &&
            !sentRequests?.includes(user.userId) &&
            !friendRequests?.includes(user.userId) && (
              <div>
                <FaUserPlus
                  size={20}
                  className={`m-4  cursor-pointer`}
                  onClick={handleSendRequest}
                  title="Send Request"
                />
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default AddFriend;
