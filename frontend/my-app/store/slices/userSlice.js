import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: null,
  nickname: '',
  isConnected: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.currentUser = action.payload;
      state.nickname = action.payload.nickname;
      state.isConnected = true;
    },
    updateNickname: (state, action) => {
      state.nickname = action.payload;
      if (state.currentUser) {
        state.currentUser.nickname = action.payload;
      }
    },
    logout: (state) => {
      state.currentUser = null;
      state.nickname = '';
      state.isConnected = false;
    },
  },
});

export const { setUser, updateNickname, logout } = userSlice.actions;
export default userSlice.reducer;