import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
  loading: false,
};

const userSlice = createSlice({
  name: "user",

  initialState,

  reducers: {
    setUsers: (state, action) => {
       console.log("Reducer Payload:", action.payload);
      state.users = action.payload;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    clearUsers: (state) => {
      state.users = [];
    },
  },
});

export const {
  setUsers,
  setLoading,
  clearUsers,
} = userSlice.actions;

export default userSlice.reducer;