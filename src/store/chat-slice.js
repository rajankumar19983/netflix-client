import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    activeChat: {}, // Stores multiple open chats by userId
    callDetails: null, // Stores ongoing call details
  },
  reducers: {
    openChat: (state, action) => {
      const { userId, name } = action.payload;
      state.activeChat[userId] = { userId, name };
    },
    closeChat: (state, action) => {
      const { userId } = action.payload;
      delete state.activeChat[userId];
    },
    setCallDetails: (state, action) => {
      state.callDetails = action.payload;
    },
    clearCallDetails: (state, action) => {
      state.callDetails = null; // Clear on call end
    },
  },
});

export const { openChat, closeChat, setCallDetails, clearCallDetails } =
  chatSlice.actions;
export default chatSlice.reducer;
