import React, { useState, useEffect, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useParams } from "react-router-dom";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import useFetch from "../hooks/useFetch";
import ContentWrapper from "../components/ContentWrapper";
import MovieCard from "../components/MovieCard";
import Spinner from "../components/Spinner";
import Img from "../components/LazyLoadImage";
import { useSelector, useDispatch } from "react-redux";
import { fetchMedia, resetData } from "../store/explorePage-slice";

// filters is outside so that on adding select type, it does not reset
let filters = {};

const sortByData = [
  { value: "popularity.desc", label: "Popularity High to Low" },
  { value: "popularity.asc", label: "Popularity Low to High" },
  { value: "vote_average.desc", label: "Rating High to Low" },
  { value: "vote_average.asc", label: "Rating Low to High" },
  {
    value: "primary_release_date.desc",
    label: "Release Date Descending",
  },
  { value: "primary_release_date.asc", label: "Release Date Ascending" },
  { value: "original_title.asc", label: "Title (A-Z)" },
];

const Explore = () => {
  const selectRef = useRef(null);

  useEffect(() => {
    if (selectRef.current) {
      const valueContainer = selectRef.current.querySelector(
        ".react-select__value-container"
      );
      if (valueContainer) {
        valueContainer.scrollTop = valueContainer.scrollHeight;
      }
    }
  });

  const [genre, setGenre] = useState(null);
  const [sortBy, setSortBy] = useState(null);
  const { mediaType } = useParams();

  const dispatch = useDispatch();

  const { data: genresData } = useFetch(`/config/genres`);
  const { data, loading, pageNum } = useSelector((state) => state.explore);

  useEffect(() => {
    filters = {};
    dispatch(resetData());
    setSortBy(null);
    setGenre(null);
    dispatch(fetchMedia({ mediaType, pageNum: 1 }));
  }, [mediaType, dispatch]);

  const loadMore = () => {
    dispatch(fetchMedia({ mediaType, pageNum }));
  };

  const onSelectChange = (selectedItems, action) => {
    if (action.name === "sortby") {
      setSortBy(selectedItems);
      if (action.action !== "clear") {
        filters.sort_by = selectedItems.value;
      } else {
        delete filters.sort_by;
      }
    }
    if (action.name === "genres") {
      setGenre(selectedItems);
      if (action.action !== "clear") {
        let genreId = selectedItems.map((g) => g.id);
        genreId = JSON.stringify(genreId).slice(1, -1);
        filters.with_genres = genreId;
      } else {
        delete filters.with_genres;
      }
    }
    dispatch(resetData());
    dispatch(fetchMedia({ mediaType, pageNum: 1, filters }));
  };
  return (
    <div className="min-h-[700px] pt-[100px]">
      <ContentWrapper>
        <div className="flex justify-between mb-[25px] flex-col md:flex-row">
          <div className="text-[24px] leading-[34px] text-white mb-[20px] md:mb-0">
            {mediaType === "tv" ? "Explore TV Shows" : "Explore Movies"}
          </div>
          <div
            className="flex gap-[10px] flex-col md:flex-row"
            ref={selectRef}
          >
            <Select
              isMulti
              name="genres"
              value={genre}
              closeMenuOnSelect={true}
              options={genresData ? Object.values(genresData) : []}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.id}
              onChange={onSelectChange}
              placeholder="Select genres"
              className="react-select-container genresDD"
              classNamePrefix="react-select"
            />
            <Select
              name="sortby"
              value={sortBy}
              options={sortByData}
              onChange={onSelectChange}
              isClearable={true}
              placeholder="Sort By"
              className="react-select-container sortByDD"
              classNamePrefix="react-select"
            />
          </div>
        </div>
        {loading && !data ? (
          <Spinner initial={true} />
        ) : data?.results?.length > 0 ? (
          <InfiniteScroll
            className="flex flex-wrap gap-[10px] mb-[50px] md:gap-5"
            dataLength={data?.results?.length || []}
            next={loadMore}
            hasMore={pageNum <= data?.total_pages}
            loader={<Spinner initial={true} />}
          >
            {data?.results?.map((item, index) => {
              if (item.mediaType === "person") return;
              return (
                <MovieCard
                  className="explorePageMovieCard relative"
                  key={index}
                  data={item}
                  mediaType={mediaType}
                />
              );
            })}
          </InfiniteScroll>
        ) : (
          <div className="flex flex-col">
            <span className="text-[24px] text-dark_light">
              Sorry, Results Not Found
            </span>
            <div className="flex justify-center items-center w-full h-[600px] py-[100px] md:py-0">
              <Img
                className={"w-1/2 min-w-[250px] mx-auto my-auto md:mt-[-10px]"}
                src={"/no-results.png"}
              />
            </div>
          </div>
        )}
      </ContentWrapper>
    </div>
  );
};

export default Explore;
