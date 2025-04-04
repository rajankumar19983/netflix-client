import React, { useState } from "react";
import ContentWrapper from "./ContentWrapper";
import SwitchTab from "./SwitchTab";
import Carousel from "./Carousel";
import useFetch from "../hooks/useFetch";

const Popular = () => {
  const [endPoint, setEndPoint] = useState("movie");
  const { data, loading } = useFetch(`/${endPoint}/popular`);

  const onTabChange = (tab) => {
    setEndPoint(tab === "Movies" ? "movie" : "tv");
  };

  return (
    <div className="relative mb-[70px]">
      <ContentWrapper className="flex items-center justify-between mb-5">
        <span className="text-[24px] text-white font-normal">
          What's Popular
        </span>
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

export default Popular;
