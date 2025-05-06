
import React from 'react';
import { motion } from 'framer-motion';

const Banner = () => {
  return (
    <div className="w-full overflow-hidden relative">
      <motion.div 
        className="bg-gradient-to-r from-purple-600 via-primary to-blue-600 p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-center"
          >
            <h2 className="font-bold text-white text-xl tracking-tight">
              HyperApp
            </h2>
            <motion.p 
              className="text-white/90 text-xs mt-0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              Stay safe. Stay connected.
            </motion.p>
          </motion.div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <motion.div 
            className="absolute top-1/4 left-1/5 w-64 h-64 rounded-full bg-white/10 blur-3xl"
            animate={{ 
              x: [0, 10, 0], 
              y: [0, -10, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 10,
              ease: "easeInOut" 
            }}
          />
          <motion.div 
            className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-white/5 blur-3xl"
            animate={{ 
              x: [0, -15, 0], 
              y: [0, 15, 0],
              scale: [1, 0.95, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 12,
              ease: "easeInOut" 
            }}
          />
          <motion.div 
            className="absolute top-1/2 left-2/3 w-32 h-32 rounded-full bg-white/10 blur-xl"
            animate={{ 
              x: [0, 8, 0], 
              y: [0, 8, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 8,
              ease: "easeInOut" 
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Banner;
