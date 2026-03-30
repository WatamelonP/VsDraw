'use client';
import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setCurrentRoom } from '@/store/slices/roomSlice';
import MultiplayerCanvas from '@/components/MultiplayerCanvas/Canvas';
import Menu from '@/components/LandingPage/Menu';

import { useSearchParams } from 'next/navigation';

export default function MultiplayerPage() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  useEffect(() => {
    const roomId = searchParams.get('roomId');
    if (roomId) {
      dispatch(setCurrentRoom({ id: roomId, name: "Collaborative Session" }));
    } else {
      // Fallback
      dispatch(setCurrentRoom({ id: "lobby", name: "Public Lobby" }));
    }
  }, [dispatch, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Menu />
      <MultiplayerCanvas />
    </div>
  );
}
