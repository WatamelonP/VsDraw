"use client";

import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setClasses } from "@/store/slices/gameSlice";
import { LayoutGrid, List, X, Plus, Minus, Play } from "lucide-react";

// ─── All available classes (must match CLASS_NAMES on backend) ────────────────
const ALL_CLASSES = [
  "airplane", "alarm clock", "ambulance", "angel", "ant", "anvil", "apple",
  "arm", "axe", "backpack", "banana", "bandage", "baseball bat", "baseball",
  "basket", "basketball", "bat", "bathtub", "beach", "bear", "beard", "bed",
  "bee", "belt", "bench", "bicycle", "binoculars", "bird", "birthday cake",
  "blueberry", "book", "bowtie", "bracelet", "bread", "bridge", "broccoli",
  "broom", "bucket",
];

interface GameSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GameSetupModal({ isOpen, onClose }: GameSetupModalProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [count, setCount] = useState(5);
  const [repetitions, setRepetitions] = useState(false);
  const [excludedClasses, setExcludedClasses] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const filteredClasses = ALL_CLASSES.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  const availableCount = ALL_CLASSES.length - excludedClasses.length;
  const maxCount = repetitions ? 99 : availableCount;

  const toggleExclude = (cls: string) => {
    setExcludedClasses((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]
    );
  };

  const handleStart = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/drawing/target`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            count,
            repetitions,
            exclude_classes: excludedClasses,
          }),
        }
      );
      const data = await response.json();
      dispatch(setClasses(data.classes));
      onClose();
      router.push("/canvas");
    } catch (err) {
      console.error("Failed to fetch classes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-4"
          >
            <div
              className="pointer-events-auto w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              style={{ maxHeight: "85vh" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div>
                  <h2 className="text-base font-black uppercase tracking-widest text-foreground">
                    Single Player
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Configure your round
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="h-px bg-border mx-5" />

              {/* Body */}
              <div className="flex flex-col gap-5 px-5 py-4 overflow-y-auto flex-1">

                {/* Class Count */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                    Class Count
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCount((c) => Math.max(1, c - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-2xl font-black text-foreground w-8 text-center tabular-nums">
                      {count}
                    </span>
                    <button
                      onClick={() => setCount((c) => Math.min(maxCount, c + 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                    <span className="text-xs text-muted-foreground ml-1">
                      of {availableCount} available
                    </span>
                  </div>
                </div>

                {/* Repetitions */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Allow Repetitions
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">
                      Same class can appear twice
                    </p>
                  </div>
                  <button
                    onClick={() => setRepetitions((r) => !r)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      repetitions ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <motion.span
                      layout
                      className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                      animate={{ left: repetitions ? "calc(100% - 20px)" : "4px" }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                <div className="h-px bg-border" />

                {/* Excluded Classes */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Exclude Classes
                      </label>
                      {excludedClasses.length > 0 && (
                        <span className="text-xs bg-primary/20 text-primary rounded-full px-2 py-0.5">
                          {excludedClasses.length}
                        </span>
                      )}
                    </div>
                    {/* List / Grid toggle */}
                    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                          viewMode === "grid"
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <LayoutGrid size={13} />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                          viewMode === "list"
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <List size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Search */}
                  <input
                    type="text"
                    placeholder="Search classes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-lg bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />

                  {/* Class list / grid */}
                  <div
                    className={`overflow-y-auto rounded-xl border border-border bg-background/50 p-2 ${
                      viewMode === "grid"
                        ? "grid grid-cols-3 gap-1.5"
                        : "flex flex-col gap-0.5"
                    }`}
                    style={{ maxHeight: "200px" }}
                  >
                    {filteredClasses.map((cls) => {
                      const isExcluded = excludedClasses.includes(cls);
                      return (
                        <motion.button
                          key={cls}
                          onClick={() => toggleExclude(cls)}
                          whileTap={{ scale: 0.95 }}
                          className={`transition-colors rounded-lg ${
                            viewMode === "grid"
                              ? `flex items-center justify-center py-2 px-1 text-xs font-medium text-center ${
                                  isExcluded
                                    ? "bg-destructive/20 text-destructive border border-destructive/30"
                                    : "bg-muted hover:bg-accent hover:text-accent-foreground"
                                }`
                              : `flex items-center justify-between px-3 py-1.5 text-sm ${
                                  isExcluded
                                    ? "bg-destructive/10 text-destructive"
                                    : "hover:bg-muted text-foreground"
                                }`
                          }`}
                        >
                          {viewMode === "list" ? (
                            <>
                              <span className="capitalize">{cls}</span>
                              {isExcluded && <X size={12} className="flex-shrink-0" />}
                            </>
                          ) : (
                            <span className="capitalize leading-tight">{cls}</span>
                          )}
                        </motion.button>
                      );
                    })}
                    {filteredClasses.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4 col-span-3">
                        No classes found
                      </p>
                    )}
                  </div>

                  {excludedClasses.length > 0 && (
                    <button
                      onClick={() => setExcludedClasses([])}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors self-start"
                    >
                      Clear all exclusions
                    </button>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="h-px bg-border mx-5" />
              <div className="px-5 py-4">
                <motion.button
                  onClick={handleStart}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading || (count > availableCount && !repetitions)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-wider py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                >
                  {isLoading ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : (
                    <>
                      <Play size={15} fill="currentColor" />
                      Start Game
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}