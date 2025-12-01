import React from 'react';
import { motion } from 'framer-motion';
import BrainIllustration from './BrainIllustration';
import { Heart, Users, Sparkles } from 'lucide-react';

export default function QuestionCard({ question, showAnswer = false, voteSummary = null }) {
  const categoryColors = {
    brain_region: 'from-pink-500 to-rose-500',
    neurotransmitter: 'from-purple-500 to-violet-500',
    hormone: 'from-teal-500 to-cyan-500',
    neuroplasticity: 'from-amber-500 to-orange-500',
    behavior: 'from-emerald-500 to-green-500',
    trick: 'from-indigo-500 to-blue-500',
    research: 'from-fuchsia-500 to-pink-500'
  };

  const answerConfig = {
    romantic: { icon: Heart, color: 'text-rose-500', bg: 'bg-rose-100', label: 'Romantic Love' },
    platonic: { icon: Users, color: 'text-teal-500', bg: 'bg-teal-100', label: 'Platonic/Maternal Love' },
    both: { icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-100', label: 'Both Types!' }
  };

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
    >
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header gradient */}
        <div className={`bg-gradient-to-r ${categoryColors[question.category] || categoryColors.brain_region} p-1`}>
          <div className="bg-white/90 backdrop-blur px-6 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 uppercase tracking-wider">
              {question.category.replace('_', ' ')}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
              question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {question.difficulty}
            </span>
          </div>
        </div>

        {/* Main content */}
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left side - Brain illustration */}
            <div className="flex flex-col items-center justify-center">
              <BrainIllustration 
                highlightRegion={question.brainRegion} 
                size="large"
              />
              <motion.h2 
                className="mt-6 text-3xl font-bold text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                  {question.title}
                </span>
              </motion.h2>
              <p className="text-gray-500 text-lg mt-1">{question.subtitle}</p>
            </div>

            {/* Right side - Info boxes */}
            <div className="space-y-4">
              {/* Usual Role Box */}
              <motion.div 
                className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-5 border-2 border-rose-200"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <h3 className="font-semibold text-rose-700">Usual Role</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{question.usualRole}</p>
              </motion.div>

              {/* Neuroplastic Effect Box */}
              <motion.div 
                className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-5 border-2 border-violet-200"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-violet-500" />
                  <h3 className="font-semibold text-violet-700">Neuroplastic Effect During Love</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{question.neuroplasticEffect}</p>
              </motion.div>

              {/* Question prompt or Answer reveal */}
              {!showAnswer ? (
                <motion.div 
                  className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-5 text-white text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-lg font-medium">
                    Is this more associated with...
                  </p>
                  <div className="flex items-center justify-center gap-6 mt-3">
                    <span className="text-rose-400">❤️ Romantic</span>
                    <span className="text-teal-400">👥 Platonic</span>
                    <span className="text-purple-400">✨ Both</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-2xl p-5 ${answerConfig[question.correct].bg} border-2`}
                  style={{ borderColor: answerConfig[question.correct].color.replace('text-', '') }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {React.createElement(answerConfig[question.correct].icon, {
                      className: `w-8 h-8 ${answerConfig[question.correct].color}`
                    })}
                    <span className={`text-xl font-bold ${answerConfig[question.correct].color}`}>
                      {answerConfig[question.correct].label}
                    </span>
                  </div>
                  <p className="text-gray-700">{question.explanation}</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Vote summary */}
          {showAnswer && voteSummary && (
            <motion.div 
              className="mt-8 pt-6 border-t border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h4 className="text-center text-gray-600 mb-4">How Everyone Voted</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-rose-50 rounded-xl p-4 text-center">
                  <Heart className="w-6 h-6 text-rose-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-rose-600">{voteSummary.romantic}%</p>
                  <p className="text-sm text-gray-500">Romantic</p>
                </div>
                <div className="bg-teal-50 rounded-xl p-4 text-center">
                  <Users className="w-6 h-6 text-teal-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-teal-600">{voteSummary.platonic}%</p>
                  <p className="text-sm text-gray-500">Platonic</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <Sparkles className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-purple-600">{voteSummary.both}%</p>
                  <p className="text-sm text-gray-500">Both</p>
                </div>
              </div>
              <p className="text-center mt-4 text-lg font-medium text-gray-700">
                ✓ {voteSummary.correctCount} players got it right!
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
