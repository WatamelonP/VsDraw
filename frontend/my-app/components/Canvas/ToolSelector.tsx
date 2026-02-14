'use client';
import React from 'react';
import { IconPencil, IconEraser, IconPalette } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'motion/react';
import { FloatingDock } from '@/components/ui/floating-dock';
import ColorPicker from './Color';

type Props = {
  tool: string;
  onChange: (tool: string) => void;
};

// Custom cursor definitions
// This will use the current text color (respects light/dark mode)
const CURSORS = {
  pen: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2\"><path d=\"M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z\"/></svg>') 0 24, auto",
  eraser: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2\"><path d=\"M18 13.5L8 3.5L2 9.5L12 19.5L18 13.5Z\"/><path d=\"M8 3.5L12 7.5\"/><line x1=\"16\" y1=\"12\" x2=\"21\" y2=\"17\"/><line x1=\"7\" y1=\"20\" x2=\"17\" y2=\"10\"/></svg>') 0 24, auto",
  color: 'default'
};
const ToolSelector: React.FC<Props> = ({ tool, onChange }) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 50, y: 50 });
  const dragRef = React.useRef<HTMLDivElement>(null);
  const dragOffsetRef = React.useRef({ x: 0, y: 0 });

  // Update cursor when tool changes
  React.useEffect(() => {
    // Apply cursor to the whole page
    document.body.style.cursor = CURSORS[tool as keyof typeof CURSORS] || CURSORS.color;
    
    // Cleanup - reset cursor when component unmounts
    return () => {
      document.body.style.cursor = 'default';
    };
  }, [tool]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('input, select, label, button')) return;
    setIsDragging(true);
    if (dragRef.current) {
      dragOffsetRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragOffsetRef.current.x,
      y: e.clientY - dragOffsetRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const handleToolChange = (newTool: string) => {
    onChange(newTool);
  };

  const items = [
    {
      title: 'Pen',
      href: '#',
      icon: <IconPencil className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      onClick: () => handleToolChange('pen'),
    },
    {
      title: 'Eraser',
      href: '#',
      icon: <IconEraser className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      onClick: () => handleToolChange('eraser'),
    },
    {
      title: 'Color',
      href: '#',
      icon: <IconPalette className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      onClick: () => handleToolChange('color'),
    }
  ];

  return (
    <div
      ref={dragRef}
      onMouseDown={handleMouseDown}
      style={{ left: `${position.x}px`, top: `${position.y}px`, position: 'fixed', zIndex: 1000 }}
    >
      <FloatingDock 
        items={items} 
        desktopClassName="!mx-0" 
        mobileClassName="!translate-y-0" 
      />
      
    
    </div>
  );
};

export default ToolSelector;