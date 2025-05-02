
"use client";

import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import IndividualRegisterForm from "@/components/auth/IndividualRegisterForm";
import OrganizationRegisterForm from "@/components/auth/OrganizationRegisterForm";
import LoginForm from "@/components/auth/LoginForm";
import { User, Building, Check, Shield, Users, Activity, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Welcome = () => {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const { t } = useLanguage();

  return (
    <div className="min-h-screen overflow-hidden relative bg-background">
      {/* Abstract Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-br from-primary/20 to-secondary/20 rounded-b-[50%] transform -translate-y-1/4 scale-150"></div>
        <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-gradient-to-tl from-accent/20 to-background rounded-tl-[100%] transform translate-x-1/4 translate-y-1/4"></div>
      </div>

      {/* Animated Dots */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/5 animate-pulse">
          <div className="w-2 h-2 bg-primary rounded-full opacity-60"></div>
        </div>
        <div className="absolute top-2/3 left-1/3 animate-pulse delay-300">
          <div className="w-3 h-3 bg-secondary rounded-full opacity-60"></div>
        </div>
        <div className="absolute top-1/3 right-1/4 animate-pulse delay-700">
          <div className="w-2 h-2 bg-accent rounded-full opacity-70"></div>
        </div>
        <div className="absolute bottom-1/4 right-1/3 animate-pulse delay-500">
          <div className="w-2 h-2 bg-primary rounded-full opacity-60"></div>
        </div>
        <div className="absolute bottom-1/3 left-1/4 animate-pulse delay-1000">
          <div className="w-3 h-3 bg-secondary/70 rounded-full opacity-50"></div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Header with App Name and Slogan */}
        <div className="text-center mb-16 pt-8 animate-fade-in">
          <h1 className="text-5xl font-light tracking-wide text-primary mb-3 flex items-center justify-center">
            <span className="relative">
              HyperApp
              <span className="absolute -top-1 -right-4 w-3 h-3 bg-primary rounded-full animate-ping opacity-75"></span>
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Stay safe...Stay connected
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center justify-center">
          {/* Left Column - Auth Card */}
          <div className="w-full max-w-md">
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
                {t('signIn')}
              </button>
              <button 
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  authMode === "register" 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-accent"
                }`}
                onClick={() => setAuthMode("register")}
              >
                {t('register')}
              </button>
            </div>

            {/* Card Container */}
            <div className="w-full bg-card/90 backdrop-blur-lg rounded-3xl shadow-xl border border-border/50 overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              {authMode === "login" ? (
                <div className="p-8">
                  <h2 className="text-2xl font-medium text-foreground mb-6 text-center">
                    {t('welcome')} Back
                  </h2>
                  <LoginForm />
                </div>
              ) : (
                <div className="p-6">
                  <h2 className="text-2xl font-medium text-foreground mb-6 text-center">
                    {t('createEvent')} Your Account
                  </h2>
                  
                  <Tabs defaultValue="individual" className="w-full">
                    <TabsList className="grid grid-cols-2 mb-6">
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
                    
                    <TabsContent value="organization" className="mt-0 text-foreground">
                      <OrganizationRegisterForm />
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - App Features */}
          <div className="w-full max-w-md space-y-8">
            <div className="text-center md:text-left mb-8">
              <h2 className="text-3xl font-light text-foreground mb-3">Stay Connected</h2>
              <p className="text-muted-foreground">
                Join the community and discover safe spaces around you. Real-time updates and personalized recommendations.
              </p>
            </div>

            <div className="space-y-4">
              <FeatureCard 
                title="Real-time Safety Information"
                description="Get instant alerts about safety concerns in your area."
                icon={<Activity className="h-6 w-6 text-primary" />}
              />
              <FeatureCard 
                title="Connect with Community"
                description="Find like-minded people and build your support network."
                icon={<Users className="h-6 w-6 text-primary" />}
              />
              <FeatureCard 
                title="Safe Spaces Directory"
                description="Discover welcoming venues verified by the community."
                icon={<Shield className="h-6 w-6 text-primary" />}
              />
              <FeatureCard 
                title="Global Accessibility"
                description="Available in multiple languages with localized content."
                icon={<Globe className="h-6 w-6 text-primary" />}
              />
            </div>

            <div className="flex justify-center md:justify-start">
              <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white border-none">
                Learn More
              </Button>
            </div>
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
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="p-4 flex items-start space-x-4">
        <div className="bg-primary/10 p-3 rounded-full">
          {icon}
        </div>
        <div>
          <h3 className="text-base font-medium text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
};

export default Welcome;
