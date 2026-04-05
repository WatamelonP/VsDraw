"use client";

import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setCurrentRoom, setPlayerName } from "@/store/slices/roomSlice";
import { X, Play, Users, Hash, UserRound } from "lucide-react";

interface MultiplayerSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MultiplayerSetupModal({ isOpen, onClose }: MultiplayerSetupModalProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [roomId, setRoomId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [nickname, setNickname] = useState("");
  const [mode, setMode] = useState<"create" | "join">("create");
  const [isLoading, setIsLoading] = useState(false);
  const [joinError, setJoinError] = useState("");

  const handleStart = async () => {
    if (mode === "create" && !roomName) return;
    if (mode === "join" && !roomId) return;
    if (!nickname.trim()) return;

    setIsLoading(true);
    setJoinError("");
    try {
      const finalRoomId = mode === "create" 
        ? Math.random().toString(36).substring(2, 8).toUpperCase()
        : roomId.toUpperCase();

      if (mode === "join") {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/multiplayer/room/${finalRoomId}/exists`);
        const data = await res.json();
        if (!data.exists) {
          setJoinError("Room not found. Please check the code.");
          setIsLoading(false);
          return;
        }
      }
      
      const finalRoomName = mode === "create" ? roomName : "Joined Room";

      dispatch(setCurrentRoom({ id: finalRoomId, name: finalRoomName }));
      dispatch(setPlayerName(nickname.trim()));
      onClose();
      router.push(`/multiplayer?roomId=${finalRoomId}`);
    } catch (err) {
      console.error("Failed to setup multiplayer session:", err);
      setJoinError("Connection failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit = nickname.trim().length > 0 && (mode === "create" ? roomName.length > 0 : roomId.length > 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

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
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div>
                  <h2 className="text-base font-black uppercase tracking-widest text-foreground">
                    Multiplayer
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Draw with friends
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
              <div className="flex flex-col gap-5 px-5 py-6">
                
                {/* Mode Selector */}
                <div className="flex p-1 bg-muted rounded-xl">
                  <button
                    onClick={() => setMode("create")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase transition-all rounded-lg ${
                      mode === "create" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                    }`}
                  >
                    <Users size={14} />
                    Create
                  </button>
                  <button
                    onClick={() => setMode("join")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase transition-all rounded-lg ${
                      mode === "join" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                    }`}
                  >
                    <Hash size={14} />
                    Join
                  </button>
                </div>

                {/* Player Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <UserRound size={12} />
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AceDrawer"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    maxLength={20}
                    className="w-full rounded-xl bg-muted border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                {mode === "create" ? (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Room Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. My Awesome Lobby"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      className="w-full rounded-xl bg-muted border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Room ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. AB1234"
                      value={roomId}
                      onChange={(e) => {
                        setRoomId(e.target.value.toUpperCase());
                        setJoinError("");
                      }}
                      className={`w-full rounded-xl bg-muted border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 ${
                        joinError ? "border-red-500 focus:ring-red-500" : "border-border focus:ring-ring"
                      }`}
                    />
                    {joinError && (
                      <p className="text-xs font-bold text-red-500 mt-1">{joinError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="h-px bg-border mx-5" />
              <div className="px-5 py-4">
                <motion.button
                  onClick={handleStart}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading || !canSubmit}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-wider py-4 text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                >
                  {isLoading ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : (
                    <>
                      <Play size={15} fill="currentColor" />
                      {mode === "create" ? "Create Room" : "Join Room"}
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
