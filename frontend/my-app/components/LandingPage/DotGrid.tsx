"use client";

export default function DotGrid() {
  return (
    <div
      className="absolute inset-0 opacity-80"
      style={{
        backgroundImage: `radial-gradient(circle, var(--color-border, #444) 1.5px, transparent 1.5px)`,
        backgroundSize: "32px 32px",
      }}
    />
  );
}