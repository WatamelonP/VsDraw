"use client";

import SidebarNav from "@/components/LandingPage/Menu";
import DotGrid from "@/components/LandingPage/DotGrid";
import FloatingDoodles from "@/components/LandingPage/FloatingDoodles";
import BottomWave from "@/components/LandingPage/BottomWave";
import HeroSection from "@/components/LandingPage/HeroSection";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex items-center justify-center">
      <DotGrid />
      <FloatingDoodles />
      <SidebarNav />
      <HeroSection />
      <BottomWave />
    </div>
  );
}