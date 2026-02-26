"use client";

import * as motion from "motion/react-client";

const DOODLES = [
  { id: 1, emoji: "✏️", x: 8, y: 15, size: 48, delay: 0, duration: 6 },
  { id: 2, emoji: "🖍️", x: 88, y: 10, size: 40, delay: 1.2, duration: 7 },
  { id: 3, emoji: "🎨", x: 75, y: 70, size: 52, delay: 0.5, duration: 8 },
  { id: 4, emoji: "⭐", x: 15, y: 75, size: 36, delay: 2, duration: 5 },
  { id: 5, emoji: "🖌️", x: 50, y: 8, size: 44, delay: 1.8, duration: 9 },
  { id: 6, emoji: "💡", x: 92, y: 45, size: 38, delay: 0.8, duration: 6.5 },
  { id: 7, emoji: "✨", x: 5, y: 45, size: 32, delay: 3, duration: 7 },
  { id: 8, emoji: "🏆", x: 60, y: 85, size: 42, delay: 1.5, duration: 8 },
  { id: 9, emoji: "🔍", x: 30, y: 88, size: 34, delay: 2.5, duration: 6 },
  { id: 10, emoji: "🎲", x: 82, y: 28, size: 36, delay: 0.3, duration: 7.5 },
];

function FloatingDoodle({
  emoji,
  x,
  y,
  size,
  delay,
  duration,
}: (typeof DOODLES)[number]) {
  return (
    <motion.div
      className="absolute select-none pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, fontSize: size }}
      animate={{
        y: [0, -18, 0, 12, 0],
        rotate: [-4, 4, -2, 3, -4],
        scale: [1, 1.05, 1, 0.97, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {emoji}
    </motion.div>
  );
}

export default function FloatingDoodles() {
  return (
    <>
      {DOODLES.map((d) => (
        <FloatingDoodle key={d.id} {...d} />
      ))}
    </>
  );
}