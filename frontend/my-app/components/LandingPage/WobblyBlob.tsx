"use client";

import * as motion from "motion/react-client";

export default function WobblyBlob() {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[600px] h-[320px] opacity-15"
      animate={{ rotate: [0, 3, -2, 1, 0], scale: [1, 1.03, 0.98, 1.02, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg viewBox="0 0 600 320">
        <motion.path
          fill="var(--color-primary, #6366f1)"
          d="M 80 160 C 80 60 160 20 300 20 C 440 20 520 60 520 160 C 520 260 440 300 300 300 C 160 300 80 260 80 160 Z"
          animate={{
            d: [
              "M 80 160 C 80 60 160 20 300 20 C 440 20 520 60 520 160 C 520 260 440 300 300 300 C 160 300 80 260 80 160 Z",
              "M 60 150 C 90 40 180 10 300 30 C 420 50 530 80 510 170 C 490 270 420 310 290 295 C 160 280 40 270 60 150 Z",
              "M 90 170 C 70 70 150 15 310 25 C 450 35 530 90 515 175 C 500 265 430 305 295 300 C 155 295 110 275 90 170 Z",
            ],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </motion.div>
  );
}