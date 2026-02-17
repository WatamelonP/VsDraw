"use client";
import React from "react";
import { IconPencil, IconEraser, IconPalette, IconArrowBackUp, IconArrowForwardUp } from "@tabler/icons-react";
import { FloatingDock } from "@/components/ui/floating-dock";
import ColorPicker from "./ColorPalette";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import PenSlider from './PenSlider'
import EraserSlider from './EraserSlider'

type Props = {
  tool: string;
  onChange: (tool: string) => void;
  onColorChange?: (color: string) => void;
  onWidthChange?: (width: number) => void;
  currentWidth?: number;
  onEraserWidthChange?: (width: number) => void;
  currentEraserWidth?: number;
  // Add these new props
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
};

const CURSORS = {
  pen: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2\"><path d=\"M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z\"/></svg>') 0 24, auto",
  eraser: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2\"><path d=\"M18 13.5L8 3.5L2 9.5L12 19.5L18 13.5Z\"/><path d=\"M8 3.5L12 7.5\"/><line x1=\"16\" y1=\"12\" x2=\"21\" y2=\"17\"/><line x1=\"7\" y1=\"20\" x2=\"17\" y2=\"10\"/></svg>') 0 24, auto",
  color: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></svg>') 0 24, auto",
  undo: "default",
  redo: "default",
};

const ToolSelector: React.FC<Props> = ({ 
  tool, 
  onChange, 
  onColorChange, 
  onWidthChange, 
  currentWidth, 
  onEraserWidthChange, 
  currentEraserWidth,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 50, y: 50 });
  const [popoverOpen, setPopoverOpen] = React.useState<null | 'color' | 'pen' | 'eraser'>(null);
  const [penColor, setPenColor] = React.useState<string>("#ffffff");
  const [initialPositioned, setInitialPositioned] = React.useState(false);

  const dragRef = React.useRef<HTMLDivElement>(null);
  const dragOffsetRef = React.useRef({ x: 0, y: 0 });
  const lastPositionRef = React.useRef(position);
  const resizeObserverRef = React.useRef<ResizeObserver | null>(null);

  const snapPositions = {
    top: (dockWidth: number, dockHeight: number) => ({ x: (window.innerWidth - dockWidth) / 2, y: 20 }),
    bottom: (dockWidth: number, dockHeight: number) => ({ x: (window.innerWidth - dockWidth) / 2, y: window.innerHeight - dockHeight - 20 }),
    left: (dockWidth: number, dockHeight: number) => ({ x: 20, y: (window.innerHeight - dockHeight) / 2 }),
    right: (dockWidth: number, dockHeight: number) => ({ x: window.innerWidth - dockWidth - 20, y: (window.innerHeight - dockHeight) / 2 }),
  };

  const clampPosition = (pos: { x: number; y: number }, dockWidth: number, dockHeight: number) => {
    const minX = 10;
    const minY = 10;
    const maxX = Math.max(10, window.innerWidth - dockWidth - 10);
    const maxY = Math.max(10, window.innerHeight - dockHeight - 10);
    return {
      x: Math.min(Math.max(pos.x, minX), maxX),
      y: Math.min(Math.max(pos.y, minY), maxY),
    };
  };

  // Apply cursor to body and also to the dock container
  React.useEffect(() => {
    document.body.style.cursor = CURSORS[tool as keyof typeof CURSORS] ?? "default";
    
    if (dragRef.current) {
      dragRef.current.style.cursor = CURSORS[tool as keyof typeof CURSORS] ?? "default";
    }

    return () => {
      document.body.style.cursor = "default";
    };
  }, [tool]);

  // Initial positioning with ResizeObserver
  React.useEffect(() => {
    if (!dragRef.current) return;

    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }

    resizeObserverRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        
        if (width > 0 && height > 0 && !initialPositioned) {
          const bottom = snapPositions.bottom(width, height);
          setPosition(bottom);
          lastPositionRef.current = bottom;
          setInitialPositioned(true);
          resizeObserverRef.current?.disconnect();
        }
      }
    });

    resizeObserverRef.current.observe(dragRef.current);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [initialPositioned]);

  // Fallback timeout
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (!initialPositioned && dragRef.current) {
        const dockWidth = dragRef.current.offsetWidth || 200;
        const dockHeight = dragRef.current.offsetHeight || 64;
        const bottom = snapPositions.bottom(dockWidth, dockHeight);
        setPosition(bottom);
        lastPositionRef.current = bottom;
        setInitialPositioned(true);
      }
    }, 200);
    
    return () => clearTimeout(timeout);
  }, [initialPositioned]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("input, button, select")) return;
    setIsDragging(true);
    dragOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const newPos = {
      x: e.clientX - dragOffsetRef.current.x,
      y: e.clientY - dragOffsetRef.current.y,
    };
    const dockWidth = dragRef.current?.offsetWidth || 200;
    const dockHeight = dragRef.current?.offsetHeight || 64;
    const clamped = clampPosition(newPos, dockWidth, dockHeight);
    setPosition(clamped);
    lastPositionRef.current = clamped;
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    const dockWidth = dragRef.current?.offsetWidth || 200;
    const dockHeight = dragRef.current?.offsetHeight || 64;
    const pos = lastPositionRef.current || position;

    const threshold = 100;
    
    if (pos.y < threshold) {
      setPosition(clampPosition(snapPositions.top(dockWidth, dockHeight), dockWidth, dockHeight));
      return;
    }

    if (pos.y > window.innerHeight - threshold) {
      setPosition(clampPosition(snapPositions.bottom(dockWidth, dockHeight), dockWidth, dockHeight));
      return;
    }

    if (pos.x < threshold) {
      setPosition(clampPosition(snapPositions.left(dockWidth, dockHeight), dockWidth, dockHeight));
      return;
    }

    if (pos.x > window.innerWidth - threshold) {
      setPosition(clampPosition(snapPositions.right(dockWidth, dockHeight), dockWidth, dockHeight));
      return;
    }

    setPosition(clampPosition(pos, dockWidth, dockHeight));
  };

  React.useEffect(() => {
    if (!isDragging) return;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      if (dragRef.current) {
        const dockWidth = dragRef.current.offsetWidth;
        const dockHeight = dragRef.current.offsetHeight;
        const clamped = clampPosition(position, dockWidth, dockHeight);
        
        if (clamped.x !== position.x || clamped.y !== position.y) {
          setPosition(clamped);
          lastPositionRef.current = clamped;
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position]);

  const handleToolChange = (newTool: string) => {
    // Handle undo/redo separately
    if (newTool === "undo") {
      onUndo?.();
      return;
    }
    
    if (newTool === "redo") {
      onRedo?.();
      return;
    }

    // Toggle color popover without changing the active tool
    if (newTool === "color") {
      setPopoverOpen((prev) => (prev === 'color' ? null : 'color'));
      return;
    }

    // Toggle pen popover and activate pen when opening
    if (newTool === 'pen') {
      if (popoverOpen === 'pen') {
        setPopoverOpen(null);
        return;
      }
      setPopoverOpen('pen');
      onChange('pen');
      return;
    }

    // Toggle eraser popover and activate eraser when opening
    if (newTool === 'eraser') {
      if (popoverOpen === 'eraser') {
        setPopoverOpen(null);
        return;
      }
      setPopoverOpen('eraser');
      onChange('eraser');
      return;
    }

    setPopoverOpen(null);
    onChange(newTool);
  };

  const items = [
    {
      title: "Undo",
      icon: <IconArrowBackUp className={`h-full w-full ${!canUndo ? 'opacity-30' : 'text-neutral-500 dark:text-neutral-300'}`} />,
      onClick: () => handleToolChange("undo"),
      disabled: !canUndo,
    },
    {
      title: "Redo",
      icon: <IconArrowForwardUp className={`h-full w-full ${!canRedo ? 'opacity-30' : 'text-neutral-500 dark:text-neutral-300'}`} />,
      onClick: () => handleToolChange("redo"),
      disabled: !canRedo,
    },
    {
      title: "Pen",
      icon: <IconPencil className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      onClick: () => handleToolChange("pen"),
    },
    {
      title: "Eraser",
      icon: <IconEraser className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      onClick: () => handleToolChange("eraser"),
    },
    {
      title: "Color",
      icon: <IconPalette className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      onClick: () => handleToolChange("color"),
    },
  ];

  return (
    <Popover open={popoverOpen !== null} onOpenChange={(open) => { if (!open) setPopoverOpen(null); }}>
      <PopoverTrigger asChild>
        <div
          ref={dragRef}
          onMouseDown={handleMouseDown}
          style={{
            position: "fixed",
            left: position.x,
            top: position.y,
            zIndex: 1000,
            userSelect: "none",
            cursor: CURSORS[tool as keyof typeof CURSORS] ?? "default",
            opacity: initialPositioned ? 1 : 0,
            pointerEvents: initialPositioned ? 'auto' : 'none',
            transition: 'opacity 0.2s ease-in-out'
          }}
        >
          <FloatingDock
            items={items}
            desktopClassName="!mx-0"
            mobileClassName="!translate-y-0"
          />
        </div>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="center"
        sideOffset={10}
        className="z-[1001] w-auto p-0 bg-transparent border-none shadow-none"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onMouseEnter={() => {
          document.body.style.cursor = "default";
        }}
        onMouseLeave={() => {
          document.body.style.cursor = CURSORS[tool as keyof typeof CURSORS] ?? "default";
        }}
      >
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-2" style={{ cursor: "default" }}>
          {popoverOpen === 'color' && (
            <ColorPicker onColorSelect={(color) => {
              setPenColor(color);
              onColorChange?.(color);
            }} />
          )}

          {popoverOpen === 'pen' && (
            <div className="p-2">
              <PenSlider value={currentWidth ?? 5} onChange={(w) => {
                onWidthChange?.(w);
              }} />
            </div>
          )}

          {popoverOpen === 'eraser' && (
            <div className="p-2">
              <EraserSlider value={currentEraserWidth ?? 20} onChange={(w) => {
                onEraserWidthChange?.(w);
              }} />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ToolSelector;