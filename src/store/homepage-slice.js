import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../config/axios";

export const fetchApiUrls = createAsyncThunk(
  "home/fetchapiurls",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/config/urls");
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchGenres = createAsyncThunk(
  "home/fetchgeneres",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/config/genres");
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const homePageSlice = createSlice({
  name: "home",
  initialState: {
    url: {},
    genres: {},
    isLoading: false,
    serverErrors: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchApiUrls.pending, (state) => {
      (state.isLoading = true), (state.serverErrors = null);
    });
    builder.addCase(fetchApiUrls.fulfilled, (state, action) => {
      state.isLoading = false;
      state.url = action.payload;
    });
    builder.addCase(fetchApiUrls.rejected, (state, action) => {
      state.isLoading = false;
      state.serverErrors = action.payload;
    });
    builder.addCase(fetchGenres.pending, (state) => {
      state.isLoading = true;
      state.serverErrors = null;
    });
    builder.addCase(fetchGenres.fulfilled, (state, action) => {
      state.isLoading = false;
      state.genres = action.payload;
    });
    builder.addCase(fetchGenres.rejected, (state, action) => {
      state.isLoading = false;
      state.serverErrors = action.payload;
    });
  },
});

export default homePageSlice.reducer;
