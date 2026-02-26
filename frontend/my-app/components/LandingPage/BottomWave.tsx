"use client";

import * as motion from "motion/react-client";

export default function BottomWave() {
  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
      <svg viewBox="0 0 1440 80" className="w-full">
        <motion.path
          fill="var(--color-card)"
          d="M0 40 C240 80 480 0 720 40 C960 80 1200 0 1440 40 L1440 80 L0 80 Z"
          animate={{
            d: [
              "M0 40 C240 80 480 0 720 40 C960 80 1200 0 1440 40 L1440 80 L0 80 Z",
              "M0 50 C240 10 480 70 720 30 C960 10 1200 60 1440 50 L1440 80 L0 80 Z",
            ],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}