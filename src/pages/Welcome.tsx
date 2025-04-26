
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import IndividualRegisterForm from "@/components/auth/IndividualRegisterForm";
import OrganizationRegisterForm from "@/components/auth/OrganizationRegisterForm";
import LoginForm from "@/components/auth/LoginForm";
import { Check, User, Building } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-blue-400/30 rounded-full blur-3xl -top-20 -left-20 animate-pulse" />
        <div className="absolute w-96 h-96 bg-indigo-400/30 rounded-full blur-3xl -bottom-20 -right-20 animate-pulse delay-700" />
        <div className="absolute w-72 h-72 bg-purple-400/20 rounded-full blur-3xl bottom-40 left-1/2 animate-pulse delay-500" />
      </div>

      {/* ECG Line for branding consistency */}
      <div className="absolute inset-x-0 top-0 h-16 flex items-center justify-center opacity-50">
        <svg 
          className="w-full h-12" 
          viewBox="0 0 400 100"
          preserveAspectRatio="none"
        >
          <linearGradient id="vibeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0CF25D" />
            <stop offset="25%" stopColor="#F43F5E" />
            <stop offset="50%" stopColor="#FACC15" />
            <stop offset="75%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
          <path
            d="M0,50 L60,50 L80,50 L90,20 L100,80 L110,20 L120,80 L130,50 L400,50"
            stroke="url(#vibeGradient)"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            className="ecg-line"
          />
        </svg>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-24 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-white to-blue-200">
              HyperApp
            </span>
          </h1>
          <p className="text-xl text-blue-100 max-w-md mx-auto">
            Stay safe, stay connected - for individuals and organizations
          </p>
        </div>

        <div className="flex flex-col items-center">
          {/* Auth Mode Toggle */}
          <div className="bg-white/10 backdrop-blur-md rounded-full p-1 mb-8 inline-flex">
            <button 
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                authMode === "login" 
                  ? "bg-white text-blue-900 shadow-md" 
                  : "text-white hover:bg-white/10"
              }`}
              onClick={() => setAuthMode("login")}
            >
              Sign In
            </button>
            <button 
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                authMode === "register" 
                  ? "bg-white text-blue-900 shadow-md" 
                  : "text-white hover:bg-white/10"
              }`}
              onClick={() => setAuthMode("register")}
            >
              Register
            </button>
          </div>

          {/* Card Container */}
          <div className="w-full max-w-4xl bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-fade-in">
            {authMode === "login" ? (
              <div className="p-8 md:p-12">
                <h2 className="text-3xl font-semibold text-white mb-8 text-center">Welcome Back</h2>
                <LoginForm />
              </div>
            ) : (
              <div className="p-6 md:p-8">
                <h2 className="text-3xl font-semibold text-white mb-6 text-center">Create Your Account</h2>
                
                <Tabs defaultValue="individual" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-8 bg-white/10 p-1 rounded-lg">
                    <TabsTrigger value="individual" className="data-[state=active]:bg-white data-[state=active]:text-blue-900 rounded-md">
                      <User className="w-4 h-4 mr-2" />
                      Individual
                    </TabsTrigger>
                    <TabsTrigger value="organization" className="data-[state=active]:bg-white data-[state=active]:text-blue-900 rounded-md">
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
          {authMode === "register" && (
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
              <FeatureCard 
                title="For Individuals"
                description="Stay connected with friends and find safe spaces around you."
                icon={<User className="h-8 w-8 text-blue-200" />}
              />
              <FeatureCard 
                title="For Organizations"
                description="Create events, manage analytics and become a safe space provider."
                icon={<Building className="h-8 w-8 text-blue-200" />}
              />
              <FeatureCard 
                title="Safety Focused"
                description="Emergency SOS features and real-time alerts for all users."
                icon={<Check className="h-8 w-8 text-blue-200" />}
              />
            </div>
          )}
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
    <Card className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="mb-2">{icon}</div>
        <CardTitle className="text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-blue-100">{description}</p>
      </CardContent>
    </Card>
  );
};

export default Welcome;
