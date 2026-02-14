"use client";
import React from "react";
import { IconPencil, IconEraser, IconPalette } from "@tabler/icons-react";
import { FloatingDock } from "@/components/ui/floating-dock";
import ColorPicker from "./ColorPalette";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
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
};

const CURSORS = {
  pen: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2\"><path d=\"M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z\"/></svg>') 0 24, auto",
  eraser: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2\"><path d=\"M18 13.5L8 3.5L2 9.5L12 19.5L18 13.5Z\"/><path d=\"M8 3.5L12 7.5\"/><line x1=\"16\" y1=\"12\" x2=\"21\" y2=\"17\"/><line x1=\"7\" y1=\"20\" x2=\"17\" y2=\"10\"/></svg>') 0 24, auto",
  color: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></svg>') 0 24, auto",
};

const ToolSelector: React.FC<Props> = ({ tool, onChange, onColorChange, onWidthChange, currentWidth, onEraserWidthChange, currentEraserWidth }) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 50, y: 50 });
  const [popoverOpen, setPopoverOpen] = React.useState<null | 'color' | 'pen' | 'eraser'>(null);
  const [penColor, setPenColor] = React.useState<string>("#ffffff");

  const dragRef = React.useRef<HTMLDivElement>(null);
  const dragOffsetRef = React.useRef({ x: 0, y: 0 });

  // Apply cursor to body and also to the dock container
  React.useEffect(() => {
    document.body.style.cursor = CURSORS[tool as keyof typeof CURSORS] ?? "default";
    
    // Also apply to the dock container to override any PopoverTrigger interference
    if (dragRef.current) {
      dragRef.current.style.cursor = CURSORS[tool as keyof typeof CURSORS] ?? "default";
    }

    return () => {
      document.body.style.cursor = "default";
    };
  }, [tool]);

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
    setPosition({
      x: e.clientX - dragOffsetRef.current.x,
      y: e.clientY - dragOffsetRef.current.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  React.useEffect(() => {
    if (!isDragging) return;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleToolChange = (newTool: string) => {
    if (newTool === "color") {
      setPopoverOpen('color');
      onChange('color');
      return;
    }
    if (newTool === 'pen') {
      setPopoverOpen('pen');
      onChange('pen');
      return;
    }
    if (newTool === 'eraser') {
      setPopoverOpen('eraser');
      onChange('eraser');
      return;
    }
    setPopoverOpen(null);
    onChange(newTool);
  };

  const items = [
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
      {/* THE DOCK IS THE TRIGGER / ANCHOR */}
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
            cursor: CURSORS[tool as keyof typeof CURSORS] ?? "default", // Force cursor on container
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
        className="z-1001 w-auto p-0 bg-transparent border-none shadow-none"
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