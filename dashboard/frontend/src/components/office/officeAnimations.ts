import type { Variants } from "framer-motion";

export const characterVariants: Variants = {
  entering: {
    scale: [0, 1.15, 1],
    opacity: [0, 1, 1],
    y: [-30, 0],
    transition: { duration: 0.6, ease: "easeOut" },
  },
  idle: {
    scale: 1,
    opacity: 0.5,
    y: 0,
    transition: { duration: 0.4 },
  },
  working: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
  completed: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
  failed: {
    scale: 1,
    opacity: 1,
    y: 0,
    x: [0, -3, 3, -3, 3, 0],
    transition: { duration: 0.5, ease: "easeInOut" },
  },
};

export const documentFlyVariants: Variants = {
  atDesk: (custom: { startX: number; startY: number }) => ({
    x: custom.startX,
    y: custom.startY,
    opacity: 1,
    scale: 1,
  }),
  atBoard: (custom: { endX: number; endY: number }) => ({
    x: custom.endX,
    y: custom.endY,
    opacity: [1, 1, 0],
    scale: [1, 0.8, 0.5],
    transition: { duration: 1, ease: "easeInOut" },
  }),
};

export const typingDotVariants: Variants = {
  idle: { y: 0 },
  bounce: (i: number) => ({
    y: [0, -4, 0],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      repeatDelay: 0.8,
      delay: i * 0.15,
    },
  }),
};

export const pulseVariants: Variants = {
  pulse: {
    opacity: [0.5, 0.8, 0.5],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
};

export const glowVariants: Variants = {
  glow: {
    r: [16, 19, 16],
    opacity: [0.3, 0.6, 0.3],
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
  },
};
