"use client";
import Canvas from "@/components/BasicCanvas/Canvas";
import Menu from "@/components/LandingPage/Menu";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
        <Menu/>
      <Canvas />
    </div>
  );
}