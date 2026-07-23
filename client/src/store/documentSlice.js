// Redux slice for the currently selected PDF / document

import { createSlice } from "@reduxjs/toolkit";

const documentSlice = createSlice({
  name: "document",
  // null means no PDF selected yet
  initialState: null,
  reducers: {
    // Save document info after upload
    setDocument: (state, action) => {
      return action.payload;
    },
    // Clear when user starts fresh
    clearDocument: () => null,
  },
});

export const { setDocument, clearDocument } = documentSlice.actions;
export default documentSlice.reducer;
