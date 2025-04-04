import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../config/axios";

export const fetchNotifications = createAsyncThunk(
  "notification/fetchnotification",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/notification/getall", {
        headers: { Authorization: localStorage.getItem("token") },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const markAsRead = createAsyncThunk(
  "notification/markasread",
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `/notification/${id}/markread`,
        {},
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );
      return response.data; // Return updated notification
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const notificationSlice = createSlice({
  name: "notification",
  initialState: [],
  reducers: {
    addNotification: (state, action) => {
      state.unshift(action.payload);
    },
    clearNotification: () => [],
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      return action.payload;
    });
    builder.addCase(markAsRead.fulfilled, (state, action) => {
      const notification = state.find((n) => n._id === action.payload._id);
      if (notification) {
        notification.read = true;
      }
    });
    builder.addCase(markAsRead.rejected, (state, action) => {
      console.error("Failed to mark notification as read:", action.payload);
    });
  },
});

export const { addNotification, clearNotification } = notificationSlice.actions;

export default notificationSlice.reducer;
