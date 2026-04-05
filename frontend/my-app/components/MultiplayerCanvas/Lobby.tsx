'use client';
import React, { useState, useEffect } from 'react';
import * as motion from "motion/react-client";
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setGameSettings, GameSettings } from '@/store/slices/roomSlice';
import {
  Users, Play, Copy, Check, Minus, Plus, LayoutGrid, List, X,
  Shield, CheckCircle2, Circle, Settings2, Crown
} from 'lucide-react';
import { User } from '@/store/slices/roomSlice';

// ─── All available classes (must match CLASS_NAMES on backend) ────────────────
const ALL_CLASSES = [
  "airplane", "alarm clock", "ambulance", "angel", "ant", "anvil", "apple",
  "arm", "axe", "backpack", "banana", "bandage", "baseball bat", "baseball",
  "basket", "basketball", "bat", "bathtub", "beach", "bear", "beard", "bed",
  "bee", "belt", "bench", "bicycle", "binoculars", "bird", "birthday cake",
  "blueberry", "book", "bowtie", "bracelet", "bread", "bridge", "broccoli",
  "broom", "bucket",
];

interface LobbyProps {
  onStartGame: (settings: { count: number; repetitions: boolean; excludeClasses: string[] }) => void;
  sendMessage: (type: string, data: any) => void;
  userId: string;
}

const Lobby: React.FC<LobbyProps> = ({ onStartGame, sendMessage, userId }) => {
  const dispatch = useAppDispatch();
  const users = useAppSelector((state) => state.room.users) as User[];
  const roomId = useAppSelector((state) => state.room.currentRoomId);
  const gameSettings = useAppSelector((state) => state.room.gameSettings);

  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Local copies of settings for the host to edit
  const [count, setCount] = useState(gameSettings.count);
  const [repetitions, setRepetitions] = useState(gameSettings.repetitions);
  const [excludedClasses, setExcludedClasses] = useState<string[]>(gameSettings.excludeClasses);

  // Sync from Redux when settings arrive from server (for non-host players)
  useEffect(() => {
    setCount(gameSettings.count);
    setRepetitions(gameSettings.repetitions);
    setExcludedClasses(gameSettings.excludeClasses);
  }, [gameSettings]);

  // Host detection: first user in the array
  const isHost = users.length > 0 && users[0]?.id === userId;

  // Ready state helpers
  const selfUser = users.find(u => u.id === userId);
  const isReady = selfUser?.isReady ?? false;
  const nonHostUsers = users.slice(1);
  const allReady = nonHostUsers.length > 0 && nonHostUsers.every(u => u.isReady);
  const readyCount = nonHostUsers.filter(u => u.isReady).length;

  const filteredClasses = ALL_CLASSES.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );
  const availableCount = ALL_CLASSES.length - excludedClasses.length;
  const maxCount = repetitions ? 99 : availableCount;

  const handleCopy = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleExclude = (cls: string) => {
    if (!isHost) return;
    const next = excludedClasses.includes(cls)
      ? excludedClasses.filter((c) => c !== cls)
      : [...excludedClasses, cls];
    setExcludedClasses(next);
    broadcastSettings({ count, repetitions, excludeClasses: next });
  };

  const handleCountChange = (delta: number) => {
    if (!isHost) return;
    const next = Math.max(1, Math.min(maxCount, count + delta));
    setCount(next);
    broadcastSettings({ count: next, repetitions, excludeClasses: excludedClasses });
  };

  const handleRepetitionsToggle = () => {
    if (!isHost) return;
    const next = !repetitions;
    setRepetitions(next);
    broadcastSettings({ count, repetitions: next, excludeClasses: excludedClasses });
  };

  const broadcastSettings = (settings: GameSettings) => {
    dispatch(setGameSettings(settings));
    sendMessage('GAME_SETTINGS_UPDATE', { settings });
  };

  const handleToggleReady = () => {
    const next = !isReady;
    sendMessage('PLAYER_READY', { user_id: userId, isReady: next });
  };

  const handleStart = () => {
    onStartGame({ count, repetitions, excludeClasses: excludedClasses });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 z-40 relative">
      <div className="w-full max-w-4xl flex flex-col gap-6">

        {/* Top — Room Code */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl font-black uppercase tracking-widest text-primary text-center">
            Waiting Lobby
          </h1>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {isHost
              ? 'Configure game settings and start when all players are ready.'
              : 'Wait for the host to configure the game. Hit Ready when you\'re set!'}
          </p>
          <div className="flex items-center gap-3 mt-2 bg-muted/50 px-5 py-3 rounded-2xl border border-border shadow-inner">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Room ID</span>
              <span className="text-xl font-black tracking-widest text-foreground">{roomId}</span>
            </div>
            <div className="h-8 w-px bg-border mx-1" />
            <button
              onClick={handleCopy}
              className="p-2.5 bg-card hover:bg-muted border border-border rounded-xl transition-all shadow-sm active:scale-95"
              title="Copy Room ID"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-foreground" />}
            </button>
          </div>
        </div>

        {/* Main — Two Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* ──── Left Panel: Game Settings ──── */}
          <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 px-5 pt-5 pb-3">
              <Settings2 size={16} className="text-primary" />
              <h2 className="text-sm font-black uppercase tracking-widest text-foreground">
                Game Settings
              </h2>
              {!isHost && (
                <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-bold ml-auto">
                  View Only
                </span>
              )}
            </div>
            <div className="h-px bg-border mx-5" />

            <div className="flex flex-col gap-5 px-5 py-4 overflow-y-auto flex-1" style={{ maxHeight: '55vh' }}>

              {/* Class Count */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                  Class Count
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleCountChange(-1)}
                    disabled={!isHost}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-2xl font-black text-foreground w-8 text-center tabular-nums">
                    {count}
                  </span>
                  <button
                    onClick={() => handleCountChange(1)}
                    disabled={!isHost}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
                  onClick={handleRepetitionsToggle}
                  disabled={!isHost}
                  className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
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
                  <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-card text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <LayoutGrid size={13} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                        viewMode === 'list'
                          ? 'bg-card text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <List size={13} />
                    </button>
                  </div>
                </div>

                {isHost && (
                  <input
                    type="text"
                    placeholder="Search classes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-lg bg-muted border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                )}

                <div
                  className={`overflow-y-auto rounded-xl border border-border bg-background/50 p-2 ${
                    viewMode === 'grid'
                      ? 'grid grid-cols-3 gap-1.5'
                      : 'flex flex-col gap-0.5'
                  }`}
                  style={{ maxHeight: '180px' }}
                >
                  {filteredClasses.map((cls) => {
                    const isExcluded = excludedClasses.includes(cls);
                    return (
                      <button
                        key={cls}
                        onClick={() => toggleExclude(cls)}
                        disabled={!isHost}
                        className={`transition-colors rounded-lg disabled:cursor-default ${
                          viewMode === 'grid'
                            ? `flex items-center justify-center py-2 px-1 text-xs font-medium text-center ${
                                isExcluded
                                  ? 'bg-destructive/20 text-destructive border border-destructive/30'
                                  : 'bg-muted hover:bg-accent hover:text-accent-foreground'
                              }`
                            : `flex items-center justify-between px-3 py-1.5 text-sm ${
                                isExcluded
                                  ? 'bg-destructive/10 text-destructive'
                                  : isHost ? 'hover:bg-muted text-foreground' : 'text-foreground'
                              }`
                        }`}
                      >
                        {viewMode === 'list' ? (
                          <>
                            <span className="capitalize">{cls}</span>
                            {isExcluded && <X size={12} className="flex-shrink-0" />}
                          </>
                        ) : (
                          <span className="capitalize leading-tight">{cls}</span>
                        )}
                      </button>
                    );
                  })}
                  {filteredClasses.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4 col-span-3">
                      No classes found
                    </p>
                  )}
                </div>

                {isHost && excludedClasses.length > 0 && (
                  <button
                    onClick={() => {
                      setExcludedClasses([]);
                      broadcastSettings({ count, repetitions, excludeClasses: [] });
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors self-start"
                  >
                    Clear all exclusions
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ──── Right Panel: Players & Ready ──── */}
          <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-primary" />
                <h2 className="text-sm font-black uppercase tracking-widest text-foreground">
                  Players
                </h2>
              </div>
              <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-bold">
                {users.length} / 8
              </span>
            </div>
            <div className="h-px bg-border mx-5" />

            <div className="flex flex-col gap-2 px-5 py-4 overflow-y-auto flex-1" style={{ maxHeight: '55vh' }}>
              {users.length === 0 ? (
                <p className="text-sm text-muted-foreground italic text-center py-6">Connecting to server...</p>
              ) : (
                users.map((user, i) => {
                  const isSelf = user.id === userId;
                  const isUserHost = i === 0;
                  return (
                    <div
                      key={user.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        isSelf
                          ? 'bg-primary/5 border-primary/20'
                          : 'bg-card border-border'
                      }`}
                    >
                      {/* Avatar */}
                      <div className={`relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                        isUserHost ? 'bg-yellow-500/20 text-yellow-500' : 'bg-muted text-muted-foreground'
                      }`}>
                        {user.name.charAt(0).toUpperCase()}
                        {isUserHost && (
                          <Crown size={10} className="absolute -top-1 -right-1 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>

                      {/* Name & Status */}
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-bold text-sm text-foreground truncate">
                          {user.name}
                          {isSelf && <span className="text-xs text-muted-foreground ml-1">(you)</span>}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wide">
                          {isUserHost ? (
                            <span className="text-yellow-500">Host</span>
                          ) : user.isReady ? (
                            <span className="text-green-500">Ready</span>
                          ) : (
                            <span className="text-muted-foreground">Not Ready</span>
                          )}
                        </span>
                      </div>

                      {/* Ready indicator / button */}
                      {!isUserHost && (
                        isSelf ? (
                          <motion.button
                            onClick={handleToggleReady}
                            whileTap={{ scale: 0.9 }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-1.5 ${
                              isReady
                                ? 'bg-green-500/20 text-green-500 border border-green-500/30 hover:bg-green-500/30'
                                : 'bg-muted text-muted-foreground border border-border hover:bg-accent hover:text-accent-foreground'
                            }`}
                          >
                            {isReady ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                            {isReady ? 'Ready' : 'Ready Up'}
                          </motion.button>
                        ) : (
                          <div className={`flex items-center gap-1 text-xs font-bold ${
                            user.isReady ? 'text-green-500' : 'text-muted-foreground/50'
                          }`}>
                            {user.isReady ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                          </div>
                        )
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Ready count & Start button */}
            <div className="border-t border-border px-5 py-4 mt-auto">
              {nonHostUsers.length > 0 && (
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className={`h-2 w-2 rounded-full ${allReady ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {readyCount} / {nonHostUsers.length} Ready
                  </span>
                </div>
              )}

              {isHost ? (
                <motion.button
                  onClick={handleStart}
                  whileHover={allReady ? { scale: 1.02 } : {}}
                  whileTap={allReady ? { scale: 0.98 } : {}}
                  disabled={!allReady}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl font-black uppercase tracking-wider py-4 text-sm transition-all ${
                    allReady
                      ? 'bg-primary text-primary-foreground shadow-lg hover:brightness-110'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  <Play size={15} fill="currentColor" />
                  {allReady ? 'Start Match' : 'Waiting for players...'}
                </motion.button>
              ) : (
                <div className="text-center text-xs text-muted-foreground font-medium uppercase tracking-wider py-2">
                  <Shield size={14} className="inline mr-1.5 opacity-50" />
                  Waiting for host to start
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Lobby;
