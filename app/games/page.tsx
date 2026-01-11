// app/games/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function GamesPage() {
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);

  useEffect(() => {
    // Generate stars
    const generatedStars = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
    }));
    setStars(generatedStars);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black overflow-hidden relative">
      {/* Animated Stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{
            left: `${star.x}vw`,
            top: `${star.y}vh`,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
          }}
          transition={{
            duration: Math.random() * 2 + 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="max-w-2xl w-full text-center"
        >
          <motion.h1
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold mb-6 text-accent"
          >
            🎮 Learning Games
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-300 mb-10"
          >
            Fun coding challenges are on the way...
          </motion.p>
          
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-t-accent border-r-transparent border-b-accent border-l-transparent rounded-full mx-auto mb-10"
          />
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-gray-400 text-lg mb-12"
          >
            <em>Coming Soon</em>
          </motion.p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <motion.a
              href="/layout-demo"
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-6 py-3 border border-accent text-accent rounded-lg hover:bg-accent/10 transition-all duration-300"
            >
              🔲 Layout Practice
            </motion.a>
            
            <motion.a
              href="/quiz"
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-6 py-3 border border-accent text-accent rounded-lg hover:bg-accent/10 transition-all duration-300"
            >
              📝 Coding Quiz
            </motion.a>
            
            <motion.a
              href="/about"
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-6 py-3 border border-accent text-accent rounded-lg hover:bg-accent/10 transition-all duration-300"
            >
              👥 About Us
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}