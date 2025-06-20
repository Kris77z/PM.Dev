"use client" 

import * as React from "react"
import { motion } from "framer-motion";
 
export function ShiningText({text}: {text: string}) {
  return (
    <motion.h1
      className="bg-[linear-gradient(110deg,#404040,35%,#fff,50%,#404040,75%,#404040)] bg-[length:200%_100%] bg-clip-text text-base font-medium text-transparent"
      initial={{ backgroundPosition: "200% 0" }}
      animate={{ backgroundPosition: "-200% 0" }}
      transition={{
        repeat: Infinity,
        duration: 1.2,
        ease: "linear",
      }}
    >
      {text}
    </motion.h1>
  );
} 