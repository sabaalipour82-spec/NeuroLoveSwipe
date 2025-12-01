import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Heart, Users, Sparkles, Check, X, Trophy, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import SwipeCard from '../components/game/SwipeCard';
import Timer from '../components/game/Timer';
import { getQuestionById } from '../components/game/QuestionBank';
import { createPageUrl } from '@/utils';

const AVATARS = ['🧠', '💕', '💜', '🦋', '✨', '🌸', '💫', '🎀', '🌺', '💝', '🌷', '💖'];

export default function Play() {
  const [sessionCode, setSessionCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [player, setPlayer] = useState(null);
  const [session, setSession] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [lastAnswer, setLastAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [joinError, setJoinError] = useState('');

  // Get code from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      setSessionCode(code.toUpperCase());
    }
  }, []);

  // Poll for session updates
  const { data: sessionData, refetch: refetchSession } = useQuery({
    queryKey: ['session', session?.id],
    queryFn: async () => {
      if (!session?.id) return null;
      const sessions = await base44.entities.GameSession.filter({ id: session.id });
      return sessions[0];
    },
    enabled: !!session?.id,
    refetchInterval: 800,
  });

  const [lastQuestionIndex, setLastQuestionIndex] = useState(-1);
  const [lastStatus, setLastStatus] = useState('');
  const [processedRevealIndex, setProcessedRevealIndex] = useState(-1);

  // Poll for player updates to get fresh score
  const { data: playerData } = useQuery({
    queryKey: ['player', player?.id],
    queryFn: async () => {
      if (!player?.id) return null;
      const players = await base44.entities.Player.filter({ id: player.id });
      return players[0];
    },
    enabled: !!player?.id,
    refetchInterval: 1000,
  });

  // Update local player when data changes
  useEffect(() => {
    if (playerData) {
      setPlayer(playerData);
    }
  }, [playerData]);

  // Update local session when data changes
  useEffect(() => {
    if (sessionData) {
      const newIndex = sessionData.current_question_index;
      const newStatus = sessionData.status;
      
      // Reset answer state when we detect a NEW question (index changed while playing)
      // or when status changes to playing from non-playing state
      if (newStatus === 'playing') {
        if (newIndex !== lastQuestionIndex || lastStatus !== 'playing') {
          console.log('New question detected, resetting state. Index:', newIndex, 'LastIndex:', lastQuestionIndex);
          setHasAnswered(false);
          setLastAnswer(null);
          setShowResult(false);
          setLastQuestionIndex(newIndex);
        }
      }
      
      // Show result when revealing (only if we have an answer and haven't processed this reveal)
      if (newStatus === 'revealing' && processedRevealIndex !== newIndex && lastAnswer) {
        const question = getQuestionById(sessionData.question_ids[newIndex]);
        if (question) {
          setIsCorrect(lastAnswer === question.correct);
          setShowResult(true);
          setProcessedRevealIndex(newIndex);
          
          // Vibrate on result
          if (navigator.vibrate) {
            navigator.vibrate(lastAnswer === question.correct ? [100, 50, 100] : [200]);
          }
        }
      }
      
      setLastStatus(newStatus);
      setSession(sessionData);
    }
  }, [sessionData]);

  // Join game
  const joinGame = async () => {
    if (!sessionCode || !playerName) return;
    
    setJoinError('');
    
    // Find session by code
    const sessions = await base44.entities.GameSession.filter({ session_code: sessionCode.toUpperCase() });
    
    if (sessions.length === 0) {
      setJoinError('Game not found. Check the code and try again.');
      return;
    }
    
    const foundSession = sessions[0];
    
    if (foundSession.status !== 'lobby') {
      setJoinError('This game has already started.');
      return;
    }
    
    // Create player
    const newPlayer = await base44.entities.Player.create({
      session_id: foundSession.id,
      name: playerName,
      avatar_emoji: selectedAvatar,
      score: 0,
      current_answer: '',
      answers_history: [],
      is_active: true
    });
    
    setPlayer(newPlayer);
    setSession(foundSession);
  };

  // Submit answer
  const handleSwipe = async (answer) => {
    if (hasAnswered || !player) return;
    
    setHasAnswered(true);
    setLastAnswer(answer);
    
    // Vibrate feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    // Update player answer
    await base44.entities.Player.update(player.id, {
      current_answer: answer
    });
  };

  // Get current question
  const currentQuestion = session?.question_ids 
    ? getQuestionById(session.question_ids[session.current_question_index])
    : null;

  // Join screen
  if (!player || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-teal-100 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div 
            className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Logo */}
            <div className="text-center mb-8">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="inline-block"
              >
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <Brain className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              <h1 className="text-2xl font-bold mt-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                NeuroLove Swipe
              </h1>
              <p className="text-gray-500 text-sm mt-1">Join the game!</p>
            </div>

            {/* Join form */}
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Game Code</Label>
                <Input
                  placeholder="ABCD12"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  className="text-center text-2xl font-mono tracking-widest uppercase"
                  maxLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label>Your Name</Label>
                <Input
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <Label>Choose Avatar</Label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map((emoji) => (
                    <motion.button
                      key={emoji}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedAvatar(emoji)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                        selectedAvatar === emoji 
                          ? 'bg-gradient-to-br from-pink-400 to-purple-500 shadow-lg scale-110' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </div>

              {joinError && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm text-center"
                >
                  {joinError}
                </motion.p>
              )}

              <Button 
                onClick={joinGame}
                disabled={!sessionCode || !playerName}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-lg h-12"
              >
                Join Game
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Waiting in lobby
  if (session.status === 'lobby') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-teal-100 flex flex-col items-center justify-center p-4">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-6xl mb-4">{selectedAvatar}</div>
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{playerName}</h2>
          <p className="text-gray-500 mb-8">You're in! Waiting for the host to start...</p>
          
          <div className="flex items-center justify-center gap-2">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-3 h-3 bg-purple-400 rounded-full"
            />
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              className="w-3 h-3 bg-pink-400 rounded-full"
            />
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              className="w-3 h-3 bg-teal-400 rounded-full"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  // Game finished
  if (session.status === 'finished') {
    const totalScore = (player.total_score || 0) + (player.score || 0);
    const roundsPlayed = (player.rounds_played || 0) + 1;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-teal-100 flex flex-col items-center justify-center p-4">
        <motion.div 
          className="text-center w-full max-w-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: 3 }}
          >
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-gray-800 mt-6 mb-2">Round Complete!</h2>
          <p className="text-gray-500 mb-4">Great job, {playerName}!</p>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
            <p className="text-sm text-gray-500">This Round</p>
            <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
              {player.score || 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              out of {session.question_ids?.length || 0}
            </p>
          </div>
          
          {roundsPlayed > 1 && (
            <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-4 mb-4">
              <p className="text-sm text-gray-600">Total Score (All Rounds)</p>
              <p className="text-3xl font-bold text-purple-700">
                {totalScore}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {roundsPlayed} rounds played
              </p>
            </div>
          )}
          
          <p className="text-gray-400 mt-4 text-sm">Check the main screen for leaderboard!</p>
          <p className="text-purple-500 mt-2 text-sm font-medium">Waiting for next round...</p>
        </motion.div>
      </div>
    );
  }

  // Playing - show question
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-teal-100 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{selectedAvatar}</span>
            <span className="font-medium text-gray-700">{playerName}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
              {session.current_question_index + 1}/{session.question_ids?.length}
            </span>
            <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-medium">
              ⭐ {player.score || 0}
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Result overlay */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 z-50 flex items-center justify-center ${
                isCorrect ? 'bg-green-500/90' : 'bg-red-500/90'
              }`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center text-white"
              >
                {isCorrect ? (
                  <>
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Check className="w-24 h-24 mx-auto" />
                    </motion.div>
                    <p className="text-3xl font-bold mt-4">Correct!</p>
                    <p className="text-white/80 mt-2">+1 point</p>
                  </>
                ) : (
                  <>
                    <X className="w-24 h-24 mx-auto" />
                    <p className="text-3xl font-bold mt-4">Not quite!</p>
                    <p className="text-white/80 mt-2">
                      The answer was: {currentQuestion?.correct}
                    </p>
                  </>
                )}
                <p className="mt-6 text-sm text-white/70">Look at the main screen for details!</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Answered overlay */}
        <AnimatePresence>
          {hasAnswered && !showResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-white/95 flex items-center justify-center"
            >
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {lastAnswer === 'romantic' && <Heart className="w-16 h-16 text-rose-500 mx-auto" />}
                  {lastAnswer === 'platonic' && <Users className="w-16 h-16 text-teal-500 mx-auto" />}
                  {lastAnswer === 'both' && <Sparkles className="w-16 h-16 text-purple-500 mx-auto" />}
                </motion.div>
                <p className="text-xl font-bold text-gray-800 mt-4">
                  You chose: {lastAnswer}
                </p>
                <p className="text-gray-500 mt-2">Waiting for reveal...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timer */}
        {session.status === 'playing' && !hasAnswered && (
          <div className="px-4 pt-4">
            <Timer seconds={30} isHost={false} />
          </div>
        )}

        {/* Swipe card - show immediately */}
        {currentQuestion && !hasAnswered && (session.status === 'playing' || session.status === 'revealing') && (
          <div className="flex-1 flex items-center justify-center p-4">
            <SwipeCard 
              question={currentQuestion} 
              onSwipe={handleSwipe}
              disabled={hasAnswered || session.status === 'revealing'}
            />
          </div>
        )}
      </main>
    </div>
  );
}
