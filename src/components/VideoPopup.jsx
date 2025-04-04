import React, { useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import { twMerge } from "tailwind-merge";
import socket from "../utils/socketInstance.js";
import { useSelector } from "react-redux";

const VideoPopup = ({ show, setShow, videoId, setVideoId }) => {
  const { user } = useSelector((state) => state.user);
  const playerRef = useRef(null);

  const hidePopup = () => {
    setShow(false);
    setVideoId(null);
    const savedCode = localStorage.getItem("watchPartyCode");
    if (savedCode) {
      socket.emit("closeVideo", { roomId: savedCode, userId: user?._id });
    }
  };

  const handlePlay = () => {
    const roomId = localStorage.getItem("watchPartyCode");
    if (roomId) {
      socket.emit("sync-play", {
        roomId,
        userId: user?._id,
        currentTime: playerRef.current.getCurrentTime(),
        timeStamp: Date.now(),
      });
    }
  };

  const handlePause = () => {
    const roomId = localStorage.getItem("watchPartyCode");
    if (roomId) {
      socket.emit("sync-pause", {
        roomId,
        userId: user?._id,
        currentTime: playerRef.current.getCurrentTime(),
        timeStamp: Date.now(),
      });
    }
  };

  useEffect(() => {
    socket.on("mediaSelected", ({ videoId }) => {
      if (videoId === null) {
        setShow(false);
      }
    });
    socket.on("videoClosed", () => {
      setShow(false);
      setVideoId(null);
    });
    socket.on("sync-play", ({ currentTime, timeStamp }) => {
      const latency = (Date.now() - timeStamp) / 1000;
      const correctedTime = currentTime + latency;
      if (playerRef.current) {
        const player = playerRef.current;
        player.seekTo(correctedTime, "seconds");
        player.player.player.play();
      }
    });
    socket.on("sync-pause", ({ currentTime, timeStamp }) => {
      if (playerRef.current) {
        const player = playerRef.current;
        player.seekTo(currentTime, "seconds", false); // Seek to correct frame
        player.player.player.pause();
      }
    });

    // This is preventing 3rd media selection
    // return () => {
    //   socket.off("videoClosed");
    //   socket.off("mediaSelected");
    // };
  }, []);

  return (
    <div
      className={twMerge(
        `flex justify-center items-center w-full h-full fixed top-0 left-0 opacity-0 invisible z-[100] ${
          show ? "opacity-100 visible" : ""
        }`
      )}
    >
      <div
        className={twMerge(
          `absolute top-0 left-0 w-full h-full bg-black/25 backdrop-blur-[3.5px] opacity-0 transition-opacity duration-[400ms] ${
            show ? "opacity-100" : ""
          }`
        )}
        onClick={hidePopup}
      />
      <div
        className={twMerge(
          `relative w-[800px] aspect-[16/9] bg-white scale-[0.2] transition-transform divide-fuchsia-[250ms] ${
            show ? "scale-100" : ""
          }`
        )}
      >
        <div className="absolute -top-5 right-0 items-center gap-2 text-white">
          <span
            className=" cursor-pointer"
            onClick={hidePopup}
          >
            Close
          </span>
        </div>

        <ReactPlayer
          url={`https://www.youtube.com/watch?v=${videoId}`}
          ref={playerRef}
          onPlay={handlePlay}
          onPause={handlePause}
          controls
          width="100%"
          height="100%"
          playing={true}
        />
      </div>
    </div>
  );
};

export default VideoPopup;
