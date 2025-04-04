import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AddFriend from "./AddFriend";
import MyFriends from "./MyFriends";
import FriendRequests from "./FriendRequests";
import SentRequests from "./SentRequests";

const Friends = () => {
  const tabs = [
    { id: "myfriends", label: "Friends", content: <MyFriends /> },
    {
      id: "sent_requests",
      label: "Sent Requests",
      content: <SentRequests />,
    },
    {
      id: "received_requests",
      label: "Received Requests",
      content: <FriendRequests />,
    },
  ];
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "myfriends";
  const [activeTab, setActiveTab] = useState(initialTab);

  // useEffect(() => {
  //   setSearchParams({ tab: activeTab });
  // }, [searchParams, setSearchParams]);

  return (
    <div className="flex flex-col gap-4">
      <AddFriend />
      <div className="hidden md:flex flex-col gap-4 p-4 border rounded-lg shadow-md">
        <ul className="flex justify-around w-full">
          {tabs.map((tab) => (
            <li
              key={tab.id}
              className="w-full"
            >
              <button
                className={`w-full p-2 text-center ${
                  activeTab === tab.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
        <div>{tabs.find((t) => t.id === activeTab)?.content}</div>
      </div>

      {/* Mobile Accordion */}
      <div className="md:hidden flex flex-col gap-2">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className="border rounded overflow-hidden"
          >
            <button
              className={`w-full text-left p-2 ${
                activeTab === tab.id ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
              onClick={() =>
                setActiveTab((prev) => (prev === tab.id ? null : tab.id))
              }
            >
              {tab.label}
            </button>
            {activeTab === tab.id && (
              <div className="p-2 bg-gray-100">{tab.content}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Friends;
