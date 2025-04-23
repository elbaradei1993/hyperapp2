
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    // This is where we would handle authentication
    // For now, we'll just navigate to the home page
    navigate("/");
  };

  const handleRegister = () => {
    // This is where we would handle registration
    // For now, we'll just navigate to the home page
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-800 flex flex-col items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-xl border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Vibe Beacon</h1>
          <p className="text-indigo-200">Connect with local vibes and stay safe</p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={handleSignIn}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg transition-all"
          >
            Sign In
          </Button>
          
          <Button 
            onClick={handleRegister}
            variant="outline"
            className="w-full border-indigo-400 text-indigo-100 hover:bg-indigo-700 p-3 rounded-lg transition-all"
          >
            Register
          </Button>
        </div>
        
        <p className="text-xs text-center mt-8 text-indigo-200">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Welcome;
