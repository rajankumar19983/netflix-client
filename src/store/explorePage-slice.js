import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../config/axios";

export const fetchMedia = createAsyncThunk(
  "home/fetchmedia",
  async ({ mediaType, pageNum, filters = {} }, { rejectWithValue }) => {
    try {
      let token = localStorage.getItem("token");
      const response = await axios.get(
        `/category/discover/${mediaType}/${pageNum}`,
        {
          headers: { Authorization: token },
          params: filters,
        }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const explorePageSlice = createSlice({
  name: "home",
  initialState: {
    data: null,
    loading: false,
    error: null,
    pageNum: 1,
  },
  reducers: {
    resetData: (state) => {
      state.data = null;
      state.pageNum = 1;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMedia.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchMedia.fulfilled, (state, action) => {
      state.loading = false;
      if (!state.data) {
        state.data = action.payload; // First-time load
      } else {
        state.data = {
          ...state.data,
          results: [...state.data.results, ...action.payload.results], // Append new results
        };
      }
      state.pageNum += 1;
    });
    builder.addCase(fetchMedia.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { resetData } = explorePageSlice.actions;
export default explorePageSlice.reducer;
