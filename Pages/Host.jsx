import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Settings, RefreshCw, Users, ChevronRight, 
  Volume2, VolumeX, Home, RotateCcw, Brain
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import QRDisplay from '../components/game/QRDisplay';
import QuestionCard from '../components/game/QuestionCard';
import PlayerLobby from '../components/game/PlayerLobby';
import Leaderboard from '../components/game/Leaderboard';
import Timer from '../components/game/Timer';
import { QUESTIONS, getRandomQuestions, getQuestionById } from '../components/game/QuestionBank';
import { createPageUrl } from '@/utils';

const generateSessionCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export default function Host() {
  const queryClient = useQueryClient();
  const [session, setSession] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    totalQuestions: 15,
    difficulty: 'mixed',
    timerSeconds: 30,
    soundEnabled: true
  });
  const [currentPhase, setCurrentPhase] = useState('lobby'); // lobby, question, revealing, reveal, final
  const [timerKey, setTimerKey] = useState(0);
  const [voteSummary, setVoteSummary] = useState(null);

  // Fetch players for current session
  const { data: players = [], refetch: refetchPlayers } = useQuery({
    queryKey: ['players', session?.id],
    queryFn: () => base44.entities.Player.filter({ session_id: session?.id, is_active: true }),
    enabled: !!session?.id,
    refetchInterval: currentPhase === 'lobby' ? 2000 : 1000,
  });

  // Track if we're processing timer completion to prevent double calls
  const [isProcessingReveal, setIsProcessingReveal] = useState(false);
  // Track current question index to prevent stale data triggering reveals
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(-1);

  // Check if all players answered - end timer early
  useEffect(() => {
    if (currentPhase === 'question' && players.length > 0 && !isProcessingReveal && session) {
      // Only check answers if we're on the correct question index
      if (activeQuestionIndex !== session.current_question_index) return;
      
      const answeredCount = players.filter(p => p.current_answer && p.current_answer !== '').length;
      if (answeredCount === players.length) {
        triggerReveal();
      }
    }
  }, [players, currentPhase, isProcessingReveal, activeQuestionIndex, session?.current_question_index]);

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  // Create session
  const createSession = async () => {
    setIsCreating(true);
    setError('');
    
    const code = generateSessionCode();
    const questionIds = getRandomQuestions(settings.totalQuestions, settings.difficulty).map(q => q.id);
    
    const newSession = await base44.entities.GameSession.create({
      session_code: code,
      status: 'lobby',
      current_question_index: 0,
      total_questions: settings.totalQuestions,
      difficulty: settings.difficulty,
      question_ids: questionIds,
      timer_seconds: settings.timerSeconds,
      sound_enabled: settings.soundEnabled,
      votes: {}
    });
    
    setSession(newSession);
    setCurrentPhase('lobby');
    setIsCreating(false);
  };

  const [isStarting, setIsStarting] = useState(false);

  // Start game
  const startGame = async () => {
    if (!session || players.length === 0 || isStarting) return;
    
    setIsStarting(true);
    setIsProcessingReveal(false);
    
    // Clear any previous answers from players
    for (const player of players) {
      await base44.entities.Player.update(player.id, { current_answer: '' });
    }
    
    // Wait for player data to sync
    await refetchPlayers();
    
    await base44.entities.GameSession.update(session.id, {
      status: 'playing',
      current_question_index: 0,
      current_question_start: new Date().toISOString(),
      votes: {}
    });
    
    setSession(prev => ({ ...prev, status: 'playing', current_question_index: 0, votes: {} }));
    setActiveQuestionIndex(0);
    setCurrentPhase('question');
    setTimerKey(prev => prev + 1);
    setIsStarting(false);
  };

  // Move to next question or finish
  const nextQuestion = async () => {
    const nextIndex = session.current_question_index + 1;
    
    if (nextIndex >= session.question_ids.length) {
      // Game finished
      await base44.entities.GameSession.update(session.id, { status: 'finished' });
      setCurrentPhase('final');
    } else {
      setIsProcessingReveal(false);
      
      // Clear previous answers FIRST
      for (const player of players) {
        try {
          await base44.entities.Player.update(player.id, { current_answer: '' });
        } catch (e) {
          console.warn('Player no longer exists:', player.id);
        }
      }
      
      // Wait for player data to sync before showing question
      await refetchPlayers();
      
      // Update session with new question index AND set status to playing
      await base44.entities.GameSession.update(session.id, {
        status: 'playing',
        current_question_index: nextIndex,
        current_question_start: new Date().toISOString(),
        votes: {}
      });
      
      setSession(prev => ({ ...prev, status: 'playing', current_question_index: nextIndex, votes: {} }));
      setActiveQuestionIndex(nextIndex);
      setCurrentPhase('question');
      setTimerKey(prev => prev + 1);
      setVoteSummary(null);
    }
  };

  // Trigger reveal (called by timer or when all players answered)
  const triggerReveal = async () => {
    if (currentPhase !== 'question' || isProcessingReveal) return;
    setIsProcessingReveal(true);
    setCurrentPhase('revealing');
    
    // Fetch fresh player data
    const freshPlayers = await base44.entities.Player.filter({ session_id: session.id, is_active: true });
    
    const question = getQuestionById(session.question_ids[session.current_question_index]);
    const answers = freshPlayers.reduce((acc, p) => {
      if (p.current_answer) {
        acc[p.current_answer] = (acc[p.current_answer] || 0) + 1;
      }
      return acc;
    }, {});
    
    const total = Object.values(answers).reduce((a, b) => a + b, 0) || 1;
    const correctCount = freshPlayers.filter(p => p.current_answer === question.correct).length;
    
    // Update scores - wrap in try/catch to handle deleted players
    for (const p of freshPlayers) {
      try {
        if (p.current_answer === question.correct) {
          await base44.entities.Player.update(p.id, {
            score: (p.score || 0) + 1,
            answers_history: [...(p.answers_history || []), {
              question_index: session.current_question_index,
              answer: p.current_answer,
              correct: true
            }]
          });
        } else if (p.current_answer) {
          await base44.entities.Player.update(p.id, {
            answers_history: [...(p.answers_history || []), {
              question_index: session.current_question_index,
              answer: p.current_answer,
              correct: false
            }]
          });
        }
      } catch (e) {
        console.warn('Player no longer exists:', p.id);
      }
    }
    
    setVoteSummary({
      romantic: Math.round((answers.romantic || 0) / total * 100),
      platonic: Math.round((answers.platonic || 0) / total * 100),
      both: Math.round((answers.both || 0) / total * 100),
      correctCount
    });
    
    await base44.entities.GameSession.update(session.id, { status: 'revealing' });
    setCurrentPhase('reveal');
    setIsProcessingReveal(false);
    await refetchPlayers();
  };

  // Handle timer complete
  const handleTimerComplete = () => {
    triggerReveal();
  };

  // Reset game
  const resetGame = async () => {
    if (session) {
      // Delete all players
      for (const player of players) {
        await base44.entities.Player.delete(player.id);
      }
      await base44.entities.GameSession.delete(session.id);
    }
    setSession(null);
    setCurrentPhase('lobby');
    setVoteSummary(null);
  };

  // Play again with same players - keep cumulative scores
  const playAgain = async () => {
    const questionIds = getRandomQuestions(settings.totalQuestions, settings.difficulty).map(q => q.id);
    
    // Add current score to total, reset round score
    for (const player of players) {
      await base44.entities.Player.update(player.id, {
        total_score: (player.total_score || 0) + (player.score || 0),
        rounds_played: (player.rounds_played || 0) + 1,
        score: 0,
        current_answer: '',
        answers_history: []
      });
    }
    
    await base44.entities.GameSession.update(session.id, {
      status: 'lobby',
      current_question_index: 0,
      question_ids: questionIds,
      votes: {}
    });
    
    setSession(prev => ({ ...prev, status: 'lobby', current_question_index: 0, question_ids: questionIds, votes: {} }));
    setCurrentPhase('lobby');
    setVoteSummary(null);
    setIsProcessingReveal(false);
    await refetchPlayers();
  };

  const currentQuestion = session?.question_ids 
    ? getQuestionById(session.question_ids[session.current_question_index])
    : null;

  const joinUrl = session 
    ? `${window.location.origin}${createPageUrl('Play')}?code=${session.session_code}`
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Brain className="w-8 h-8 text-purple-600" />
            </motion.div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
              NeuroLove Swipe
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {session && (
              <div className="flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-purple-700">{players.length}</span>
              </div>
            )}
            
            {session && currentPhase !== 'question' && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
            
            {session && (
              <Button variant="outline" onClick={resetGame}>
                <Home className="w-4 h-4 mr-2" />
                New Game
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* No session - Create new game */}
        {!session && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block mb-8"
            >
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-xl">
                <Brain className="w-16 h-16 text-white" />
              </div>
            </motion.div>
            
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">NeuroLove Swipe</span>
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto">
              An interactive game exploring the neuroscience of romantic vs platonic love. 
              Players swipe to classify brain regions, neurotransmitters, and behaviors!
            </p>

            {/* Settings panel */}
            <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto mb-8">
              <h3 className="font-semibold text-gray-700 mb-4">Game Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Questions</Label>
                  <Select 
                    value={String(settings.totalQuestions)} 
                    onValueChange={(v) => setSettings(s => ({ ...s, totalQuestions: parseInt(v) }))}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Difficulty</Label>
                  <Select 
                    value={settings.difficulty} 
                    onValueChange={(v) => setSettings(s => ({ ...s, difficulty: v }))}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Timer (seconds)</Label>
                  <Select 
                    value={String(settings.timerSeconds)} 
                    onValueChange={(v) => setSettings(s => ({ ...s, timerSeconds: parseInt(v) }))}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10s</SelectItem>
                      <SelectItem value="15">15s</SelectItem>
                      <SelectItem value="20">20s</SelectItem>
                      <SelectItem value="30">30s</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Sound Effects</Label>
                  <Switch 
                    checked={settings.soundEnabled}
                    onCheckedChange={(v) => setSettings(s => ({ ...s, soundEnabled: v }))}
                  />
                </div>
              </div>
            </div>

            <Button 
              size="lg" 
              onClick={createSession}
              disabled={isCreating}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-lg px-8"
            >
              {isCreating ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Create Game Session
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* Lobby phase */}
        {session && currentPhase === 'lobby' && (
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col items-center">
              <QRDisplay sessionCode={session.session_code} joinUrl={joinUrl} />
              
              <Button 
                size="lg" 
                onClick={startGame}
                disabled={players.length === 0 || isStarting}
                className="mt-8 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-lg px-8"
              >
                {isStarting ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start Game ({players.length} players)
                  </>
                )}
              </Button>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Players Ready</h3>
              <PlayerLobby players={players} isHost />
            </div>
          </div>
        )}

        {/* Question phase */}
        {session && currentPhase === 'question' && currentQuestion && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-medium">
                  Question {session.current_question_index + 1} of {session.question_ids.length}
                </span>
              </div>
              <Timer 
                key={timerKey}
                seconds={settings.timerSeconds} 
                onComplete={handleTimerComplete}
                isHost
              />
            </div>
            
            <QuestionCard question={currentQuestion} showAnswer={false} />
            
            <div className="text-center">
              <p className="text-gray-500">
                Waiting for players to swipe... ({players.filter(p => p.current_answer).length}/{players.length} answered)
              </p>
            </div>
          </div>
        )}

        {/* Reveal phase */}
        {session && currentPhase === 'reveal' && currentQuestion && (
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-medium">
                ✓ Answer Revealed!
              </span>
            </div>
            
            <QuestionCard 
              question={currentQuestion} 
              showAnswer={true}
              voteSummary={voteSummary}
            />
            
            <div className="text-center">
              <Button 
                size="lg"
                onClick={nextQuestion}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                {session.current_question_index + 1 >= session.question_ids.length 
                  ? 'See Final Results' 
                  : 'Next Question'}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Final leaderboard */}
        {session && currentPhase === 'final' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <motion.h2 
              className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              🎉 Round Complete! 🎉
            </motion.h2>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* This Round */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-700 mb-4">This Round</h3>
                <Leaderboard players={players} showFinal />
              </div>
              
              {/* All-Time Leaderboard */}
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl shadow-lg p-6 border-2 border-purple-200">
                <h3 className="text-lg font-bold text-purple-700 mb-4">🏆 All-Time Leaderboard</h3>
                <div className="space-y-2">
                  {[...players]
                    .sort((a, b) => ((b.total_score || 0) + (b.score || 0)) - ((a.total_score || 0) + (a.score || 0)))
                    .map((p, idx) => (
                      <div 
                        key={p.id} 
                        className={`flex items-center justify-between p-3 rounded-xl ${
                          idx === 0 ? 'bg-yellow-100 border border-yellow-300' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-500">#{idx + 1}</span>
                          <span className="text-xl">{p.avatar_emoji}</span>
                          <span className="font-medium">{p.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold text-purple-600">
                            {(p.total_score || 0) + (p.score || 0)}
                          </span>
                          <p className="text-xs text-gray-500">
                            {(p.rounds_played || 0) + 1} rounds
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-center gap-4 mt-8">
              <Button 
                variant="outline" 
                size="lg"
                onClick={resetGame}
              >
                <Home className="w-5 h-5 mr-2" />
                End Session
              </Button>
              <Button 
                size="lg"
                onClick={playAgain}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Play Another Round
              </Button>
            </div>
          </motion.div>
        )}
      </main>

      {/* Floating hearts decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-pink-200 text-2xl"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 30}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              rotate: [-10, 10, -10],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5
            }}
          >
            💕
          </motion.div>
        ))}
      </div>
    </div>
  );
}
