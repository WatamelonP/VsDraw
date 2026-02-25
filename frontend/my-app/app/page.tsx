"use client";

import * as motion from "motion/react-client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SidebarNav from "@/components/LandingPage/Menu";

// ─── Floating doodle shapes in the background ─────────────────────────────────

const DOODLES = [
  // pencil
  { id: 1, emoji: "✏️", x: 8, y: 15, size: 48, delay: 0, duration: 6 },
  // crayon
  { id: 2, emoji: "🖍️", x: 88, y: 10, size: 40, delay: 1.2, duration: 7 },
  // palette
  { id: 3, emoji: "🎨", x: 75, y: 70, size: 52, delay: 0.5, duration: 8 },
  // star
  { id: 4, emoji: "⭐", x: 15, y: 75, size: 36, delay: 2, duration: 5 },
  // brush
  { id: 5, emoji: "🖌️", x: 50, y: 8, size: 44, delay: 1.8, duration: 9 },
  // lightbulb
  { id: 6, emoji: "💡", x: 92, y: 45, size: 38, delay: 0.8, duration: 6.5 },
  // squiggle star
  { id: 7, emoji: "✨", x: 5, y: 45, size: 32, delay: 3, duration: 7 },
  // trophy
  { id: 8, emoji: "🏆", x: 60, y: 85, size: 42, delay: 1.5, duration: 8 },
  // magnifier
  { id: 9, emoji: "🔍", x: 30, y: 88, size: 34, delay: 2.5, duration: 6 },
  // dice
  { id: 10, emoji: "🎲", x: 82, y: 28, size: 36, delay: 0.3, duration: 7.5 },
];

// ─── Animated dot-grid background ─────────────────────────────────────────────

function DotGrid() {
  return (
    <div
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage: `radial-gradient(circle, var(--color-border, #444) 1.5px, transparent 1.5px)`,
        backgroundSize: "32px 32px",
      }}
    />
  );
}

// ─── Wobble animation for doodles ─────────────────────────────────────────────

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

// ─── Wobbly SVG blob behind title ─────────────────────────────────────────────

function WobblyBlob() {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[600px] h-[320px] opacity-15"
      animate={{ rotate: [0, 3, -2, 1, 0], scale: [1, 1.03, 0.98, 1.02, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg viewBox="0 0 600 320" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.path
          d="M 80 160 C 80 60 160 20 300 20 C 440 20 520 60 520 160 C 520 260 440 300 300 300 C 160 300 80 260 80 160 Z"
          fill="var(--color-primary, #6366f1)"
          animate={{
            d: [
              "M 80 160 C 80 60 160 20 300 20 C 440 20 520 60 520 160 C 520 260 440 300 300 300 C 160 300 80 260 80 160 Z",
              "M 60 150 C 90 40 180 10 300 30 C 420 50 530 80 510 170 C 490 270 420 310 290 295 C 160 280 40 270 60 150 Z",
              "M 90 170 C 70 70 150 15 310 25 C 450 35 530 90 515 175 C 500 265 430 305 295 300 C 155 295 110 275 90 170 Z",
              "M 80 160 C 80 60 160 20 300 20 C 440 20 520 60 520 160 C 520 260 440 300 300 300 C 160 300 80 260 80 160 Z",
            ],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </motion.div>
  );
}

// ─── Main Landing Page ─────────────────────────────────────────────────────────

export default function LandingPage() {
  const router = useRouter();

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
  };

  const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 200, damping: 20 },
  },
};
  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex flex-col items-center justify-center">
      {/* Dot grid */}
      <DotGrid />

      {/* Floating doodles */}
      {DOODLES.map((d) => (
        <FloatingDoodle key={d.id} {...d} />
      ))}

      {/* Sidebar nav */}
      <SidebarNav />

      {/* Hero content */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-6 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Wobble blob sits behind the title */}
        <div className="relative">
          <WobblyBlob />

          {/* Eyebrow label */}
          <motion.p
            variants={itemVariants}
            className="text-sm font-bold uppercase tracking-[0.25em] text-primary mb-2"
          >
            A drawing game
          </motion.p>

          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className="text-7xl md:text-9xl font-black uppercase leading-none tracking-tighter text-foreground"
            style={{ fontFamily: "var(--font-handwriting)" }}
          >
            Sketch
            <br />
            <span className="text-primary">or</span> Bust
          </motion.h1>
        </div>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-muted-foreground max-w-md leading-relaxed"
        >
          Draw it. Guess it. Beat everyone before time runs out.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-4 mt-2"
        >
          <motion.button
            onClick={() => router.push("/canvas")}
            className="relative px-10 py-4 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-wider text-lg overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            {/* Shine sweep */}
            <motion.span
              className="absolute inset-0 bg-white/20"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
            <span className="relative">Play Now</span>
          </motion.button>

          <motion.button
            onClick={() => router.push("/leaderboard")}
            className="px-8 py-4 rounded-2xl border-2 border-border text-foreground font-bold uppercase tracking-wider text-base hover:bg-muted transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Leaderboard
          </motion.button>
        </motion.div>

        {/* Small decorative hint */}
        <motion.p
          variants={itemVariants}
          className="text-xs text-muted-foreground/60 mt-2 tracking-widest uppercase"
        >
          No account needed · Just draw
        </motion.p>
      </motion.div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <motion.path
            d="M0 40 C240 80 480 0 720 40 C960 80 1200 0 1440 40 L1440 80 L0 80 Z"
            fill="var(--color-card)"
            animate={{
              d: [
                "M0 40 C240 80 480 0 720 40 C960 80 1200 0 1440 40 L1440 80 L0 80 Z",
                "M0 50 C240 10 480 70 720 30 C960 10 1200 60 1440 50 L1440 80 L0 80 Z",
                "M0 40 C240 80 480 0 720 40 C960 80 1200 0 1440 40 L1440 80 L0 80 Z",
              ],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </div>
    </div>
  );
}