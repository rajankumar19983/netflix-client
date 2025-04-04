import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { markAsRead } from "../store/notification-slice";
import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const notifications = useSelector((state) => state.notification);
  const unreadCount = notifications?.filter((n) => !n.read).length;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleMarkAsRead = async (id, route) => {
    await dispatch(markAsRead({ id }));
    if (route) navigate(route);
    setIsOpen(false); // Close dropdown after click
  };

  return (
    <div className="relative">
      <FaBell
        className="text-2xl cursor-pointer text-white"
        onClick={() => setIsOpen(!isOpen)}
      />
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
          {unreadCount}
        </span>
      )}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-60 bg-white border border-gray-400 rounded-lg shadow-lg z-50 p-1"
          onMouseLeave={() => setIsOpen(false)}
        >
          {notifications?.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n._id}
                className={`p-2 border-b cursor-pointer ${
                  n.read
                    ? "bg-white hover:bg-gray-400"
                    : "bg-blue-200 hover:bg-blue-300"
                }`}
                onClick={() =>
                  handleMarkAsRead(n._id, `/profile?section=friends`)
                }
              >
                <strong>{n?.type}</strong>: {n?.message}
              </div>
            ))
          ) : (
            <div className="p-2 text-center">No new notifications</div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
