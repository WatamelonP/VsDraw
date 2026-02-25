<img width="1593" height="943" alt="image" src="https://github.com/user-attachments/assets/0d5aebf7-009d-4fc8-91d8-527de4d98473" /># 🎨 Sketch or Bust *(working title)*

> A fast-paced multiplayer drawing and guessing game powered by AI inference. Draw the prompt, beat the clock, and let the model judge your skills.

---

## 🗺️ Project Overview

Sketch or Bust is a web-based drawing game where players are given a random class to draw within a time limit. A machine learning model trained on the Google QuickDraw dataset evaluates the drawing in real time and returns a confidence score for the target class. The goal is to draw well enough for the model to recognize it before time runs out.

The project is currently a **work in progress**. The core drawing pipeline and AI inference are functional. Multiplayer rooms, WebSocket support, Submit/Next Drawing and the full game loop are planned for future development.

<img width="1593" height="943" alt="image" src="https://github.com/user-attachments/assets/e1bcdb37-b2f3-4f72-8b1b-bb37cfc373c4" />

---

## ✨ Features

### Currently Working
- 🖊️ **Drawing canvas** — full-featured canvas with pen, eraser, color picker, and adjustable stroke width
- 🧰 **Draggable floating toolbar** — snaps to edges of the screen, switches between horizontal and vertical orientation
- 🎯 **AI inference pipeline** — drawings are converted to 28×28 tensors and passed through a CNN trained on QuickDraw data
- 📊 **Real-time confidence scoring** — returns the model's confidence for the specific target class, not just the top prediction
- 🎲 **Class randomizer** — generates a randomized list of drawable classes with support for count, repetition, and exclusion options
- 🗂️ **Sidebar navigation** — animated slide-in menu with staggered nav items

### Planned
- ⏱️ Timer-based game rounds
- 🏆 Leaderboard
- 🌐 Multiplayer rooms via WebSockets
- 🔴 Redis-backed shared room state
- 🎮 Game modes (speed draw, shrinking canvas, etc.)

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 15 (App Router) | Framework |
| TypeScript | Language |
| Tailwind CSS v4 | Styling |
| shadcn/ui | Component library |
| Redux Toolkit | Game state management (class list, current target) |
| Motion (Framer Motion) | Animations and transitions |
| React Konva | Drawing canvas |
| GSAP | Complex animation sequences *(planned)* |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | REST API framework |
| PyTorch | ML model inference |
| OpenCV + NumPy | Drawing preprocessing (stroke → tensor) |
| Pydantic v2 | Request/response validation |
| Uvicorn | ASGI server |

### Machine Learning
| Detail | Value |
|---|---|
| Dataset | Google QuickDraw (`.npy` bitmap format) |
| Architecture | Custom CNN (3× Conv blocks + AdaptiveAvgPool) |
| Input size | 28×28 grayscale |
| Classes | 38 |
| Training | 18 epochs | -> The dataset had more than a million images so i had to settle with 18. still accurate enough if i do say so myself.

---

## 🔧 Project Structure

```
VsDraw/
├── backend/
│   ├── app/
│   │   ├── api/routes/        # FastAPI endpoints (/target, /predict)
│   │   ├── ml_model/          # Model definition and weights
│   │   ├── services/          # PreprocessingService, PredictionService
│   │   └── models/            # Pydantic models (DrawingRequest, etc.)
│   └── data/
│       └── classes.txt        # List of drawable classes
└── frontend/
    └── my-app/
        ├── app/               # Next.js App Router pages
        ├── components/
│       ├── Canvas/            # Drawing canvas + toolbar
│       ├── LandingPage/       # Landing page + sidebar nav
│       └── ui/                # shadcn components
        └── store/
            ├── slices/
            │   ├── drawingSlice.ts   # Stroke history + undo/redo
            │   └── gameSlice.ts      # Class list + current target
            └── hooks.ts
```

---

## ⚙️ Getting Started

### Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate      # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend/my-app
npm install
npm run dev
```

Make sure your `.env.local` is set up in `frontend/my-app`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

> ⚠️ This project is a work in progress. Expect breaking changes.

> My Mistakes:
- Installing dependencies on different directories
- Integrating Redis too early without even finishing my earlier tasks
