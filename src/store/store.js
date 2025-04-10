import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user-slice.js";
import homeReducer from "./homepage-slice.js";
import searchReducer from "./searchpage-slice.js";
import exploreReducer from "./explorePage-slice.js";
import friendReducer from "./friend-slice.js";
import notificationReducer from "./notification-slice.js";
import watchPartyReducer from "./watchParty-slice.js";
import callReducer from "./call-Slice.js";

const store = configureStore({
  reducer: {
    user: userReducer,
    home: homeReducer,
    search: searchReducer,
    explore: exploreReducer,
    friend: friendReducer,
    notification: notificationReducer,
    watchParty: watchPartyReducer,
    call: callReducer,
  },
});

export default store;
