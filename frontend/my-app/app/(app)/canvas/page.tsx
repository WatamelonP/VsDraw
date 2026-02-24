"use client";
import { Provider } from 'react-redux';
import { store } from '@/store';
import { useAppDispatch } from '@/store/hooks';
import { setClasses } from '@/store/slices/gameSlice';
import { useEffect } from 'react';
import Canvas from "@/components/Canvas/Canvas";

function GameInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/drawing/target', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: 5, repetitions: false, exclude_classes: [] })
    })
      .then(res => res.json())
      .then(data => dispatch(setClasses(data.classes)));
  }, []);

  return <Canvas />;
}

export default function Page() {
  return (
    <Provider store={store}>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <GameInitializer />
      </div>
    </Provider>
  );
}