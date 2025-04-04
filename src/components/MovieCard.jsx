import React from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Img from "./LazyLoadImage";
import CircleRating from "./CircleRating";
import Genres from "./Genres";
import { twMerge } from "tailwind-merge";

const MovieCard = ({ data, fromSearch, mediaType }) => {
  const { url } = useSelector((store) => store.home);
  const navigate = useNavigate();

  const posterUrl = data?.poster_path
    ? url.poster + data.poster_path
    : "/no-poster.png";

  return (
    <div
      className="w-50%-5px mb-[25px] cursor-pointer flex-shrink-0 md:w-25%-15px lg:w-20%-16px"
      onClick={() => navigate(`/${data?.media_type || mediaType}/${data.id}`)}
    >
      <div
        className={twMerge(
          "relative w-full aspect-[1/1.5] bg-cover bg-center mb-[30px] flex items-end justify-between p-[10px] transition-all duration-500 ease-in-out movieCardPosterBlock"
        )}
      >
        <Img
          src={posterUrl}
          className="w-full h-full object-cover object-center"
        />
        {!fromSearch && (
          <React.Fragment>
            <CircleRating
              className={
                "w-10 h-10 relative top-[30px] bg-white flex-shrink-0 md:w-[50px] md:h-[50px]"
              }
              rating={data.vote_average.toFixed(1)}
              textColor="#04152d"
            />
            <Genres
              className={"hidden relative md:flex md:flex-wrap md:justify-end"}
              data={data.genre_ids.slice(0, 2)}
            />
          </React.Fragment>
        )}
      </div>
      <div className="textBlock text-white flex flex-col">
        <span className="text-[16px] mb-[10px] leading-6 md:text-[20px] line-clamp-1 overflow-hidden">
          {data.title || data.name}
        </span>
        <span className="text-[14px] opacity-50">
          {dayjs(data.release_date).format("MMM D, YYYY")}
        </span>
      </div>
    </div>
  );
};

export default MovieCard;
