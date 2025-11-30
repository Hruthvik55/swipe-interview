import { createSlice } from "@reduxjs/toolkit";

const initialJD = sessionStorage.getItem("jobDescription") || "";

const jdSlice = createSlice({
  name: "jd",
  initialState: {
    description: initialJD,
  },
  reducers: {
    setJobDescription: (state, action) => {
      state.description = action.payload;
      sessionStorage.setItem("jobDescription", action.payload);
    },
  },
});

export const { setJobDescription } = jdSlice.actions;
export default jdSlice.reducer;
