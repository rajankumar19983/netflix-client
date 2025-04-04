import React, { useEffect } from "react";
import useFetch from "../hooks/useFetch";
import { useParams } from "react-router-dom";
import DetailsBanner from "../components/DetailsBanner";
import Cast from "../components/Cast";
import VideoSection from "../components/VideoSection";
import Similar from "../components/Similar";
import Recommendation from "../components/Recommendation";
import socket from "../utils/socketInstance";
import { useSelector } from "react-redux";

const Details = () => {
  const { mediaType, id } = useParams();
  const { data, loading } = useFetch(`/${mediaType}/${id}/videos`);
  const { data: credits, loading: creditsLoading } = useFetch(
    `/${mediaType}/${id}/credits`
  );
  const { user } = useSelector((state) => state.user);

  const trailerLabels = ["Official Trailer", "Original Trailer", "Trailer"];

  const checkTrailerLabel = (mediaName, labels) => {
    return labels.some((label) => mediaName.includes(label));
  };

  const trailerData = data?.results?.filter((r) => {
    return checkTrailerLabel(r.name, trailerLabels);
  });

  useEffect(() => {
    const savedCode = localStorage.getItem("watchPartyCode");
    if (savedCode) {
      socket.emit("selectMedia", {
        roomId: savedCode,
        userId: user?._id,
        mediaType,
        mediaId: id,
        // videoId: null,
      });
    }

    // return () => {
    //   console.log("Closing listeners in Details.jsx");
    //   socket.off("selectMedia");
    // };
  }, [id]);

  return (
    <div>
      <DetailsBanner
        video={trailerData?.[0]}
        crew={credits?.crew}
      />
      <Cast
        data={credits?.cast}
        loading={creditsLoading}
      />
      <VideoSection
        data={data}
        loading={loading}
      />
      <Similar
        mediaType={mediaType}
        id={id}
      />
      <Recommendation
        mediaType={mediaType}
        id={id}
      />
    </div>
  );
};

export default Details;
