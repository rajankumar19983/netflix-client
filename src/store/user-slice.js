import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../config/axios";
import toast from "react-hot-toast";

export const signup = createAsyncThunk(
  "user/signup",
  async ({ formData }, { rejectWithValue }) => {
    try {
      const response = await axios.post("/users/register", formData);
      toast.success("Account Created Successfully");
      return response.data;
    } catch (err) {
      err.response.data.errors.map((ele) => {
        toast.error(ele.msg || "An error occured");
      });
      return rejectWithValue(err.response.data.errors);
    }
  }
);

export const login = createAsyncThunk(
  "user/login",
  async ({ formData }, { rejectWithValue }) => {
    try {
      const response = await axios.post("/users/login", formData);
      localStorage.setItem("token", response.data.token);
      const user = await axios.get("/users/account", {
        headers: { Authorization: localStorage.getItem("token") },
      });
      toast.success("Login Successfull");
      return user.data;
    } catch (err) {
      const serverErrors = err.response.data.errors;
      if (typeof serverErrors === "string") {
        toast.error(serverErrors);
      } else {
        serverErrors.map((ele) => {
          toast.error(ele.msg || "An error occured");
        });
      }
      return rejectWithValue(serverErrors);
    }
  }
);

export const account = createAsyncThunk(
  "user/account",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue({ message: "No token available" }); // Handle case where user is not logged in
      }
      const response = await axios.get("/users/account", {
        headers: { Authorization: token },
      });
      return response.data;
    } catch (err) {
      const serverErrors = err.response.data.errors;
      if (typeof serverErrors === "string") {
        toast.error(serverErrors);
      } else {
        serverErrors.map((ele) => {
          toast.error(ele.msg || "An error occured");
        });
      }
      return rejectWithValue(serverErrors);
    }
  }
);

export const findEmail = createAsyncThunk(
  "user/findemail",
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await axios.post("/users/findemail", { email });
      return response.data;
    } catch (err) {
      return rejectWithValue(serverErrors);
    }
  }
);

export const saveUserImage = createAsyncThunk(
  "user/saveuserimage",
  async (ImageData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("profilePic", ImageData);
      const { data } = await axios.put("/users/updateimage", formData, {
        headers: { Authorization: token },
      });
      toast.success("Profile Picture Updated");
      return data;
    } catch (err) {
      toast.error("Something went wrong");
      return rejectWithValue(err.response.data);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    isLoading: false,
    isLoggedIn: false,
    authChecked: false,
    serverErrors: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token");
      sessionStorage.removeItem("email");
      state.user = null;
      state.isLoggedIn = false;
      toast.success("Logged out");
    },
    updateUserImage(state, action) {
      state.user.image = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(findEmail.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(findEmail.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
    });
    builder.addCase(findEmail.rejected, (state, action) => {
      state.isLoading = false;
      state.serverErrors = action.payload;
    });
    builder.addCase(signup.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(signup.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
    });
    builder.addCase(signup.rejected, (state, action) => {
      state.isLoading = false;
      state.serverErrors = action.payload;
    });
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isLoggedIn = true;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.serverErrors = action.payload;
    });
    builder.addCase(account.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(account.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isLoggedIn = true;
      state.isLoading = false;
      state.authChecked = true;
    });
    builder.addCase(account.rejected, (state, action) => {
      state.user = null;
      state.serverErrors = action.payload;
      state.isLoggedIn = false;
      state.isLoading = false;
      state.authChecked = true;
    });
    builder.addCase(saveUserImage.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(saveUserImage.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
    });
    builder.addCase(saveUserImage.rejected, (state, action) => {
      state.serverErrors = action.payload;
      state.isLoading = false;
    });
  },
});

export const { logout, updateUserImage } = userSlice.actions;
export default userSlice.reducer;
