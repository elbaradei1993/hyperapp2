
import React from 'react';

const Header = () => {
  return (
    <header className="relative h-12 flex items-center justify-center overflow-hidden border-b border-white/10">
      {/* Animated ECG Line */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <svg 
          className="w-full h-8" 
          viewBox="0 0 400 100"
          preserveAspectRatio="none"
        >
          <linearGradient id="vibeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1EAEDB" />
            <stop offset="25%" stopColor="#ea384c" />
            <stop offset="50%" stopColor="#FEF7CD" />
            <stop offset="75%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#1EAEDB" />
          </linearGradient>
          <path
            d="M0,50 L60,50 L80,50 L90,20 L100,80 L110,20 L120,80 L130,50 L400,50"
            stroke="url(#vibeGradient)"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            className="ecg-line"
          />
        </svg>
      </div>
      
      {/* App Name and Slogan */}
      <div className="relative z-10 text-center">
        <h1 className="text-lg font-light tracking-wider text-primary">
          HyperApp
        </h1>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Stay safe...Stay connected
        </p>
      </div>
    </header>
  );
};

export default Header;
