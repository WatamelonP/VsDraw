"use client";
/**
 * Note: Use position fixed according to your needs
 * Desktop navbar is better positioned at the bottom
 * Mobile navbar is better positioned at bottom right.
 **/

import { cn } from "@/lib/utils";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";

import { useRef, useState } from "react";

type DockOrientation = "horizontal" | "vertical";

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
  orientation = "horizontal",
}: {
  items: ({ title: string; icon: React.ReactNode; onClick?: (e: React.MouseEvent) => void })[];
  desktopClassName?: string;
  mobileClassName?: string;
  orientation?: DockOrientation;
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} orientation={orientation} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
}: {
  items: ({ title: string; icon: React.ReactNode; onClick?: (e: React.MouseEvent) => void })[];
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: { delay: idx * 0.05 },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <button
                  key={item.title}
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault();
                      item.onClick(e);
                    }
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-card-foreground border border-border shadow-sm"
                >
                  <div className="h-4 w-4">{item.icon}</div>
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-muted-foreground border border-border shadow-sm"
      >
        <IconLayoutNavbarCollapse className="h-5 w-5" />
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
  orientation = "horizontal",
}: {
  items: ({ title: string; icon: React.ReactNode; onClick?: (e: React.MouseEvent) => void })[];
  className?: string;
  orientation?: DockOrientation;
}) => {
  const mouseX = useMotionValue(Infinity);
  const mouseY = useMotionValue(Infinity);

  const isVertical = orientation === "vertical";

  return (
    <motion.div
      onMouseMove={(e) => {
  if (isVertical) {
    mouseX.set(Infinity); // keep horizontal inactive
    mouseY.set(e.pageY);
  } else {
    mouseX.set(e.pageX);
    mouseY.set(Infinity); // keep vertical inactive
  }
}}
onMouseLeave={() => {
  mouseX.set(Infinity);
  mouseY.set(Infinity);
}}
      className={cn(
        "hidden md:flex gap-4 rounded-2xl bg-card border border-border shadow-md",
        isVertical
          ? "flex-col h-auto w-16 items-center py-4 px-3"
          : "flex-row h-16 items-end px-4 pb-3",
        className
      )}
    >
      {items.map((item) => (
         <IconContainer
    mouseX={mouseX}
    mouseY={mouseY}
    orientation={orientation}
    key={item.title}
    {...item}
  />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  mouseY,
  title,
  icon,
  onClick,
  orientation = "horizontal",
}: {
  mouseX: MotionValue;
  mouseY: MotionValue;
  title: string;
  icon: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  orientation?: DockOrientation;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isVertical = orientation === "vertical";

  // Horizontal distance (for horizontal dock)
  const distanceX = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Vertical distance (for vertical dock)
  const distanceY = useTransform(mouseY, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 };
    return val - bounds.y - bounds.height / 2;
  });

  const distance = isVertical ? distanceY : distanceX;

  const widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  const widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
  const heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);

  const width = useSpring(widthTransform, { mass: 0.1, stiffness: 150, damping: 12 });
  const height = useSpring(heightTransform, { mass: 0.1, stiffness: 150, damping: 12 });
  const widthIcon = useSpring(widthTransformIcon, { mass: 0.1, stiffness: 150, damping: 12 });
  const heightIcon = useSpring(heightTransformIcon, { mass: 0.1, stiffness: 150, damping: 12 });

  const [hovered, setHovered] = useState(false);

  // Tooltip position: above for horizontal, to the right for left dock, to the left for right dock
  const tooltipClass = isVertical
    ? "absolute left-full ml-2 top-1/2 -translate-y-1/2"
    : "absolute -top-8 left-1/2 w-fit -translate-x-1/2";

  return (
    <a
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick(e);
        }
      }}
    >
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex aspect-square items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, x: isVertical ? -4 : 0, y: isVertical ? 0 : 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: isVertical ? -4 : 0, y: isVertical ? 0 : 2 }}
              className={cn(
                "absolute z-50 w-fit rounded-md border border-border bg-popover px-2 py-0.5 text-xs whitespace-pre text-popover-foreground shadow-sm",
                tooltipClass
              )}
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center"
        >
          {icon}
        </motion.div>
      </motion.div>
    </a>
  );
}