
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate("/");
  };

  const handleRegister = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -top-20 -left-20 animate-pulse" />
        <div className="absolute w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl -bottom-20 -right-20 animate-pulse delay-700" />
      </div>

      {/* Glass card */}
      <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20 animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent mb-4">
            HypperApp
          </h1>
          <p className="text-lg text-blue-100 font-light">
            Stay Safe...Stay Connected
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={handleSignIn}
            className="w-full bg-white/90 hover:bg-white text-blue-900 p-6 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Sign In
          </Button>
          
          <Button 
            onClick={handleRegister}
            variant="outline"
            className="w-full border-2 border-white/50 text-white hover:bg-white/20 p-6 rounded-xl text-lg font-semibold transition-all duration-300"
          >
            Register
          </Button>
        </div>
        
        <p className="text-xs text-center mt-8 text-blue-100/80">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Welcome;
