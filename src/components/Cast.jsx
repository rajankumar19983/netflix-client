import React from "react";
import { useSelector } from "react-redux";
import ContentWrapper from "./ContentWrapper";
import Img from "./LazyLoadImage";

const Cast = ({ data, loading }) => {
  const { url } = useSelector((state) => state.home);

  const skeleton = () => {
    return (
      <div>
        <div className="w-[125px] h-[125px] rounded-[50%] mb-[15px] md:w-[175px] md:h-[175px] md:mb-[25px] skeleton"></div>
        <div className="w-full h-[20px] rounded-[10px] mb-[10px] skeleton"></div>
        <div className="w-3/4 h-[20px] rounded-[10px] mx-auto skeleton"></div>
      </div>
    );
  };

  return (
    <div className="relative mb-[50px]">
      <ContentWrapper>
        <div className="text-[24px] text-white mb-[25px]">Top Cast</div>
        {!loading ? (
          <div className="flex gap-[20px] overflow-y-hidden mx-[-20px] px-[20px] md:m-0 md:p-0">
            {data?.map((item) => {
              let imgUrl = item.profile_path
                ? url.profile + item.profile_path
                : "/avatar.png";
              return (
                <div
                  key={item.id}
                  className="text-center text-white"
                >
                  <div className="w-[125px] h-[125px] rounded-[50%] overflow-hidden mb-[15px] md:w-[175px] md:h-[175px] md:mb-[25px]">
                    <Img
                      src={imgUrl}
                      className="w-full h-full object-cover object-top block"
                    />
                  </div>
                  <div className="text-[14px] leading-5 font-semibold md:text-[18px] md:leading-6">
                    {item.name}
                  </div>
                  <div className="text-[14px] leading-5 opacity-50 md:text-[16px] md:leading-6">
                    {item.character}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex gap-[20px] overflow-y-hidden mx-[-20px] px-[20px] md:m-0 md:p-0">
            {skeleton()}
            {skeleton()}
            {skeleton()}
            {skeleton()}
            {skeleton()}
            {skeleton()}
          </div>
        )}
      </ContentWrapper>
    </div>
  );
};

export default Cast;
