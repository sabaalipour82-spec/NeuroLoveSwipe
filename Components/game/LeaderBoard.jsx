import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Star } from 'lucide-react';

export default function Leaderboard({ players, showFinal = false }) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
  const getMedalIcon = (index) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Award className="w-6 h-6 text-amber-600" />;
    return <Star className="w-5 h-5 text-gray-300" />;
  };

  const getPlacement = (index) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-400 to-amber-500';
    if (index === 1) return 'bg-gradient-to-r from-gray-300 to-gray-400';
    if (index === 2) return 'bg-gradient-to-r from-amber-500 to-orange-500';
    return 'bg-gray-100';
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {showFinal && sortedPlayers.length > 0 && (
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <div className="relative inline-block">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.5, repeat: 3 }}
            >
              <Trophy className="w-20 h-20 text-yellow-500 mx-auto" />
            </motion.div>
            <motion.div 
              className="absolute -top-2 -right-2"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              ✨
            </motion.div>
          </div>
          <h2 className="text-3xl font-bold mt-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
            {sortedPlayers[0]?.name}
          </h2>
          <p className="text-gray-600 mt-1">🧠 Neuro Love Champion!</p>
          <p className="text-4xl font-bold text-purple-600 mt-2">
            {sortedPlayers[0]?.score} points
          </p>
        </motion.div>
      )}

      <div className="space-y-3">
        {sortedPlayers.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-4 p-4 rounded-2xl ${
              index < 3 ? getPlacement(index) + ' text-white shadow-lg' : 'bg-white shadow border'
            }`}
          >
            {/* Rank */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              index < 3 ? 'bg-white/20' : 'bg-gray-100'
            }`}>
              {index < 3 ? getMedalIcon(index) : (
                <span className="font-bold text-gray-600">{index + 1}</span>
              )}
            </div>

            {/* Avatar and name */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{player.avatar_emoji || '🧠'}</span>
                <span className={`font-semibold ${index < 3 ? 'text-white' : 'text-gray-800'}`}>
                  {player.name}
                </span>
              </div>
            </div>

            {/* Score */}
            <div className={`text-right ${index < 3 ? 'text-white' : 'text-gray-800'}`}>
              <p className="text-2xl font-bold">{player.score}</p>
              <p className={`text-xs ${index < 3 ? 'text-white/80' : 'text-gray-500'}`}>points</p>
            </div>
          </motion.div>
        ))}

        {sortedPlayers.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No players yet...
          </div>
        )}
      </div>
    </div>
  );
}
