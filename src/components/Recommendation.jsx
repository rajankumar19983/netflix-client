import React from "react";
import Carousel from "./Carousel";
import useFetch from "../hooks/useFetch";

const Recommendation = ({ mediaType, id }) => {
  const { data, loading } = useFetch(`/${mediaType}/${id}/recommendations`);

  return (
    <>
      {data?.results?.length > 0 && (
        <Carousel
          title="Recommendation"
          data={data?.results}
          loading={loading}
          endPoint={mediaType}
        />
      )}
    </>
  );
};

export default Recommendation;
