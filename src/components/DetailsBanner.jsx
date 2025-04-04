import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import ContentWrapper from "./ContentWrapper";
import useFetch from "../hooks/useFetch";
import Genres from "./Genres";
import CircleRating from "./CircleRating";
import Img from "./LazyLoadImage";
import dayjs from "dayjs";
import PlayIcon from "./PlayIcon";
import VideoPopup from "./VideoPopup";
import socket from "../utils/socketInstance";

const DetailsBanner = ({ video, crew }) => {
  const rowStyle = "w-full h-[25px] mb-5 rounded-[50px]";
  const { user } = useSelector((state) => state.user);
  const [show, setShow] = useState(false);
  const [videoId, setVideoId] = useState(null);

  const { mediaType, id } = useParams();
  const { data, loading } = useFetch(`/${mediaType}/${id}`);

  const { url } = useSelector((store) => store.home);

  const _genres = data?.genres.map((g) => g.id);
  const director = crew?.filter((c) => c.job === "Director");
  const writer = crew?.filter(
    (c) => c.job === "Screenplay" || c.job === "Writer"
  );

  const toHoursAndMinutes = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`;
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
  };

  useEffect(() => {
    socket.on("videoSelected", ({ videoId }) => {
      setShow(true);
      setVideoId(videoId); // Update video popup
    });

    // return () => {
    //   console.log("Closing listeners in DetailsBanner.jsx");
    //   socket.off("videoSelected");
    // };
  }, []);

  return (
    <div className="w-full bg-dark_1 pt-[100px] mb-[50px] md:mb-0 md:pt-[120px] md:min-h-[700px]">
      {!loading ? (
        <>
          {!!data && (
            <React.Fragment>
              <div className="w-full h-full absolute top-0 left-0 opacity-10 overflow-hidden">
                <Img
                  className="w-full h-full object-cover object-center"
                  src={url.backdrop + data.backdrop_path}
                />
              </div>
              <div className="hero_opac_layer w-full h-[250px] absolute bottom-0 left-0" />
              <ContentWrapper>
                <div className="flex flex-col gap-[25px] relative md:gap-[50px] md:flex-row">
                  <div className="flex-shrink-0">
                    {data.poster_path ? (
                      <Img
                        className="w-full block rounded-xl md:max-w-[350px]"
                        src={url.backdrop + data.poster_path}
                      />
                    ) : (
                      <Img
                        className="w-full block rounded-xl md:max-w-[350px]"
                        src="/no-poster.png"
                      />
                    )}
                  </div>
                  <div className="text-white">
                    <div className="text-[28px] leading-10 md:text-[34px] md:leading-[44px]">
                      {`${data.name || data.title} (${dayjs(
                        data.release_date
                      ).format("YYYY")})`}
                    </div>
                    <div className="text-[16px] leading-6 mb-[15px] italic opacity-50 md:text-[20px] md:leading-7">
                      {data.tagline}
                    </div>
                    <Genres
                      className="mb-[25px] flex flex-wrap"
                      data={_genres}
                    />
                    <div className="flex items-center gap-[25px] mb-[25px]">
                      <CircleRating
                        className="max-w-[70px] bg-dark_2 md:max-w-[90px]"
                        rating={data.vote_average.toFixed(1)}
                        textColor={"white"}
                      />
                      {video?.key && (
                        <div
                          className="flex items-center gap-5 cursor-pointer playIcon"
                          onClick={() => {
                            setShow(true);
                            setVideoId(video.key);
                            handleVideoClick(video.key);
                          }}
                        >
                          <PlayIcon
                            svgStyles="w-[60px] md:w-20"
                            polygonStyles="polygonStyles"
                            circleStyles="circleStyles"
                          />
                          <span className="text-[20px] transition-all duration-700 ease-in-out">
                            Watch Trailer
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mb-[25px]">
                      <div className="text-[24px] mb-[10px]">Overview</div>
                      <div className="leading-6 md:pr-[100px]">
                        {data.overview}
                      </div>
                    </div>
                    <div className="border-b border-white border-opacity-10 py-[15px] flex">
                      {data.status && (
                        <div className="mr-[10px] flex flex-wrap">
                          <span className="mr-[10px] leading-6 font-semibold opacity-100">
                            Status:{" "}
                          </span>
                          <span className="mr-[10px] opacity-50 leading-6">
                            {data.status}
                          </span>
                        </div>
                      )}
                      {data.release_date && (
                        <div className="mr-[10px] flex flex-wrap">
                          <span className="mr-[10px] leading-6 font-semibold opacity-100">
                            Release Date:{" "}
                          </span>
                          <span className="mr-[10px] opacity-50 leading-6">
                            {dayjs(data.release_date).format("MMM D, YYYY")}
                          </span>
                        </div>
                      )}
                      {!!data.runtime && (
                        <div className="mr-[10px] flex flex-wrap">
                          <span className="mr-[10px] leading-6 font-semibold opacity-100">
                            Runtime:{" "}
                          </span>
                          <span className="mr-[10px] opacity-50 leading-6">
                            {toHoursAndMinutes(data.runtime)}
                          </span>
                        </div>
                      )}
                    </div>
                    {director?.length > 0 && (
                      <div className="border-b border-white border-opacity-10 py-[15px] flex">
                        <span className="mr-[10px] leading-6 font-semibold opacity-100">
                          Director:
                        </span>
                        <span className="mr-[10px] opacity-50 leading-6">
                          {director.map((d, i) => (
                            <span key={i}>
                              {d.name}
                              {director?.length - 1 !== i && ", "}
                            </span>
                          ))}
                        </span>
                      </div>
                    )}
                    {writer?.length > 0 && (
                      <div className="border-b border-white border-opacity-10 py-[15px] flex">
                        <span className="mr-[10px] leading-6 font-semibold opacity-100">
                          Writer:
                        </span>
                        <span className="mr-[10px] opacity-50 leading-6">
                          {writer.map((w, i) => (
                            <span key={i}>
                              {w.name}
                              {writer?.length - 1 !== i && ", "}
                            </span>
                          ))}
                        </span>
                      </div>
                    )}
                    {data?.created_by?.length > 0 && (
                      <div className="border-b border-white border-opacity-10 py-[15px] flex">
                        <span className="mr-[10px] leading-6 font-semibold opacity-100">
                          Creator:
                        </span>
                        <span className="mr-[10px] opacity-50 leading-6">
                          {data?.created_by?.map((c, i) => (
                            <span key={i}>
                              {c.name}
                              {data?.created_by?.length - 1 !== i && ", "}
                            </span>
                          ))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <VideoPopup
                  show={show}
                  setShow={setShow}
                  videoId={videoId}
                  setVideoId={setVideoId}
                />
              </ContentWrapper>
            </React.Fragment>
          )}
        </>
      ) : (
        <div className="flex relative flex-col gap-[25px] md:gap[50px] md:flex-row">
          <ContentWrapper className="flex gap-[50px]">
            <div className="flex-shrink-0 w-full block rounded-xl aspect-[1/1.5] md:max-w-[350px] skeleton"></div>
            <div className="w-full">
              <div className={`${rowStyle} skeleton`}></div>
              <div className={`${rowStyle} skeleton`}></div>
              <div className={`${rowStyle} w-3/4 mb-[50px] skeleton`}></div>
              <div className={`${rowStyle} skeleton`}></div>
              <div className={`${rowStyle} skeleton`}></div>
              <div className={`${rowStyle} w-1/2 mb-[50px] skeleton`}></div>
              <div className={`${rowStyle} skeleton`}></div>
            </div>
          </ContentWrapper>
        </div>
      )}
    </div>
  );
};

export default DetailsBanner;
