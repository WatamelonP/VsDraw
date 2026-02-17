import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentRoomId: null,
  roomName: '',
  users: [], // users in this room
  isLoading: false,
  error: null,
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setCurrentRoom: (state, action) => {
      state.currentRoomId = action.payload.id;
      state.roomName = action.payload.name;
    },
    setRoomUsers: (state, action) => {
      state.users = action.payload;
    },
    addUserToRoom: (state, action) => {
      state.users.push(action.payload);
    },
    removeUserFromRoom: (state, action) => {
      state.users = state.users.filter(user => user.id !== action.payload);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    leaveRoom: (state) => {
      state.currentRoomId = null;
      state.roomName = '';
      state.users = [];
    },
  },
});

export const {
  setCurrentRoom,
  setRoomUsers,
  addUserToRoom,
  removeUserFromRoom,
  setLoading,
  setError,
  leaveRoom,
} = roomSlice.actions;

export default roomSlice.reducer;