// store/slices/gameSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type GameState = {
  classes: string[];
  currentTarget: string | null;
  currentIndex: number;
  difficulty: 'easy' | 'medium' | 'hard';
};

const initialState: GameState = {
  classes: [],
  currentTarget: null,
  currentIndex: 0,
  difficulty: 'medium',
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
    }
  }
});

export const { setClasses, nextTarget, setDifficulty } = gameSlice.actions;
export default gameSlice.reducer;