import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  isLoggedIn: false,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;

      console.log("This is the User state user", state.user);

      state.token = action.payload.token;

      state.isLoggedIn = true;
    },

    logout: (state) => {
      state.user = null;

      state.token = null;

      state.isLoggedIn = false;
    },

    setUser: (state, action) => {
      state.user = action.payload.user;
    },
  },
});

export const { loginSuccess, logout, setUser } = authSlice.actions;

export default authSlice.reducer;
