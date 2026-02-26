import { createSlice, PayloadAction } from '@reduxjs/toolkit';



// Define the structure of a single stroke/line
interface Stroke {
  id: string;
  tool: string;
  points: number[];  // [x1, y1, x2, y2, ...]
  color: string;
  strokeWidth: number;
  userId?: string;    // Who drew this (for collaboration)
  timestamp: number;  // When it was drawn
}

// Define the drawing state
interface DrawingState {
  strokes: Stroke[];           // All strokes in current drawing
  currentStroke: Stroke | null; // Stroke being drawn now
  history: {
    past: Stroke[][];          // For undo
    future: Stroke[][];        // For redo
  };
  isDrawing: boolean;
  lastUpdate: number;           // Timestamp of last change
}

const initialState: DrawingState = {
  strokes: [],
  currentStroke: null,
  history: {
    past: [],
    future: [],
  },
  isDrawing: false,
  lastUpdate: Date.now(),
};

const drawingSlice = createSlice({
  name: 'drawing',
  initialState,
  reducers: {
    // Start a new stroke
    startStroke: (state, action: PayloadAction<{
      tool: string;
      color: string;
      strokeWidth: number;
      userId?: string;
    }>) => {
      state.isDrawing = true;
      state.currentStroke = {
        id: Date.now().toString(), // Simple ID generation
        tool: action.payload.tool,
        points: [],
        color: action.payload.color,
        strokeWidth: action.payload.strokeWidth,
        userId: action.payload.userId,
        timestamp: Date.now(),
      };
    },

    // Add a point to current stroke
    addPoint: (state, action: PayloadAction<{ x: number; y: number }>) => {
      if (state.currentStroke) {
        state.currentStroke.points.push(action.payload.x, action.payload.y);
      }
    },

    // Finish current stroke and add to strokes
    endStroke: (state) => {
      if (state.currentStroke && state.currentStroke.points.length > 0) {
        // Save current state to history before adding new stroke
        state.history.past.push([...state.strokes]);
        state.history.future = []; // Clear future on new action
        
        // Add the new stroke
        state.strokes.push(state.currentStroke);
        state.currentStroke = null;
      }
      state.isDrawing = false;
      state.lastUpdate = Date.now();
    },

    // Cancel current stroke (if user lifts pen without drawing)
    cancelStroke: (state) => {
      state.currentStroke = null;
      state.isDrawing = false;
    },

    // Add a stroke from another user (for collaboration)
    addRemoteStroke: (state, action: PayloadAction<Stroke>) => {
      state.history.past.push([...state.strokes]);
      state.history.future = [];
      state.strokes.push(action.payload);
      state.lastUpdate = Date.now();
    },

    // Clear the entire drawing
    clearDrawing: (state) => {
      if (state.strokes.length > 0) {
        state.history.past.push([...state.strokes]);
        state.history.future = [];
        state.strokes = [];
        state.currentStroke = null;
        state.lastUpdate = Date.now();
      }
    },
    
    // Undo last stroke
    undo: (state) => {
      if (state.history.past.length > 0) {
        const previous = state.history.past.pop()!;
        state.history.future.unshift([...state.strokes]);
        state.strokes = previous;
        state.lastUpdate = Date.now();
      }
    },

    // Redo previously undone stroke
    redo: (state) => {
      if (state.history.future.length > 0) {
        const next = state.history.future.shift()!;
        state.history.past.push([...state.strokes]);
        state.strokes = next;
        state.lastUpdate = Date.now();
      }
    },

    // Load a saved drawing (e.g., when joining a room)
    loadDrawing: (state, action: PayloadAction<Stroke[]>) => {
      state.strokes = action.payload;
      state.history = {
        past: [],
        future: [],
      };
      state.lastUpdate = Date.now();
    },

    // Update entire drawing state (for real-time sync)
    syncDrawing: (state, action: PayloadAction<{
      strokes: Stroke[];
      lastUpdate: number;
    }>) => {
      // Only update if remote changes are newer
      if (action.payload.lastUpdate > state.lastUpdate) {
        state.strokes = action.payload.strokes;
        state.lastUpdate = action.payload.lastUpdate;
        // Clear history when syncing to avoid conflicts
        state.history = {
          past: [],
          future: [],
        };
      }
    },
  },
});

export const {
  startStroke,
  addPoint,
  endStroke,
  cancelStroke,
  addRemoteStroke,
  clearDrawing,
  undo,
  redo,
  loadDrawing,
  syncDrawing,
} = drawingSlice.actions;

export default drawingSlice.reducer;