import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { unfriend } from "../store/friend-slice";
import axios from "../config/axios";
import { FaCommentDots } from "react-icons/fa";
import ChatBox from "./ChatBox";
import { confirm } from "./confirm";

const MyFriends = () => {
  const { user } = useSelector((state) => state.user);
  const { friends } = useSelector((state) => state.friend);
  const [friendsData, setFriendsData] = useState([]);
  const [activeChat, setActiveChat] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (friends.length > 0) {
      (async () => {
        try {
          const response = await axios.post(
            "/users/searchusers",
            { userIds: friends },
            {
              headers: { Authorization: localStorage.getItem("token") },
            }
          );
          setFriendsData(response.data);
        } catch (err) {
          console.error("Failed to fetch friends' data:", err);
        }
      })();
    }
  }, [friends]);

  const handleUnfriend = async (id) => {
    const userConfirm = await confirm(
      "Are you sure you want to unfriend this user?"
    );
    if (userConfirm) {
      try {
        await dispatch(unfriend({ id }));
        setFriendsData((prev) => prev.filter((ele) => ele.userId !== id));
      } catch (err) {
        console.error("Failed to unfriend:", err);
      }
    }
  };

  const handleCloseChat = (usedIdToClose) => {
    setActiveChat((prev) =>
      prev.filter((chat) => chat.userId !== usedIdToClose)
    );
  };

  return (
    <div>
      {friendsData.map((ele) => (
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

          <div className="flex gap-5">
            <button
              className="text-blue-500"
              onClick={() =>
                setActiveChat((prev) => {
                  if (prev.some((chat) => chat.userId === ele.userId))
                    return prev;
                  return [...prev, ele];
                })
              }
            >
              <FaCommentDots size={20} />
            </button>
            <button
              className="border border-red-500 hover:bg-red-500 py-2 px-4 rounded-lg shadow-md shadow-red-600"
              onClick={() => handleUnfriend(ele.userId)}
            >
              Unfriend
            </button>
          </div>
        </div>
      ))}
      <div className="flex gap-4 flex-wrap fixed bottom-4 right-4 z-50">
        {activeChat.map((chat) => (
          <ChatBox
            key={chat.userId}
            currentUser={user}
            activeChat={chat}
            closeChat={() => handleCloseChat(chat.userId)}
          />
        ))}
      </div>
    </div>
  );
};

export default MyFriends;
