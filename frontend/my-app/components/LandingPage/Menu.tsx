"use client"

import type { Variants } from "motion/react"
import * as motion from "motion/react-client"
import { useEffect, useRef, useState } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string
  href?: string
  onClick?: () => void
}

interface SidebarNavProps {
  items?: NavItem[]
}

// ─── Variants ─────────────────────────────────────────────────────────────────

const sidebarVariants: Variants = {
  open: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 35,
    },
  },
  closed: {
    x: "-100%",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 40,
      delay: 0.15,
    },
  },
}

const backdropVariants: Variants = {
  open: { opacity: 1, pointerEvents: "auto" as const },
  closed: { opacity: 0, pointerEvents: "none" as const },
}

const navListVariants: Variants = {
  open: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.15,
    },
  },
  closed: {
    transition: {
      staggerChildren: 0.04,
      staggerDirection: -1,
    },
  },
}

const navItemVariants: Variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 25 },
      opacity: { duration: 0.2 },
    },
  },
  closed: {
    x: -30,
    opacity: 0,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 25 },
      opacity: { duration: 0.15 },
    },
  },
}

const closeButtonVariants: Variants = {
  open: { opacity: 1, x: 0, transition: { delay: 0.1 } },
  closed: { opacity: 0, x: -10 },
}

// ─── Sub-components ───────────────────────────────────────────────────────────



const MenuToggle = ({ toggle }: { toggle: () => void }) => (
  <button
    onClick={toggle}
    aria-label="Toggle menu"
    className="relative z-50 flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-sm hover:bg-muted transition-colors"
  >
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <motion.path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        variants={{
          closed: { d: "M 2 4 L 14 4" },
          open:   { d: "M 3 13 L 13 3" },
        }}
      />
      <motion.path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        d="M 2 8 L 14 8"
        variants={{
          closed: { opacity: 1 },
          open:   { opacity: 0 },
        }}
        transition={{ duration: 0.1 }}
      />
      <motion.path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        variants={{
          closed: { d: "M 2 12 L 14 12" },
          open:   { d: "M 3 3 L 13 13" },
        }}
      />
    </svg>
  </button>
)

// ─── Main Component ───────────────────────────────────────────────────────────

const DEFAULT_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Play", href: "/play" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Settings", href: "/settings" },
  { label: "About", href: "/about" },
]

export default function SidebarNav({ items = DEFAULT_ITEMS }: SidebarNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  return (
    <motion.div
      initial={false}
      animate={isOpen ? "open" : "closed"}
      className="relative"
    >
      {/* Hamburger toggle — always visible */}
      <div className="fixed top-5 left-5 z-50">
        <MenuToggle toggle={() => setIsOpen(!isOpen)} />
      </div>

      {/* Backdrop */}
      <motion.div
        variants={backdropVariants}
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
      />

      {/* Sidebar panel */}
      <motion.nav
        variants={sidebarVariants}
        className="fixed left-0 top-0 z-40 h-full w-80 bg-card border-r border-border shadow-2xl flex flex-col"
      >
        {/* PROBLEM 1 */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          
        </div>

        {/* Divider */}
        <motion.div
          variants={closeButtonVariants}
          className="mx-6 h-px bg-border my-3"
        />

        {/* Nav items */}
        <motion.ul
          variants={navListVariants}
          className="flex flex-col gap-1 px-6 pt-4 flex-1"
        >
          {items.map((item) => (
            <motion.li key={item.label} variants={navItemVariants}>
              <a
                href={item.href ?? "#"}
                onClick={(e) => {
                  if (item.onClick) {
                    e.preventDefault()
                    item.onClick()
                  }
                  setIsOpen(false)
                }}
                className="group flex items-center gap-3 py-2 text-3xl font-black uppercase tracking-tight text-foreground hover:text-primary transition-colors"
                style={{ fontFamily: "var(--font-handwriting)" }}
              >
                
                {/* Animated bullet */}
                <motion.span
                  className="inline-block h-2 w-2 rounded-full bg-primary flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                />
                {item.label}
              </a>
            </motion.li>
          ))}
        </motion.ul>

        {/* Bottom card — like the Instagram card in the reference */}
        <motion.div
          variants={closeButtonVariants}
          className="mx-6 mb-8 mt-4 rounded-2xl bg-muted border border-border overflow-hidden"
        >
          <div className="p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Drawing Game
            </p>
            <p className="text-sm text-foreground font-medium leading-snug">
              Draw fast. Guess right. Beat everyone.
            </p>
          </div>
        </motion.div>
      </motion.nav>
    </motion.div>
  )
}