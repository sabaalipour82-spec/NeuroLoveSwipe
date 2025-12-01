import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import BrainIllustration from './BrainIllustration';
import { Heart, Users, Sparkles, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';

export default function SwipeCard({ question, onSwipe, disabled }) {
  const [exitDirection, setExitDirection] = useState(null);
  const cardRef = useRef(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  
  const romanticOpacity = useTransform(x, [0, 100], [0, 1]);
  const platonicOpacity = useTransform(x, [-100, 0], [1, 0]);
  const bothOpacity = useTransform(y, [-100, 0], [1, 0]);

  // Reset card position when question changes
  React.useEffect(() => {
    setExitDirection(null);
    x.set(0);
    y.set(0);
  }, [question?.id]);

  const handleDragEnd = (event, info) => {
    if (disabled) return;
    
    const swipeThreshold = 80;
    
    if (info.offset.y < -swipeThreshold && Math.abs(info.offset.x) < swipeThreshold) {
      setExitDirection('up');
      onSwipe('both');
    } else if (info.offset.x > swipeThreshold) {
      setExitDirection('right');
      onSwipe('romantic');
    } else if (info.offset.x < -swipeThreshold) {
      setExitDirection('left');
      onSwipe('platonic');
    } else {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 20 });
      animate(y, 0, { type: 'spring', stiffness: 300, damping: 20 });
    }
  };

  const handleButtonSwipe = (direction) => {
    if (disabled) return;
    
    if (direction === 'romantic') {
      animate(x, 300, { duration: 0.3 });
      setExitDirection('right');
    } else if (direction === 'platonic') {
      animate(x, -300, { duration: 0.3 });
      setExitDirection('left');
    } else {
      animate(y, -300, { duration: 0.3 });
      setExitDirection('up');
    }
    
    setTimeout(() => onSwipe(direction), 250);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center px-4">
      {/* Swipe indicators */}
      <motion.div 
        className="absolute top-8 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-6 py-2 rounded-full font-bold z-10"
        style={{ opacity: bothOpacity }}
      >
        <Sparkles className="w-5 h-5 inline mr-2" />
        BOTH
      </motion.div>
      
      <motion.div 
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-teal-500 text-white px-4 py-2 rounded-full font-bold z-10"
        style={{ opacity: platonicOpacity }}
      >
        <Users className="w-5 h-5 inline mr-2" />
        PLATONIC
      </motion.div>
      
      <motion.div 
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-rose-500 text-white px-4 py-2 rounded-full font-bold z-10"
        style={{ opacity: romanticOpacity }}
      >
        ROMANTIC
        <Heart className="w-5 h-5 inline ml-2" />
      </motion.div>

      {/* Main card */}
      <motion.div
        ref={cardRef}
        className={`w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden touch-none ${disabled ? 'opacity-60' : ''}`}
        style={{ x, y, rotate }}
        drag={!disabled}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.9}
        onDragEnd={handleDragEnd}
        animate={exitDirection ? {
          x: exitDirection === 'right' ? 500 : exitDirection === 'left' ? -500 : 0,
          y: exitDirection === 'up' ? -500 : 0,
          opacity: 0
        } : {}}
        transition={{ duration: 0.3 }}
      >
        {/* Category header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2">
          <span className="text-white text-xs font-medium uppercase tracking-wider">
            {question.category.replace('_', ' ')}
          </span>
        </div>

        {/* Card content */}
        <div className="p-5">
          {/* Brain illustration */}
          <div className="flex justify-center mb-4">
            <BrainIllustration 
              highlightRegion={question.brainRegion} 
              size="small"
            />
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-center text-gray-800 mb-1">
            {question.title}
          </h2>
          <p className="text-sm text-gray-500 text-center mb-4">{question.subtitle}</p>

          {/* Info boxes */}
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl p-3 border border-rose-200">
              <p className="text-xs font-semibold text-rose-600 mb-1">Usual Role</p>
              <p className="text-sm text-gray-700 line-clamp-3">{question.usualRole}</p>
            </div>
            
            <div className="bg-violet-50 rounded-xl p-3 border border-violet-200">
              <p className="text-xs font-semibold text-violet-600 mb-1">Love Effect</p>
              <p className="text-sm text-gray-700 line-clamp-3">{question.neuroplasticEffect}</p>
            </div>
          </div>
        </div>

        {/* Swipe instruction */}
        <div className="bg-gray-100 px-4 py-3 text-center">
          <p className="text-xs text-gray-500 font-medium">
            Swipe: ← Platonic • ↑ Both • Romantic →
          </p>
        </div>
      </motion.div>

      {/* Swipe buttons */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleButtonSwipe('platonic')}
          disabled={disabled}
          className="w-14 h-14 rounded-full bg-teal-500 text-white shadow-lg flex items-center justify-center disabled:opacity-50"
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleButtonSwipe('both')}
          disabled={disabled}
          className="w-16 h-16 rounded-full bg-purple-500 text-white shadow-lg flex items-center justify-center disabled:opacity-50"
        >
          <ArrowUp className="w-7 h-7" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleButtonSwipe('romantic')}
          disabled={disabled}
          className="w-14 h-14 rounded-full bg-rose-500 text-white shadow-lg flex items-center justify-center disabled:opacity-50"
        >
          <ArrowRight className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Users className="w-4 h-4 text-teal-500" />
          <span>Platonic</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span>Both</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Heart className="w-4 h-4 text-rose-500" />
          <span>Romantic</span>
        </div>
      </div>
    </div>
  );
}
