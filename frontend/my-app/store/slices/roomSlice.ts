import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  name: string;
  score?: number;
  isReady?: boolean;
}

interface RoomState {
  currentRoomId: string | null;
  roomName: string;
  users: User[];
  isLoading: boolean;
  error: string | null;
}

const initialState: RoomState = {
  currentRoomId: null,
  roomName: '',
  users: [],
  isLoading: false,
  error: null,
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setCurrentRoom: (state, action: PayloadAction<{ id: string; name: string }>) => {
      state.currentRoomId = action.payload.id;
      state.roomName = action.payload.name;
    },
    setRoomUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex(u => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...action.payload };
      } else {
        state.users.push(action.payload);
      }
    },
    removeUserFromRoom: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(user => user.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
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
  updateUser,
  removeUserFromRoom,
  setLoading,
  setError,
  leaveRoom,
} = roomSlice.actions;

export default roomSlice.reducer;
