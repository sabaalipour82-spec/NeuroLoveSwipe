import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

export default function Timer({ seconds, onComplete, isHost = false }) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  
  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const progress = (timeLeft / seconds) * 100;
  const isUrgent = timeLeft <= 5;

  if (isHost) {
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32">
          {/* Background circle */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={isUrgent ? "#ef4444" : "#8b5cf6"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={283}
              strokeDashoffset={283 - (283 * progress) / 100}
              animate={{ strokeDashoffset: 283 - (283 * progress) / 100 }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          
          {/* Time display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span 
              className={`text-4xl font-bold ${isUrgent ? 'text-red-500' : 'text-purple-600'}`}
              animate={isUrgent ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: isUrgent ? Infinity : 0 }}
            >
              {timeLeft}
            </motion.span>
          </div>
        </div>
        <p className="text-gray-500 mt-2 font-medium">seconds remaining</p>
      </div>
    );
  }

  // Mobile timer (compact)
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-500' : 'text-gray-500'}`} />
          <span className={`font-medium ${isUrgent ? 'text-red-500' : 'text-gray-700'}`}>
            {timeLeft}s
          </span>
        </div>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${isUrgent ? 'bg-red-500' : 'bg-gradient-to-r from-pink-500 to-purple-500'}`}
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}
