// store/slices/gameSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type GameStatus = 'idle' | 'starting' | 'playing' | 'ended';

type GameState = {
  classes: string[];
  currentTarget: string | null;
  currentIndex: number;
  difficulty: 'easy' | 'medium' | 'hard';
  status: GameStatus;
  timer: number;
  scores: Record<string, number>;
};

const initialState: GameState = {
  classes: [],
  currentTarget: null,
  currentIndex: 0,
  difficulty: 'medium',
  status: 'idle',
  timer: 0,
  scores: {},
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setClasses(state, action: PayloadAction<string[]>) {
      state.classes = action.payload;
      state.currentTarget = action.payload[0] ?? null;
      state.currentIndex = 0;
    },
    nextTarget(state) {
      const next = state.currentIndex + 1;
      if (next < state.classes.length) {
        state.currentIndex = next;
        state.currentTarget = state.classes[next];
      }
    },
    setDifficulty(state, action: PayloadAction<'easy' | 'medium' | 'hard'>) {
      state.difficulty = action.payload;
    },
    setGameStatus(state, action: PayloadAction<GameStatus>) {
      state.status = action.payload;
    },
    setTimer(state, action: PayloadAction<number>) {
      state.timer = action.payload;
    },
    updateScores(state, action: PayloadAction<Record<string, number>>) {
      state.scores = action.payload;
    },
    resetGame(state) {
      state.status = 'idle';
      state.currentIndex = 0;
      state.currentTarget = state.classes[0] ?? null;
      state.timer = 0;
    }
  }
});

export const { 
  setClasses, 
  nextTarget, 
  setDifficulty, 
  setGameStatus, 
  setTimer, 
  updateScores,
  resetGame 
} = gameSlice.actions;
export default gameSlice.reducer;