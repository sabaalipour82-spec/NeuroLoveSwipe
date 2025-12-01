import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Brain } from 'lucide-react';

const AVATARS = ['🧠', '💕', '💜', '🦋', '✨', '🌸', '💫', '🎀', '🌺', '💝'];

export default function PlayerLobby({ players, isHost = false }) {
  return (
    <div className={isHost ? 'w-full' : 'w-full max-w-sm mx-auto'}>
      {/* Player count */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <Users className="w-5 h-5 text-purple-500" />
        <span className="font-medium text-gray-700">
          {players.length} {players.length === 1 ? 'Player' : 'Players'} Joined
        </span>
      </div>

      {/* Player grid */}
      <div className={`grid gap-3 ${isHost ? 'grid-cols-4 md:grid-cols-6 lg:grid-cols-8' : 'grid-cols-2'}`}>
        <AnimatePresence>
          {players.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ 
                type: "spring",
                stiffness: 500,
                damping: 30,
                delay: index * 0.05 
              }}
              className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-4 text-center shadow-sm border border-pink-200"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                className="text-3xl mb-2"
              >
                {player.avatar_emoji || AVATARS[index % AVATARS.length]}
              </motion.div>
              <p className="font-medium text-gray-800 truncate text-sm">
                {player.name}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {players.length === 0 && (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Brain className="w-16 h-16 text-gray-300 mx-auto" />
          </motion.div>
          <p className="text-gray-400 mt-4">Waiting for players to join...</p>
        </motion.div>
      )}
    </div>
  );
}
