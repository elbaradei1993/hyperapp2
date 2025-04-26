
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import IndividualRegisterForm from "@/components/auth/IndividualRegisterForm";
import OrganizationRegisterForm from "@/components/auth/OrganizationRegisterForm";
import LoginForm from "@/components/auth/LoginForm";
import { Check, User, Building, Globe } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // Auto-hide intro after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#8B5CF6]">
        <div className="text-center space-y-4 animate-pulse">
          <h1 className="text-7xl font-bold text-white tracking-tight">
            HyperApp
          </h1>
          <p className="text-2xl text-white/90 font-light">
            Stay safe...Stay connected
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden relative bg-white">
      {/* World Map Background with Pulse Markers */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full">
          <img 
            src="/lovable-uploads/43c08f98-56d1-4ee1-8782-9ed0524d8ce8.png" 
            alt="World Map" 
            className="w-full h-full object-cover opacity-50"
          />
        </div>
        {/* Animated Pulse Markers */}
        <div className="absolute top-1/4 left-1/4 animate-pulse">
          <div className="w-4 h-4 bg-[#8B5CF6] rounded-full opacity-75" />
        </div>
        <div className="absolute top-1/3 right-1/3 animate-pulse delay-300">
          <div className="w-4 h-4 bg-[#8B5CF6] rounded-full opacity-75" />
        </div>
        <div className="absolute bottom-1/3 right-1/4 animate-pulse delay-700">
          <div className="w-4 h-4 bg-[#8B5CF6] rounded-full opacity-75" />
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* ECG Line */}
        <div className="absolute inset-x-0 top-0 h-16 flex items-center justify-center opacity-75">
          <svg 
            className="w-full h-12" 
            viewBox="0 0 400 100"
            preserveAspectRatio="none"
          >
            <path
              d="M0,50 L60,50 L80,50 L90,20 L100,80 L110,20 L120,80 L130,50 L400,50"
              stroke="#8B5CF6"
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              className="ecg-line"
            />
          </svg>
        </div>

        <div className="text-center mb-12 pt-16">
          <h1 className="text-6xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] to-[#9333EA]">
              Stay Safe...Stay Connected
            </span>
          </h1>
        </div>

        <div className="flex flex-col items-center">
          {/* Auth Mode Toggle */}
          <div className="bg-purple-50 rounded-full p-1 mb-8 inline-flex shadow-lg">
            <button 
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                authMode === "login" 
                  ? "bg-[#8B5CF6] text-white shadow-md" 
                  : "text-[#8B5CF6] hover:bg-purple-100"
              }`}
              onClick={() => setAuthMode("login")}
            >
              Sign In
            </button>
            <button 
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                authMode === "register" 
                  ? "bg-[#8B5CF6] text-white shadow-md" 
                  : "text-[#8B5CF6] hover:bg-purple-100"
              }`}
              onClick={() => setAuthMode("register")}
            >
              Register
            </button>
          </div>

          {/* Card Container */}
          <div className="w-full max-w-4xl bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-purple-100 overflow-hidden">
            {authMode === "login" ? (
              <div className="p-8 md:p-12">
                <h2 className="text-3xl font-semibold text-[#8B5CF6] mb-8 text-center">Welcome Back</h2>
                <LoginForm />
              </div>
            ) : (
              <div className="p-6 md:p-8">
                <h2 className="text-3xl font-semibold text-[#8B5CF6] mb-6 text-center">Create Your Account</h2>
                
                <Tabs defaultValue="individual" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-8 bg-purple-50 p-1 rounded-lg">
                    <TabsTrigger value="individual" className="data-[state=active]:bg-white data-[state=active]:text-[#8B5CF6] rounded-md">
                      <User className="w-4 h-4 mr-2" />
                      Individual
                    </TabsTrigger>
                    <TabsTrigger value="organization" className="data-[state=active]:bg-white data-[state=active]:text-[#8B5CF6] rounded-md">
                      <Building className="w-4 h-4 mr-2" />
                      Organization
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="individual" className="mt-0">
                    <IndividualRegisterForm />
                  </TabsContent>
                  
                  <TabsContent value="organization" className="mt-0">
                    <OrganizationRegisterForm />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
          
          {/* Feature Cards */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
            <FeatureCard 
              title="For Individuals"
              description="Find safe spaces and connect with a supportive community."
              icon={<User className="h-8 w-8 text-[#8B5CF6]" />}
            />
            <FeatureCard 
              title="For Organizations"
              description="Create safe spaces and manage your venue or events."
              icon={<Building className="h-8 w-8 text-[#8B5CF6]" />}
            />
            <FeatureCard 
              title="Safety Focused"
              description="Emergency features and real-time support when needed."
              icon={<Check className="h-8 w-8 text-[#8B5CF6]" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for feature cards
const FeatureCard = ({ 
  title, 
  description, 
  icon 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode 
}) => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-purple-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
      <CardHeader className="pb-2">
        <div className="mb-2">{icon}</div>
        <CardTitle className="text-[#8B5CF6]">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-purple-600">{description}</p>
      </CardContent>
    </Card>
  );
};

export default Welcome;
