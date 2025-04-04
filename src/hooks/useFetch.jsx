import { useState, useEffect } from "react";
import axios from "../config/axios";

const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setData(null);
      setServerErrors(null);
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(url, {
          headers: { Authorization: token },
        });
        setData(data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setServerErrors(err);
      }
    };
    fetchData();
  }, [url]);

  return { data, loading, serverErrors };
};

export default useFetch;
