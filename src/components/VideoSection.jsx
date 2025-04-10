import React, { useEffect, useState } from "react";
import ContentWrapper from "./ContentWrapper";
import PlayIcon from "./PlayIcon";
import VideoPopup from "./VideoPopup";
import Img from "./LazyLoadImage";
import socket from "../utils/socketInstance";
import { useSelector } from "react-redux";

const VideoSection = ({ data, loading }) => {
  const { user } = useSelector((state) => state.user);
  const [show, setShow] = useState(false);
  const [videoId, setVideoId] = useState(null);

  const loadingSkeleton = () => {
    return (
      <div className="w-[150px] flex-shrink-0 md:w-1/4">
        <div className="w-full aspect-[16/9] rounded-xl mb-[10px] skeleton"></div>
        <div className="h-5 w-full rounded-[10px] mb-[10px] skeleton"></div>
        <div className="h-5 w-3/4 rounded-[10px] skeleton"></div>
      </div>
    );
  };

  const handleVideoClick = (videoId) => {
    const savedCode = localStorage.getItem("watchPartyCode");
    if (savedCode) {
      socket.emit("selectVideo", {
        roomId: savedCode,
        userId: user?._id,
        videoId,
      });
    }

    // return () => {
    //   socket.off("selectVideo");
    // };
  };

  return (
    <div className="relative mb-[50px]">
      <ContentWrapper>
        <div className="text-[24px] text-white mb-[25px]">Official Videos</div>
        {!loading ? (
          <div className="flex gap-[10px] overflow-x-auto -mx-5 px-5 md:gap-5 md:m-0 md:p-0">
            {data?.results?.map((video) => (
              <div
                key={video.id}
                className="cursor-pointer w-[150px] flex-shrink-0 md:w-1/4"
                onClick={() => {
                  setVideoId(video.key);
                  setShow(true);
                  handleVideoClick(video.key);
                }}
              >
                <div className="mb-[15px] relative videoSectionThumbnail">
                  <Img
                    className="w-full block rounded-xl transition-all duration-700 ease-in-out"
                    src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`}
                  />
                  <PlayIcon
                    svgStyles="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50px] h-[50px]"
                    polygonStyles="polygonStyles"
                    circleStyles="circleStyles"
                  />
                </div>
                <div className="text-white text-[14px] leading-5 md:text-[16px] md:leading-6">
                  {video.name}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-[10px] overflow-x-auto -mx-5 px-5 md:gap-5 md:m-0 md:p-0">
            {loadingSkeleton()}
            {loadingSkeleton()}
            {loadingSkeleton()}
            {loadingSkeleton()}
            {loadingSkeleton()}
          </div>
        )}
      </ContentWrapper>
      <VideoPopup
        show={show}
        setShow={setShow}
        videoId={videoId}
        setVideoId={setVideoId}
      />
    </div>
  );
};

export default VideoSection;
