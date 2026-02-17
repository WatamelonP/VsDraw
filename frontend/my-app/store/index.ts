import { configureStore } from '@reduxjs/toolkit';
import roomReducer from './slices/roomSlice';
import userReducer from './slices/userSlice';
import drawingReducer from './slices/drawingSlice';

export const store = configureStore({
  reducer: {
    room: roomReducer,
    user: userReducer,
    drawing: drawingReducer,
  },
});

// These are the TYPE exports - they MUST be exactly this
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;