'use client';
import React, { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { Users, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { User } from '@/store/slices/roomSlice';

const ScoreBoard: React.FC = () => {
  const users = useAppSelector((state) => state.room.users) as User[];
  const scores = useAppSelector((state) => state.game.scores);
  const [isOpen, setIsOpen] = useState(true);

  // Combine users with their scores
  const rankedUsers = [...users].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));

  return (
    <div 
      className={`fixed top-24 bottom-4 w-60 bg-card/80 backdrop-blur-md border border-border rounded-r-2xl shadow-2xl flex flex-col z-40 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0 left-0' : '-translate-x-full left-0'
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-8 top-4 bg-card/80 backdrop-blur-md border border-border border-l-0 p-1 rounded-r-lg shadow-md hover:bg-muted/50 transition-colors"
      >
        {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>

      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-primary" />
          <h3 className="text-sm font-black uppercase tracking-widest">Players</h3>
        </div>
        <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
          {users.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {rankedUsers.map((user, index) => (
          <div 
            key={user.id} 
            className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  index === 0 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-muted text-muted-foreground'
                }`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                {index === 0 && (
                  <Trophy size={12} className="absolute -top-1 -right-1 text-yellow-500 fill-yellow-500" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold truncate max-w-[100px]">
                  {user.name}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-tight">
                  {index === 0 ? 'Leader' : 'Player'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-foreground">
                {scores[user.id] || 0}
              </span>
              <p className="text-[9px] text-muted-foreground uppercase font-bold">Pts</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-muted/30 border-t border-border mt-auto">
        <p className="text-[10px] text-muted-foreground text-center font-medium uppercase tracking-widest">
          VsDraw Multiplayer
        </p>
      </div>
    </div>
  );
};

export default ScoreBoard;
