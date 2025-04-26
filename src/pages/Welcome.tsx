
"use client";

import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import IndividualRegisterForm from "@/components/auth/IndividualRegisterForm";
import OrganizationRegisterForm from "@/components/auth/OrganizationRegisterForm";
import LoginForm from "@/components/auth/LoginForm";
import { User, Building, Check } from "lucide-react";

const Welcome = () => {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  return (
    <div className="min-h-screen overflow-hidden relative bg-background">
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
          <div className="w-4 h-4 bg-primary rounded-full opacity-75" />
        </div>
        <div className="absolute top-1/3 right-1/3 animate-pulse delay-300">
          <div className="w-4 h-4 bg-primary rounded-full opacity-75" />
        </div>
        <div className="absolute bottom-1/3 right-1/4 animate-pulse delay-700">
          <div className="w-4 h-4 bg-primary rounded-full opacity-75" />
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Header with App Name and Slogan */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl font-light tracking-wider text-primary mb-2">
            HyperApp
          </h1>
          <p className="text-sm text-muted-foreground">
            Stay safe...Stay connected
          </p>
        </div>

        <div className="flex flex-col items-center">
          {/* Auth Mode Toggle */}
          <div className="bg-muted rounded-full p-1 mb-8 inline-flex shadow-lg">
            <button 
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                authMode === "login" 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:bg-accent"
              }`}
              onClick={() => setAuthMode("login")}
            >
              Sign In
            </button>
            <button 
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                authMode === "register" 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:bg-accent"
              }`}
              onClick={() => setAuthMode("register")}
            >
              Register
            </button>
          </div>

          {/* Card Container */}
          <div className="w-full max-w-4xl bg-card/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-border overflow-hidden">
            {authMode === "login" ? (
              <div className="p-8 md:p-12">
                <h2 className="text-2xl font-light text-primary mb-8 text-center">Welcome Back</h2>
                <LoginForm />
              </div>
            ) : (
              <div className="p-6 md:p-8">
                <h2 className="text-2xl font-light text-primary mb-6 text-center">Create Your Account</h2>
                
                <Tabs defaultValue="individual" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-8">
                    <TabsTrigger value="individual" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <User className="w-4 h-4 mr-2" />
                      Individual
                    </TabsTrigger>
                    <TabsTrigger value="organization" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
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
              icon={<User className="h-6 w-6 text-primary" />}
            />
            <FeatureCard 
              title="For Organizations"
              description="Create safe spaces and manage your venue or events."
              icon={<Building className="h-6 w-6 text-primary" />}
            />
            <FeatureCard 
              title="Safety Focused"
              description="Emergency features and real-time support when needed."
              icon={<Check className="h-6 w-6 text-primary" />}
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
    <Card className="bg-card/80 backdrop-blur-sm border-border hover:shadow-lg transition-all duration-300 hover:scale-105">
      <div className="p-6">
        <div className="mb-4">{icon}</div>
        <h3 className="text-lg font-medium text-primary mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Card>
  );
};

export default Welcome;
