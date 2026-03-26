import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage/session'; // sessionStorage
import roomReducer from './slices/roomSlice';
import userReducer from './slices/userSlice';
import drawingReducer from './slices/drawingSlice';
import gameReducer from './slices/gameSlice';

const gamePersistConfig = {
  key: 'game',
  storage,
};

const persistedGameReducer = persistReducer(gamePersistConfig, gameReducer);

export const store = configureStore({
  reducer: {
    room: roomReducer,
    user: userReducer,
    drawing: drawingReducer,
    game: persistedGameReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;