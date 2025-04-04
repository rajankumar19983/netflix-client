import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../config/axios";

export const fetchQueryData = createAsyncThunk(
  "home/fetchquerydata",
  async ({ query, pageNum }, { rejectWithValue }) => {
    try {
      let token = localStorage.getItem("token");
      const response = await axios.get(`/search/${query}/${pageNum}`, {
        headers: { Authorization: token },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const searchPageSlice = createSlice({
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
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchQueryData.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchQueryData.fulfilled, (state, action) => {
      state.loading = false;
      if (!state.data) {
        state.data = action.payload; // First-time load
      } else {
        state.data = {
          ...state.data,
          results: [...state.data.results, ...action.payload.results],
        };
      }
    });
    builder.addCase(fetchQueryData.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { resetData } = searchPageSlice.actions;
export default searchPageSlice.reducer;
