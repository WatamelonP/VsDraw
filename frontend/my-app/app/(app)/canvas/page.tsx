"use client";
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ModeToggle } from "@/components/ThemeToggle";
import Canvas from "@/components/Canvas/Canvas";

export default function Page() {
  return (
    <Provider store={store}>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Canvas />
      </div>
    </Provider>
  );
}
 