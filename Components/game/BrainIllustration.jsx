import React from 'react';
import { motion } from 'framer-motion';

const REGION_PATHS = {
  amygdala: { cx: 55, cy: 65, label: "Amygdala" },
  vta: { cx: 50, cy: 75, label: "VTA" },
  hippocampus: { cx: 60, cy: 60, label: "Hippocampus" },
  acc: { cx: 40, cy: 35, label: "ACC" },
  precuneus: { cx: 35, cy: 30, label: "Precuneus" },
  ofc: { cx: 70, cy: 55, label: "OFC" },
  mpfc: { cx: 65, cy: 40, label: "mPFC" },
  insula: { cx: 50, cy: 50, label: "Insula" },
  pallidum: { cx: 52, cy: 58, label: "Pallidum" },
  visual: { cx: 25, cy: 45, label: "Visual Cortex" },
  sts: { cx: 35, cy: 55, label: "STS" },
  hypothalamus: { cx: 55, cy: 70, label: "Hypothalamus" },
  lpfc: { cx: 72, cy: 35, label: "LPFC" },
  cerebellum: { cx: 25, cy: 70, label: "Cerebellum" },
  temporal: { cx: 40, cy: 65, label: "Temporal" },
  raphe: { cx: 45, cy: 78, label: "Raphe" },
  locus: { cx: 35, cy: 72, label: "Locus Coeruleus" },
  pag: { cx: 42, cy: 68, label: "PAG" },
  adrenal: { cx: 50, cy: 85, label: "Adrenal" },
  pituitary: { cx: 55, cy: 72, label: "Pituitary" },
  cortex: { cx: 50, cy: 25, label: "Cortex" },
  nac: { cx: 58, cy: 62, label: "NAcc" },
};

export default function BrainIllustration({ highlightRegion, size = "large", className = "" }) {
  const region = REGION_PATHS[highlightRegion] || REGION_PATHS.cortex;
  const isLarge = size === "large";
  const svgSize = isLarge ? 280 : 140;
  
  return (
    <div className={`relative ${className}`}>
      <svg 
        viewBox="0 0 100 100" 
        width={svgSize} 
        height={svgSize}
        className="drop-shadow-lg"
      >
        {/* Brain outline - side view */}
        <defs>
          <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fce7f3" />
            <stop offset="50%" stopColor="#f9a8d4" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
          <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Cerebellum */}
        <ellipse 
          cx="25" cy="72" rx="12" ry="10"
          fill="url(#brainGradient)"
          stroke="#ec4899"
          strokeWidth="1"
        />
        
        {/* Brain stem */}
        <path
          d="M 50 80 Q 45 85 48 95 Q 50 98 52 95 Q 55 85 50 80"
          fill="url(#brainGradient)"
          stroke="#ec4899"
          strokeWidth="1"
        />
        
        {/* Main brain - cerebrum */}
        <path
          d="M 75 50 
             Q 85 35 75 20 
             Q 60 5 40 15 
             Q 20 25 18 45 
             Q 15 65 30 75 
             Q 45 85 60 80 
             Q 75 75 80 60 
             Q 82 55 75 50"
          fill="url(#brainGradient)"
          stroke="#ec4899"
          strokeWidth="1.5"
        />
        
        {/* Gyri patterns */}
        <path
          d="M 35 25 Q 45 20 55 25 M 30 35 Q 45 28 60 35 M 25 48 Q 40 40 55 45"
          fill="none"
          stroke="#f9a8d4"
          strokeWidth="1"
          opacity="0.6"
        />
        
        {/* Highlighted region */}
        <motion.circle
          cx={region.cx}
          cy={region.cy}
          r={isLarge ? 8 : 6}
          fill="url(#highlightGradient)"
          filter="url(#glow)"
          initial={{ scale: 0.8, opacity: 0.7 }}
          animate={{ 
            scale: [0.8, 1.1, 0.8],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Region label line */}
        <line
          x1={region.cx}
          y1={region.cy}
          x2={region.cx + 15}
          y2={region.cy - 15}
          stroke="#7c3aed"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
      </svg>
      
      {/* Floating hearts decoration */}
      {isLarge && (
        <>
          <motion.div
            className="absolute -top-2 -right-2 text-pink-400 text-xl"
            animate={{ y: [-5, 5, -5], rotate: [0, 10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            💕
          </motion.div>
          <motion.div
            className="absolute bottom-0 -left-4 text-pink-300 text-lg"
            animate={{ y: [5, -5, 5], rotate: [0, -10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          >
            💗
          </motion.div>
        </>
      )}
    </div>
  );
}
