import axios from "axios";

export default axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_ADDRESS}/api`,
  timeout: 10000,
});
