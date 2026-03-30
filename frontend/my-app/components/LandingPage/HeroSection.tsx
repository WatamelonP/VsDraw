"use client";

import * as motion from "motion/react-client";
import { useState } from "react";
import { Variants } from "motion/react";
import WobblyBlob from "./WobblyBlob";
import GameSetupModal from "../Customization/GameSetUp";
import MultiplayerSetupModal from "../Customization/MultiplayerSetup";
import { useRouter } from "next/navigation";



const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 20,
    },
  },
};

export default function HeroSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [multiplayerModalOpen, setMultiplayerModalOpen] = useState(false);
  const router = useRouter();


  return (
    <>
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-6 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="relative">
          <WobblyBlob />

          <motion.p
            variants={itemVariants}
            className="text-sm font-bold uppercase tracking-[0.25em] text-primary mb-2"
          >
            A drawing game
          </motion.p>

          <motion.h1
            variants={itemVariants}
            className="text-7xl md:text-9xl font-black uppercase leading-none tracking-tighter"
            style={{ fontFamily: "var(--font-handwriting)" }}
          >
            VS.DRAW!
          </motion.h1>
        </div>

        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-muted-foreground max-w-md"
        >
          Draw it. Score higher. Beat everyone before time runs out.
        </motion.p>



        <motion.div variants={itemVariants} className="flex gap-4">
          <motion.button
            onClick={() => router.push("/practice")}
            className="px-10 py-4 rounded-2xl bg-primary text-primary-foreground font-black uppercase"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            Practice Mode
          </motion.button>
        </motion.div>


        <motion.div variants={itemVariants} className="flex gap-4">
          <motion.button
            onClick={() => setModalOpen(true)}
            className="px-10 py-4 rounded-2xl bg-primary text-primary-foreground font-black uppercase"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            Single Player
          </motion.button>

          <motion.button
            onClick={() => setMultiplayerModalOpen(true)}
            className="px-10 py-4 rounded-2xl font-black uppercase bg-primary text-primary-foreground"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            Multiplayer
          </motion.button>
        </motion.div>
      </motion.div>

      <GameSetupModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      <MultiplayerSetupModal
        isOpen={multiplayerModalOpen}
        onClose={() => setMultiplayerModalOpen(false)}
      />
    </>
  );
}