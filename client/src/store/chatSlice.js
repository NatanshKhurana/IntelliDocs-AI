// Redux slice for chat messages shown on screen
// Guest: only in memory / this store (not saved on server)
// Logged-in: we also load/save via API

import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [], // [{ role: "user"|"assistant", content: "..." }]
    loading: false,
  },
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setChatLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.loading = false;
    },
  },
});

export const { setMessages, addMessage, setChatLoading, clearMessages } =
  chatSlice.actions;
export default chatSlice.reducer;
