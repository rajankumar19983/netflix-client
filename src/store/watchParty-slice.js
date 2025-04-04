import { createSlice } from "@reduxjs/toolkit";

const watchPartySlice = createSlice({
  name: "watchParty",
  initialState: {
    participants:
      JSON.parse(sessionStorage.getItem("watchPartyParticipants")) || [],
  },
  reducers: {
    addParticipant: (state, action) => {
      if (!state.participants.includes(action.payload)) {
        state.participants.push(action.payload);
        sessionStorage.setItem(
          "watchPartyParticipants",
          JSON.stringify(state.participants)
        );
      }
    },
    removeParticipant: (state, action) => {
      if (state.participants.includes(action.payload)) {
        state.participants = state.participants.filter(
          (p) => p !== action.payload
        );
        sessionStorage.setItem(
          "watchPartyParticipants",
          JSON.stringify(state.participants)
        );
      }
    },
  },
});

export const { addParticipant, removeParticipant } = watchPartySlice.actions;
export default watchPartySlice.reducer;
