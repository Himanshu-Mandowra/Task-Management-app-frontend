import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tasks: [],
  summary: {},
  activities: [],
  loading: false,
};

const taskSlice = createSlice({
  name: "task",

  initialState,

  reducers: {
    setTaskSummary: (state, action) => {
      state.summary = action.payload.summary;
      console.log("State Summary: ", state.summary);
    },
    setTasks: (state, action) => {
      state.tasks = action.payload;
      console.log("THis IS Task FROM STate: ", state.tasks);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearTasks: (state) => {
      state.tasks = [];

      state.summary = {};
    },
    addTask: (state, action) => {
      state.tasks.unshift(action.payload);
    },
    // ✅ New
    setActivities: (state, action) => {
      state.activities = action.payload;
    },
  },
});

export const { setTaskSummary, setTasks, clearTasks, addTask, setActivities } =
  taskSlice.actions;

export default taskSlice.reducer;
