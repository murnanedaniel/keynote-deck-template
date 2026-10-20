"use client";

import { motion } from "motion/react";
import { SceneFrame } from "@/components/kit/SceneFrame";
import { TALK } from "@/content/talk";

const item = {
  hidden: { opacity: 0, y: 8 },
  shown: { opacity: 1, y: 0 },
};

export function TitleScene() {
  return (
    <SceneFrame bare texture="grid">
      <motion.div
        className="absolute inset-0 flex items-center px-[5vw]"
        initial="hidden"
        animate="shown"
        transition={{ staggerChildren: 0.1, delayChildren: 0.15 }}
      >
        <div className="max-w-[1150px]">
          <motion.h1 variants={item} className="t-title whitespace-nowrap">{TALK.title}</motion.h1>
          <motion.p variants={item} className="t-body mt-[2.5vh] text-muted">{TALK.subtitle}</motion.p>
          <motion.p variants={item} className="t-body mt-[7vh]">{TALK.speaker} · {TALK.affiliation}</motion.p>
          <motion.p variants={item} className="t-label mt-[1.5vh] text-faint">{TALK.venue} · {TALK.date}</motion.p>
        </div>
      </motion.div>
    </SceneFrame>
  );
}
