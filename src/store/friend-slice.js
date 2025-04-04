import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../config/axios";
import toast from "react-hot-toast";

export const fetchFriendsData = createAsyncThunk(
  "friend/fetchfriendsdata",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/users/fetchfriendsdata", {
        headers: { Authorization: localStorage.getItem("token") },
      });
      return res.data;
    } catch (err) {
      toast.error("Something went wrong");
      return rejectWithValue(err.response.data);
    }
  }
);

export const sendFriendRequest = createAsyncThunk(
  "friend/sendfriendrequest",
  async ({ id }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `/users/sendrequest/${id}`,
        {},
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );
      toast.success("Friend request sent!");
      return res.data;
    } catch (err) {
      toast.error("Something went wrong");
      return rejectWithValue(err.response.data);
    }
  }
);

export const revokeFriendRequest = createAsyncThunk(
  "friend/revokefriendrequest",
  async ({ id }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `/users/revokerequest/${id}`,
        {},
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );
      toast.success("Friend request revoked!");
      return res.data;
    } catch (err) {
      toast.error("Something went wrong");
      return rejectWithValue(err.response.data);
    }
  }
);

export const acceptFriendRequest = createAsyncThunk(
  "friends/acceptfriendrequest",
  async ({ id }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `/users/acceptrequest/${id}`,
        {},
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );
      toast.success("Request accepted");
      return res.data;
    } catch (err) {
      toast.error("Something went wrong");
      return rejectWithValue(err.response.data);
    }
  }
);

export const rejectFriendRequest = createAsyncThunk(
  "friend/rejectfriendrequest",
  async ({ id }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `/users/rejectrequest/${id}`,
        {},
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );
      toast.success("Request rejected");
      return res.data;
    } catch (err) {
      toast.error("Something went wrong");
      return rejectWithValue(err.response.data);
    }
  }
);

export const unfriend = createAsyncThunk(
  "friend/unfriend",
  async ({ id }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `/users/unfriend/${id}`,
        {},
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );
      toast.success("Unfriended!!");
      return res.data;
    } catch (err) {
      toast.error("Something went wrong");
      return rejectWithValue(err.response.data);
    }
  }
);

const friendSlice = createSlice({
  name: "friend",
  initialState: {
    friends: [],
    friendRequests: [],
    sentRequests: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchFriendsData.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchFriendsData.fulfilled, (state, action) => {
      state.friends = action.payload.friends;
      state.friendRequests = action.payload.friendRequests;
      state.sentRequests = action.payload.sentRequests;
      state.loading = false;
    });
    builder.addCase(fetchFriendsData.rejected, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    });
    builder.addCase(sendFriendRequest.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(sendFriendRequest.fulfilled, (state, action) => {
      state.sentRequests.push(action.payload.id);
      state.loading = false;
    });
    builder.addCase(sendFriendRequest.rejected, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    });
    builder.addCase(revokeFriendRequest.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(revokeFriendRequest.fulfilled, (state, action) => {
      state.sentRequests = state.sentRequests.filter(
        (id) => id !== action.payload.id
      );
      state.loading = false;
    });
    builder.addCase(revokeFriendRequest.rejected, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    });
    builder.addCase(acceptFriendRequest.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(acceptFriendRequest.fulfilled, (state, action) => {
      state.friends.push(action.payload.newFriend.id);
      state.friendRequests = state.friendRequests.filter(
        (id) => id !== action.payload.newFriend.id
      );
      state.loading = false;
    });
    builder.addCase(acceptFriendRequest.rejected, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    });
    builder.addCase(rejectFriendRequest.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(rejectFriendRequest.fulfilled, (state, action) => {
      state.friendRequests = state.friendRequests.filter(
        (id) => id !== action.payload.id
      );
      state.loading = false;
    });
    builder.addCase(rejectFriendRequest.rejected, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    });
    builder.addCase(unfriend.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(unfriend.fulfilled, (state, action) => {
      state.friends = state.friends.filter((id) => id !== action.payload.id);
      state.loading = false;
    });
    builder.addCase(unfriend.rejected, (state) => {
      state.error = action.payload;
      state.loading = false;
    });
  },
});

export default friendSlice.reducer;
