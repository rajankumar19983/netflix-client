import React, { useState, useEffect, useMemo } from "react";
import { LuCamera, LuUpload, LuLoader } from "react-icons/lu";
import { useSelector, useDispatch } from "react-redux";
import { updateUserImage, saveUserImage } from "../store/user-slice";

const ProfileImageUploader = () => {
  const { user, isLoading } = useSelector((state) => state.user);
  const [image, setImage] = useState(user?.image || "/avatar.png");

  const dispatch = useDispatch();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const newImage = reader.result;
        setImage(newImage);
        dispatch(updateUserImage(newImage));
      };
      reader.onerror = () => console.error("Error reading the file");
      reader.readAsDataURL(file);
    }
  };

  const handleSaveImage = async () => {
    if (image && image !== "/avatar.png") {
      const fileInput = document.getElementById("file-upload").files[0];
      if (fileInput) {
        try {
          dispatch(saveUserImage(fileInput));
        } catch (error) {
          console.error("Failed to save image:", error);
        }
      }
    }
  };

  const triggerFileInput = () => {
    document.getElementById("file-upload").click();
  };

  useEffect(() => {
    if (user?.image && user.image !== image) {
      setImage(user.image);
    }
  }, [user?.image]);

  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-lg shadow-md">
      <div className="relative w-32 h-32">
        <img
          src={image}
          alt="Profile"
          className="w-full h-full rounded-full object-cover border"
        />
        <div
          onClick={triggerFileInput}
          className="absolute bottom-0 right-0 bg-gray-700 p-2 rounded-full cursor-pointer hover:bg-gray-600"
        >
          <LuCamera className="w-5 h-5 text-white" />
        </div>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>
      <div className="flex flex-col justify-between md:flex-row flex-wrap gap-6 w-full text-[18px]">
        <div className="w-full md:w-1/2 flex flex-col gap-2">
          <label
            htmlFor=""
            className="font-semibold"
          >
            Username
          </label>
          <input
            type="text"
            value={user.username}
            disabled={true}
            className="h-10 py-2 px-4 rounded-md border border-gray-500 text-[20px] text-black/60"
          />
        </div>
        <div className="w-full md:w-1/2 flex flex-col gap-2">
          <label
            htmlFor=""
            className="font-semibold"
          >
            Email
          </label>
          <input
            type="text"
            value={user.email}
            disabled={true}
            className="h-10 py-2 px-4 rounded-md border border-gray-500 text-[20px] text-black/60"
          />
        </div>
        <div className="w-full md:w-1/2 flex flex-col gap-2">
          <label
            htmlFor=""
            className="font-semibold"
          >
            userId
          </label>
          <input
            type="text"
            value={user.userId}
            disabled={true}
            className="h-10 py-2 px-4 rounded-md border border-gray-500 text-[20px] text-black/60"
          />
        </div>
      </div>
      <button
        onClick={handleSaveImage}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? (
          <LuLoader className="w-4 h-4 animate-spin" />
        ) : (
          <LuUpload className="w-4 h-4" />
        )}
        {isLoading ? "Saving..." : "Save"}
      </button>
    </div>
  );
};

export default ProfileImageUploader;
