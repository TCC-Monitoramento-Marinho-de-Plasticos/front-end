import React from 'react';
import { motion } from 'framer-motion';

const BackgroundElements: React.FC = () => {
  const bubbles = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    size: Math.random() * 30 + 10, // 10-40px
    x: Math.random() * 100, // 0-100%
    delay: Math.random() * 5, // 0-5s
    duration: Math.random() * 10 + 15, // 15-25s
  }));

  const fishElements = Array.from({ length: 4 }, (_, i) => ({
    id: i,
    x: i % 2 === 0 ? -120 : 120, // Start position
    y: 50 + (i * 30), // Vertical position
    delay: i * 2, // Staggered delay
    direction: i % 2 === 0 ? 1 : -1, // Direction (left-to-right or right-to-left)
    size: 20 + Math.random() * 10, // Size variation
  }));

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
      {/* Wave background at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-wave-pattern bg-repeat-x bg-bottom opacity-30 dark:opacity-10" />
      
      {/* Bubbles */}
      {bubbles.map(bubble => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full bg-white/20 dark:bg-white/10"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: `${bubble.x}%`,
            bottom: -bubble.size,
          }}
          animate={{
            y: [0, -window.innerHeight - bubble.size],
            x: [0, Math.random() * 100 - 50], // Random horizontal movement
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Fish silhouettes */}
      {fishElements.map(fish => (
        <motion.div
          key={fish.id}
          className="absolute opacity-10 dark:opacity-5"
          style={{
            top: `${fish.y}%`,
            left: fish.direction > 0 ? '-10%' : '110%',
          }}
          initial={{ x: 0 }}
          animate={{ 
            x: fish.direction > 0 
              ? [0, window.innerWidth + 200] 
              : [0, -window.innerWidth - 200]
          }}
          transition={{
            duration: 30,
            delay: fish.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <svg 
            width={fish.size} 
            height={fish.size * 0.6} 
            viewBox="0 0 24 24" 
            fill="currentColor"
            className="text-ocean-800 dark:text-ocean-400"
            style={{
              transform: fish.direction < 0 ? 'scaleX(-1)' : 'none'
            }}
          >
            <path d="M22 10.5c0-2.6-1.2-5.2-3.4-6.8-3.4-2.5-8-2.6-11.5-0.4C4.4 5.7 2 8.6 2 11.7v0.2c0 3.1 2.4 6 5.1 8.4 3.5 2.2 8.1 2.1 11.5-0.4C20.8 15.7 22 13.1 22 10.5zM18 11c-0.6 0-1-0.4-1-1s0.4-1 1-1 1 0.4 1 1S18.6 11 18 11z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

export default BackgroundElements;