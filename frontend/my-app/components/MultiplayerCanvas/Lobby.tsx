'use client';
import React, { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { Users, Play, Copy, Check } from 'lucide-react';
import { User } from '@/store/slices/roomSlice';

interface LobbyProps {
  onStartGame: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ onStartGame }) => {
  const users = useAppSelector((state) => state.room.users) as User[];
  const roomId = useAppSelector((state) => state.room.currentRoomId);
  const [copied, setCopied] = useState(false);

  // Consider the first user in the array as the host for starting the match
  const isHost = users[0]?.id === (users.find(u => u.name.startsWith("Player"))?.id || users[0]?.id); 

  const handleCopy = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 z-40 relative">
      <div className="w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl p-8 flex flex-col items-center">
        <h1 className="text-3xl font-black uppercase tracking-widest text-primary mb-2 text-center">Waiting Lobby</h1>
        <p className="text-sm text-muted-foreground mb-8 text-center max-w-sm">
          Wait for players to join. Only the host can start the match when everyone is ready.
        </p>
        
        {/* Room Code Box */}
        <div className="flex items-center gap-3 mb-8 bg-muted/50 px-6 py-4 rounded-2xl border border-border shadow-inner">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Room ID</span>
            <span className="text-2xl font-black tracking-widest text-foreground">{roomId}</span>
          </div>
          <div className="h-10 w-px bg-border mx-2" />
          <button 
            onClick={handleCopy}
            className="p-3 bg-card hover:bg-muted border border-border rounded-xl transition-all shadow-sm active:scale-95 flex flex-col items-center justify-center"
            title="Copy Room ID"
          >
            {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} className="text-foreground" />}
          </button>
        </div>

        {/* Players List */}
        <div className="w-full bg-muted/30 border border-border rounded-2xl p-6 mb-8 min-h-48">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
              <Users size={18} className="text-primary" />
              Connected
            </h2>
            <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-bold">
              {users.length} / 8
            </span>
          </div>
          
          <div className="flex flex-col gap-3">
            {users.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-6">Connecting to server...</p>
            ) : (
              users.map((user, i) => (
                <div key={user.id} className="flex items-center gap-4 bg-card border border-border p-3 rounded-xl shadow-sm">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    i === 0 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-muted text-muted-foreground'
                  }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-sm text-foreground">{user.name}</span>
                  {i === 0 && <span className="ml-auto text-[10px] uppercase font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-md">Host</span>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Start Game Button */}
        <button 
          onClick={onStartGame}
          className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-wider text-base shadow-[0_8px_30px_rgba(var(--primary),0.3)] hover:brightness-110 hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all"
        >
          <Play fill="currentColor" size={20} />
          Start Match
        </button>
      </div>
    </div>
  );
};

export default Lobby;
