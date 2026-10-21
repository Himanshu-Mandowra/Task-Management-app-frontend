import { createSlice } from "@reduxjs/toolkit";

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("data"));
  } catch {
    return null;
  }
};

const storedToken = localStorage.getItem("token");

const initialState = {
  user: storedToken ? readStoredUser() : null,
  token: storedToken,
  isLoggedIn: Boolean(storedToken),
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

