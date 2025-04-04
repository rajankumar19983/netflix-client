import React, { useState, useEffect } from "react";
import { FaUser, FaUsers, FaEnvelope, FaVideo } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import ContentWrapper from "../components/ContentWrapper";
import Account from "../components/Account";
import Friends from "../components/Friends";
import Messages from "../components/Messages";
import WatchWithFriends from "../components/WatchWithFriends";

const Profile = () => {
  const sections = [
    { id: "account", label: "Account", icon: <FaUser size={20} /> },
    { id: "friends", label: "Friends", icon: <FaUsers size={20} /> },
    { id: "messages", label: "Messages", icon: <FaEnvelope size={20} /> },
    {
      id: "watchwithfriends",
      label: "Watch With Friends",
      icon: <FaVideo size={20} />,
    },
  ];

  const [searchParams, setSearchParams] = useSearchParams();
  const initialSection = searchParams.get("section") || "account";
  const [activeSection, setActiveSection] = useState(initialSection);

  useEffect(() => {
    setSearchParams({ section: activeSection });
  }, [activeSection, setSearchParams]);

  const renderContent = () => {
    switch (activeSection) {
      case "account":
        return <Account />;
      case "friends":
        return <Friends />;
      case "messages":
        return <Messages />;
      case "watchwithfriends":
        return <WatchWithFriends />;
      default:
        return null;
    }
  };

  return (
    <div className=" pt-[80px]">
      <ContentWrapper>
        <div className="flex p-4 flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:w-1/4 h-screen bg-gray-100 p-4 rounded-lg md:rounded-r-none md:block overflow-y-scroll">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <ul className="hidden md:block">
              {sections.map((section) => (
                <li
                  key={section.id}
                  className="mb-2"
                >
                  <button
                    className={`w-full flex items-center gap-2 p-2 rounded ${
                      activeSection === section.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    {section.icon} {section.label}
                  </button>
                </li>
              ))}
            </ul>
            {/* Accordion for mobile */}
            <div className="md:hidden">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="mb-2 border-b pb-2"
                >
                  <button
                    className={`w-full flex items-center gap-2 p-2 rounded ${
                      activeSection === section.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                    onClick={() =>
                      setActiveSection((prev) =>
                        prev === section.id ? null : section.id
                      )
                    }
                  >
                    {section.icon} {section.label}
                  </button>
                  {activeSection === section.id && (
                    <div className="p-2">{renderContent()}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="w-full md:w-3/4  hidden md:block">
            <div className="border h-screen p-4 bg-white rounded md:rounded-l-none shadow">
              <h2 className="text-2xl font-semibold mb-2">
                {sections.find((s) => s.id === activeSection)?.label}
              </h2>
              {renderContent()}
            </div>
          </div>
        </div>
      </ContentWrapper>
    </div>
  );
};

export default Profile;
