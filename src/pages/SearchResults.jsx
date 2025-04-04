import React, { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import ContentWrapper from "../components/ContentWrapper";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchQueryData, resetData } from "../store/searchpage-slice";
import MovieCard from "../components/MovieCard";
import Img from "../components/LazyLoadImage";
import Spinner from "../components/Spinner";

const SearchResults = () => {
  const dispatch = useDispatch();
  const [pageNum, setPageNum] = useState(1);
  const { data, loading } = useSelector((state) => state.search);
  const { query } = useParams();

  useEffect(() => {
    dispatch(resetData());
    dispatch(fetchQueryData({ query, pageNum }));
    setPageNum(2);
  }, [query, dispatch]);

  const loadMore = () => {
    dispatch(fetchQueryData({ query, pageNum }));
    setPageNum((prev) => prev + 1);
  };

  return (
    <div className="min-h-[700px] pt-[100px]">
      <ContentWrapper>
        {loading && !data ? ( // Show loader only before data loads
          <Spinner initial={true} />
        ) : data?.results?.length > 0 ? (
          <>
            <div className="text-[24px] leading-[34px] text-white mb-[25px]">
              {`Search ${
                data.total_results > 1 ? "results" : "result"
              } for '${query}'`}
            </div>

            <InfiniteScroll
              className="flex flex-wrap gap-[10px] mb-[50px] md:gap-5"
              dataLength={data?.results?.length}
              next={loadMore}
              hasMore={pageNum <= data?.total_pages}
              loader={<p>Loading more...</p>}
            >
              {data?.results.map((item, index) => {
                if (item?.media_type === "person") return null;
                return (
                  <MovieCard
                    className="searchResultMovieCard"
                    key={index}
                    data={item}
                    fromSearch={true}
                  />
                );
              })}
            </InfiniteScroll>

            {loading && <Spinner initial={true} />}
          </>
        ) : (
          !loading && (
            <div className="flex flex-col">
              <span className="text-[24px] text-dark_light">
                Sorry, Results Not Found
              </span>
              <div className="flex justify-center items-center w-full h-[600px] py-[100px] md:py-0">
                <Img
                  className={
                    "w-1/2 min-w-[250px] mx-auto my-auto md:mt-[-10px]"
                  }
                  src={"/no-results.png"}
                />
              </div>
            </div>
          )
        )}
      </ContentWrapper>
    </div>
  );
};

export default SearchResults;
