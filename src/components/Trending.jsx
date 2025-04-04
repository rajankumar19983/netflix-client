import React, { useState } from "react";
import ContentWrapper from "./ContentWrapper";
import SwitchTab from "./SwitchTab";
import Carousel from "./Carousel";
import useFetch from "../hooks/useFetch";

const Trending = () => {
  const [endPoint, setEndPoint] = useState("day");
  const { data, loading } = useFetch(`/category/trending/${endPoint}`);

  const onTabChange = (tab) => {
    setEndPoint(tab === "Day" ? "day" : "week");
  };

  return (
    <div className="relative mb-[70px]">
      <ContentWrapper className="flex items-center justify-between mb-5">
        <span className="text-[24px] text-white font-normal">Trending</span>
        <SwitchTab
          options={["Day", "Week"]}
          onTabChange={onTabChange}
        />
      </ContentWrapper>
      <Carousel
        data={data?.results}
        loading={loading}
      />
    </div>
  );
};

export default Trending;
