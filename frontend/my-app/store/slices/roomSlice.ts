import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  name: string;
  score?: number;
  isReady?: boolean;
}

export interface GameSettings {
  count: number;
  repetitions: boolean;
  excludeClasses: string[];
}

interface RoomState {
  currentRoomId: string | null;
  roomName: string;
  playerName: string;
  users: User[];
  gameSettings: GameSettings;
  isLoading: boolean;
  error: string | null;
}

const initialState: RoomState = {
  currentRoomId: null,
  roomName: '',
  playerName: '',
  users: [],
  gameSettings: {
    count: 5,
    repetitions: false,
    excludeClasses: [],
  },
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
    setPlayerName: (state, action: PayloadAction<string>) => {
      state.playerName = action.payload;
    },
    setRoomUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User> & { id: string }>) => {
      const index = state.users.findIndex(u => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...action.payload } as User;
      } else if (action.payload.name) {
        state.users.push(action.payload as User);
      }
    },
    removeUserFromRoom: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(user => user.id !== action.payload);
    },
    setGameSettings: (state, action: PayloadAction<GameSettings>) => {
      state.gameSettings = action.payload;
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
      state.playerName = '';
      state.users = [];
      state.gameSettings = { count: 5, repetitions: false, excludeClasses: [] };
    },
  },
});

export const {
  setCurrentRoom,
  setPlayerName,
  setRoomUsers,
  updateUser,
  removeUserFromRoom,
  setGameSettings,
  setLoading,
  setError,
  leaveRoom,
} = roomSlice.actions;

export default roomSlice.reducer;
