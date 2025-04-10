import React, { useState, useEffect, useRef } from "react";
import axios from "../config/axios";
import socket from "../utils/socketInstance.js";
import {
  BsCheck,
  BsCheckAll,
  BsClock,
  BsCameraVideoFill,
  BsTelephoneX,
  BsTelephoneFill,
} from "react-icons/bs";
import {
  startCall,
  acceptCall,
  rejectCall,
  endCall,
} from "../store/call-Slice.js";
import { useDispatch, useSelector } from "react-redux";

const ChatBox = ({ currentUser, activeChat, closeChat }) => {
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [messageInput, setMessageInput] = useState("");
  const chatBoxRef = useRef();
  const scrollToBottomRef = useRef();

  const callInfo = useSelector((state) => state.call.callInfo);
  const caller = callInfo?.caller;
  const receiver = callInfo?.receiver;
  const status = callInfo?.status;
  const isIncoming = status === "incoming";
  const isOngoing = status === "in-call";
  const isCalling = status === "calling";

  const displayName = isIncoming ? caller?.username : receiver?.username;

  const dispatch = useDispatch();

  // load messages
  const loadMessages = async (currentPage) => {
    if (!hasMore) return;
    try {
      const res = await axios.get(
        `/chat/history/${currentUser._id}/${activeChat._id}?page=${currentPage}`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      if (res.data.length < 20) setHasMore(false);
      setMessages((prev) => [...res.data, ...prev]);
      setPage(currentPage);
      setTimeout(() => scrollToBottom(), 0); // Scroll after rendering messages
    } catch (err) {
      console.log("Error fetching messages:", err);
    }
  };
  // load more messages
  const handleScroll = () => {
    if (chatBoxRef.current.scrollTop === 0 && hasMore) {
      loadMessages(page + 1);
    }
  };
  // load initial messages
  useEffect(() => {
    loadMessages(1);
    setTimeout(() => scrollToBottom(), 0);
  }, [activeChat]);
  // scroll to latest messages function
  const scrollToBottom = () => {
    if (scrollToBottomRef.current) {
      scrollToBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  // scroll to latest message
  useEffect(() => {
    // Scroll to bottom when messages update
    scrollToBottom();
  }, [messages]);
  // on messageStatusUpdate
  useEffect(() => {
    socket.on("messageStatusUpdate", ({ messageId, status }) => {
      setMessages((prevMessages) => {
        const updatedMessages = prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, status } : msg
        );
        return [...updatedMessages];
      });
    });
    return () => socket.off("messageStatusUpdate");
  }, []);
  // on messageReceived
  useEffect(() => {
    socket.on("messageReceived", (data) => {
      setMessages((prev) => {
        const exists = prev.some((msg) => msg._id === data._id);
        if (exists) return prev;
        return [...prev, data];
      });
      // ✅ Emit "markAsRead" immediately if the receiver is seeing the chat
      if (data.receiverId === currentUser._id && activeChat) {
        socket.emit("markAsRead", {
          senderId: activeChat._id,
          receiverId: currentUser._id,
        });
      }
    });

    return () => {
      socket.off("messageReceived");
    };
  }, []);
  // emit markAsRead
  useEffect(() => {
    if (!activeChat || messages.length === 0) return; // ✅ Early return for efficiency

    const unreadMessages = messages.filter(
      (msg) => msg.receiverId === currentUser._id && msg.status === "delivered"
    );

    if (unreadMessages.length > 0) {
      socket.emit("markAsRead", {
        senderId: activeChat._id,
        receiverId: currentUser._id,
      });
    }
  }, [messages, activeChat]);
  // ticks based on message status
  const getMessageStatusIcon = (status) => {
    switch (status) {
      case "sent":
        return <BsCheck color="gray" />;
      case "delivered":
        return <BsCheckAll color="gray" />;
      case "read":
        return <BsCheckAll color="blue" />;
      default:
        return <BsClock color="gray" />;
    }
  };
  // emit sendMessage
  const sendMessage = () => {
    if (messageInput.trim() && activeChat) {
      const messageData = {
        senderId: currentUser._id,
        receiverId: activeChat._id,
        message: messageInput,
      };
      socket.emit("sendMessage", messageData, (savedMessage) => {
        setMessages((prev) => [...prev, savedMessage]);
      });
      setMessageInput("");
      setTimeout(() => scrollToBottom(), 0); // Scroll after sending
    }
  };

  const makeCall = () => {
    dispatch(
      startCall({
        caller: {
          id: currentUser._id,
          username: currentUser.username,
          avatar: currentUser.image,
        },
        receiver: {
          id: activeChat._id,
          username: activeChat.username,
          avatar: activeChat.image,
        },
      })
    );
  };

  return (
    <div className="bottom-4 right-4 w-72 bg-white shadow-lg rounded border z-[100]">
      <div className="bg-blue-500 text-white flex justify-between border-b py-2 px-4">
        <h3 className="font-semibold">{activeChat.username}</h3>
        <button onClick={makeCall}>{<BsCameraVideoFill />}</button>
        <button onClick={closeChat}>✖</button>
      </div>
      {/* Outgoing call UI */}
      {isCalling && (
        <div className="absolute top-0 left-0 w-72 bg-blue-300 p-4 flex flex-col gap-2 items-center shadow-lg">
          <p>Calling {displayName}...</p>
          <button
            onClick={() => dispatch(endCall())}
            className="text-red-500 border-2 border-red-500 rounded-full p-2 hover:bg-red-500 hover:text-white hover:animate-pulse"
          >
            <BsTelephoneX size={24} />
          </button>
        </div>
      )}

      {/* Incoming call UI */}
      {isIncoming && (
        <div className="absolute top-0 left-0 w-full bg-blue-300 p-4 flex flex-col items-center shadow-lg">
          <p>{displayName} is calling...</p>
          <div className="flex gap-2 mt-2">
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
      )}

      <div
        className="h-60 overflow-y-auto p-2 flex flex-col"
        ref={chatBoxRef}
        onScroll={handleScroll}
      >
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`message${
              msg.senderId === currentUser._id ? "sent" : "received"
            }`}
          >
            <p>{msg.message}</p>
            {msg.senderId === currentUser._id && (
              <div className="text-end">
                <span className="inline-flex items-center ml-1 text-[16px]">
                  {getMessageStatusIcon(msg.status)}
                </span>
              </div>
            )}
          </div>
        ))}
        {/* Invisible div to scroll to bottom */}
        <div ref={scrollToBottomRef}></div>
      </div>
      <input
        type="text"
        placeholder="Type a message"
        className="border-none p-2 text-[14px] w-full rounded-xl outline-none bg-zinc-100"
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />
    </div>
  );
};

export default ChatBox;
