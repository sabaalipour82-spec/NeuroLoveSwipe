import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Monitor, Smartphone, Heart, Users, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createPageUrl } from '@/utils';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-teal-50 overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Floating decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) =>
          <motion.div
            key={i}
            className="absolute text-4xl"
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + i % 4 * 20}%`
            }}
            animate={{
              y: [-20, 20, -20],
              rotate: [-15, 15, -15],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.3
            }}>

              {['💕', '🧠', '💜', '✨', '💗', '🌸', '💫', '🦋'][i]}
            </motion.div>
          )}
        </div>

        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative">
          <div className="text-center">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-8">

              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="relative">

                <div className="w-28 h-28 bg-gradient-to-br from-pink-400 via-purple-500 to-teal-400 rounded-3xl flex items-center justify-center shadow-2xl">
                  <Brain className="w-14 h-14 text-white" />
                </div>
                <motion.div
                  className="absolute -top-2 -right-2 text-2xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}>

                  💕
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-4">

              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-teal-500">
                NeuroLove
              </span>
              <br />
              <span className="text-gray-800">Swipe</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-8">

              An interactive Tinder-style neuroscience game exploring the 
              <span className="text-rose-500 font-medium"> romantic</span> vs 
              <span className="text-teal-500 font-medium"> platonic</span> brain
            </motion.p>

            {/* Tags */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-3 mb-10">

              {['Neuroanatomy', 'Neuroplasticity', 'Neurotransmitters', 'Love Science'].map((tag) =>
              <span
                key={tag}
                className="bg-white/80 backdrop-blur px-4 py-2 rounded-full text-sm font-medium text-gray-700 shadow-sm">

                  {tag}
                </span>
              )}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center">

              <Link to={createPageUrl('Host')}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-lg h-14 px-8 shadow-lg">

                  <Monitor className="w-5 h-5 mr-2" />
                  Host Game (Projector)
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl('Play')}>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg h-14 px-8 border-2">

                  <Smartphone className="w-5 h-5 mr-2" />
                  Join as Player
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white/60 backdrop-blur-sm py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
            {
              icon: Monitor,
              title: "1. Host Projects",
              description: "Host displays QR code on projector. Game shows neuroscience cards with brain regions and facts.",
              color: "from-pink-500 to-rose-500"
            },
            {
              icon: Smartphone,
              title: "2. Players Join",
              description: "Players scan QR code with phones, enter their name, and join the game lobby instantly.",
              color: "from-purple-500 to-violet-500"
            },
            {
              icon: Zap,
              title: "3. Swipe & Learn",
              description: "Swipe left for platonic, right for romantic, or up for both. Learn neuroscience while competing!",
              color: "from-teal-500 to-cyan-500"
            }].
            map((step, i) =>
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-lg">

                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}>
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Swipe mechanics */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Swipe to Classify
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl p-6 text-center border-2 border-teal-200">

              <Users className="w-12 h-12 text-teal-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-teal-700 mb-2">← Swipe Left</h3>
              <p className="text-teal-600">Platonic / Maternal Love</p>
              <p className="text-sm text-gray-500 mt-2">Caregiving, friendship, family bonds</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl p-6 text-center border-2 border-purple-200">

              <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-purple-700 mb-2">↑ Swipe Up</h3>
              <p className="text-purple-600">Both Types</p>
              <p className="text-sm text-gray-500 mt-2">Shared neural mechanisms</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl p-6 text-center border-2 border-rose-200">

              <Heart className="w-12 h-12 text-rose-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-rose-700 mb-2">Swipe Right →</h3>
              <p className="text-rose-600">Romantic Love</p>
              <p className="text-sm text-gray-500 mt-2">Passion, attraction, infatuation</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Topics covered */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-white mb-4">
            What You'll Learn
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            50+ scientifically-accurate questions covering the neuroscience of love
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
            { title: "Brain Regions", examples: "Amygdala, VTA, Hippocampus, mPFC" },
            { title: "Neurotransmitters", examples: "Dopamine, Serotonin, Norepinephrine" },
            { title: "Hormones", examples: "Oxytocin, Vasopressin, Cortisol" },
            { title: "Neuroplasticity", examples: "LTP, Circuit Strengthening, Pruning" }].
            map((topic, i) =>
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/10 backdrop-blur rounded-xl p-5">

                <h3 className="text-white font-bold mb-2">{topic.title}</h3>
                <p className="text-gray-400 text-sm">{topic.examples}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="w-6 h-6 text-purple-600" />
            <span className="font-bold text-gray-800">NeuroLove Swipe</span>
          </div>
          <p className="text-gray-500 text-sm">NSCI 311 Group 16 - Neuroplasticity and Love

          </p>
          <p className="text-gray-400 text-xs mt-2">Saba Alipour, Lai Avalos Mar, Maiara Burgess, Madilyn Hofstede, Morgan Miller, Ayla Nohesara, Kellie Vu

          </p>
        </div>
      </footer>
    </div>);

}
