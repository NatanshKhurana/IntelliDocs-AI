import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import themeReducer from "./themeSlice";
import documentReducer from "./documentSlice";
import chatReducer from "./chatSlice";

const appStore = configureStore({
  reducer: {
    user: userReducer,
    theme: themeReducer,
    document: documentReducer,
    chat: chatReducer,
  },
});

export default appStore;
