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
import ringtone from "../assets/ringtone.mp3";
import callertune from "../assets/callertune.mp3";
import toast from "react-hot-toast";

const ChatBox = ({ userId, username, activeChat, closeChat }) => {
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [messageInput, setMessageInput] = useState("");
  const [isCalling, setIsCalling] = useState(false);
  const [currentCallId, setCurrentCallId] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callStatus, setCallStatus] = useState(""); // "calling", "rejected", "unanswered"
  const ringtoneRef = useRef(new Audio(ringtone));
  const callertuneRef = useRef(new Audio(callertune));
  let callTimeout = useRef(null);
  const chatBoxRef = useRef();
  const scrollToBottomRef = useRef();

  // load messages
  const loadMessages = async (currentPage) => {
    if (!hasMore) return;
    try {
      const res = await axios.get(
        `/chat/history/${userId}/${activeChat._id}?page=${currentPage}`,
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
      if (data.receiverId === userId && activeChat) {
        socket.emit("markAsRead", {
          senderId: activeChat._id,
          receiverId: userId,
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
      (msg) => msg.receiverId === userId && msg.status === "delivered"
    );

    if (unreadMessages.length > 0) {
      console.log("📢 Emitting markAsRead event..."); // ✅ Debugging output
      socket.emit("markAsRead", {
        senderId: activeChat._id,
        receiverId: userId,
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
        senderId: userId,
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
  // Handle incoming call
  useEffect(() => {
    socket.on("incomingCall", ({ callerId, username, callId }) => {
      setIncomingCall({ callerId, username, callId });
      setCallStatus("");
      // playing ringtone for receiver
      ringtoneRef.current.loop = true;
      ringtoneRef.current.play();

      callTimeout.current = setTimeout(() => {
        rejectCall();
      }, 30000);
    });
    socket.on("callRejected", ({ callId }) => {
      stopSounds();
      setIsCalling(false);
      setIncomingCall(null);
      if (callStatus === "calling") setCallStatus("rejected");
      toast.error(`${activeChat.username} rejected your call!`);
    });
    socket.on("callAccepted", ({ receiverId, callId }) => {
      stopSounds();
      setIsCalling(false);
      setCallStatus("");
      console.log("Call accepted by:", receiverId);
      // Open video call modal here (WebRTC integration)
    });
    socket.on("callEnded", ({ callId }) => {
      stopSounds();
      setIsCalling(false);
      setCallStatus("ended");
      setIncomingCall(null);
    });

    return () => {
      socket.off("incomingCall");
      socket.off("callRejected");
      socket.off("callAccepted");
      socket.off("callEnded");
    };
  }, []);

  const stopSounds = () => {
    ringtoneRef.current.pause();
    ringtoneRef.current.currentTime = 0;
    callertuneRef.current.pause();
    callertuneRef.current.currentTime = 0;
    clearTimeout(callTimeout.current);
  };

  // Handle calling a user
  const startCall = () => {
    if (isCalling) return; //prevent multiple calls
    setIsCalling(true);
    setCallStatus("calling");
    const callId = `${userId}-${activeChat._id}-${Date.now()}`;
    socket.emit("callUser", {
      callerId: userId,
      username,
      receiverId: activeChat._id,
      callId,
    });
    setCurrentCallId(callId);

    // playing caller tune for caller
    callertuneRef.current.loop = true;
    callertuneRef.current.play();

    // Auto-end call if not answered in 30 sec
    callTimeout.current = setTimeout(() => {
      endCall(callId);
      setCallStatus("unanswered");
      toast.error(`${activeChat.username} did not answer!`);
    }, 30000);
  };

  // Accept an incoming call
  const acceptCall = () => {
    if (!incomingCall) return;
    socket.emit("acceptCall", {
      callerId: incomingCall.callerId,
      receiverId: userId,
      callId: incomingCall.callId,
    });
    setIncomingCall(null);
    stopSounds();
    // Open video call modal here (WebRTC integration)
  };

  // Reject an incoming call
  const rejectCall = () => {
    if (!incomingCall) return;
    socket.emit("rejectCall", {
      callerId: incomingCall.callerId,
      receiverId: userId,
      callId: incomingCall.callId,
    });
    stopSounds();
    setIncomingCall(null);
  };

  // End the call
  const endCall = () => {
    socket.emit("endCall", {
      callId: currentCallId,
    });
    stopSounds();
    setIsCalling(false);
    setIncomingCall(null);
  };

  return (
    <div className="fixed bottom-4 right-4 w-72 bg-white shadow-lg rounded border z-[100]">
      <div className="bg-blue-500 text-white flex justify-between border-b py-2 px-4">
        <h3 className="font-semibold">{activeChat.username}</h3>
        <button onClick={startCall}>{<BsCameraVideoFill />}</button>
        <button onClick={() => closeChat()}>✖</button>
      </div>
      {/* Outgoing call UI */}
      {isCalling && (
        <div className="absolute top-0 left-0 w-full bg-blue-300 p-4 flex flex-col gap-2 items-center shadow-lg">
          <p>Calling {activeChat.username}...</p>
          <button
            onClick={endCall}
            className="text-red-500 border-2 border-red-500 rounded-full p-2 hover:bg-red-500 hover:text-white hover:animate-pulse"
          >
            <BsTelephoneX size={24} />
          </button>
        </div>
      )}

      {/* Incoming call UI */}
      {incomingCall && (
        <div className="absolute top-0 left-0 w-full bg-blue-300 p-4 flex flex-col items-center shadow-lg">
          <p>{incomingCall.username} is calling...</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={acceptCall}
              className="text-green-500 border-2 border-green-500 rounded-full p-2 hover:bg-green-500 hover:text-white hover:animate-pulse"
            >
              <BsTelephoneFill size={24} />
            </button>
            <button
              onClick={rejectCall}
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
              msg.senderId === userId ? "sent" : "received"
            }`}
          >
            <p>{msg.message}</p>
            {msg.senderId === userId && (
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
