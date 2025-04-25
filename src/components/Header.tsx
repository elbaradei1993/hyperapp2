
import React from 'react';

const Header = () => {
  return (
    <header className="relative h-12 flex items-center justify-center overflow-hidden border-b border-white/10">
      {/* Animated ECG Line */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <svg 
          className="w-full h-8" 
          viewBox="0 0 400 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,50 L100,50 L120,50 L140,10 L160,90 L180,50 L200,50 L300,50"
            className="stroke-primary"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            style={{
              strokeDasharray: 1000,
              strokeDashoffset: 1000,
              animation: 'dash 4s linear infinite'
            }}
          />
        </svg>
      </div>
      
      {/* App Name and Slogan */}
      <div className="relative z-10 text-center">
        <h1 className="text-lg font-light tracking-wider text-primary">
          HyperApp
        </h1>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          stay safe...stay connected
        </p>
      </div>
    </header>
  );
};

export default Header;
