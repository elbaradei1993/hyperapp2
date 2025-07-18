import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 500);
    const timer2 = setTimeout(() => setStage(2), 1500);
    const timer3 = setTimeout(() => onComplete(), 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center z-50">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: stage >= 1 ? 1 : 0, 
            opacity: stage >= 1 ? 1 : 0 
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl">
            <motion.span 
              className="text-4xl font-bold text-primary"
              animate={{ rotate: stage >= 2 ? 360 : 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            >
              H
            </motion.span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          animate={{ 
            y: stage >= 1 ? 0 : 50, 
            opacity: stage >= 1 ? 1 : 0 
          }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-5xl font-bold text-white mb-4"
        >
          HyperAPP
        </motion.h1>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ 
            y: stage >= 2 ? 0 : 30, 
            opacity: stage >= 2 ? 1 : 0 
          }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-xl text-white/90 font-medium"
        >
          Connecting Communities
        </motion.p>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: stage >= 2 ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="mt-8"
        >
          <div className="flex space-x-1 justify-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-white rounded-full"
                animate={{ 
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};