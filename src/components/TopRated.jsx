import React, { useState } from "react";
import ContentWrapper from "./ContentWrapper";
import SwitchTab from "./SwitchTab";
import useFetch from "../hooks/useFetch";
import Carousel from "./Carousel";

const TopRated = () => {
  const [endPoint, setEndPoint] = useState("movie");
  const { data, loading } = useFetch(`/${endPoint}/toprated`);

  const onTabChange = (tab) => {
    setEndPoint(tab === "Movies" ? "movie" : "tv");
  };

  return (
    <div className="relative mb-[70px]">
      <ContentWrapper className="flex items-center justify-between mb-5">
        <span className="text-[24px] text-white font-normal">Top Rated</span>
        <SwitchTab
          options={["Movies", "TV Series"]}
          onTabChange={onTabChange}
        />
      </ContentWrapper>
      <Carousel
        data={data?.results}
        loading={loading}
        endPoint={endPoint}
      />
    </div>
  );
};

export default TopRated;
