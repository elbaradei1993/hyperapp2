
"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import IndividualRegisterForm from "@/components/auth/IndividualRegisterForm";
import OrganizationRegisterForm from "@/components/auth/OrganizationRegisterForm";
import LoginForm from "@/components/auth/LoginForm";
import { User, Building, Check, Shield, Users, Activity, Globe, MapPin, Bell } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { FadeIn } from "@/components/ui/design-system";

const Welcome = () => {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Add parallax effect on mouse move
    const handleMouseMove = (e: MouseEvent) => {
      const parallaxLayers = document.querySelectorAll('.parallax-layer');
      parallaxLayers.forEach(layer => {
        const speed = (layer as HTMLElement).dataset.speed || "5";
        const x = (window.innerWidth - e.pageX * parseInt(speed)) / 100;
        const y = (window.innerHeight - e.pageY * parseInt(speed)) / 100;
        (layer as HTMLElement).style.transform = `translateX(${x}px) translateY(${y}px)`;
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  if (!mounted) return null;

  return (
    <div className="min-h-screen overflow-hidden relative bg-background">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Backgrounds */}
        <div className="absolute top-0 left-0 right-0 h-[60%] bg-gradient-to-br from-primary/10 to-accent/10 rounded-b-[50%] transform -translate-y-1/4 scale-150"></div>
        <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-gradient-to-tl from-accent/5 to-background rounded-tl-[100%] transform translate-x-1/4 translate-y-1/4"></div>
        
        {/* Parallax Elements */}
        <div className="parallax-layer" data-speed="2">
          <div className="absolute top-1/4 left-1/5 w-64 h-64 rounded-full bg-primary/5 blur-3xl"></div>
        </div>
        <div className="parallax-layer" data-speed="4">
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl"></div>
        </div>
        <div className="parallax-layer" data-speed="6">
          <div className="absolute top-1/2 left-2/3 w-32 h-32 rounded-full bg-primary/10 blur-xl"></div>
        </div>
        
        {/* Animated Blobs */}
        <div className="absolute top-1/4 left-1/5 animate-pulse">
          <div className="w-2 h-2 bg-primary rounded-full opacity-60"></div>
        </div>
        <div className="absolute top-2/3 left-1/3 animate-pulse delay-300">
          <div className="w-3 h-3 bg-accent rounded-full opacity-60"></div>
        </div>
        <div className="absolute top-1/3 right-1/4 animate-pulse delay-700">
          <div className="w-2 h-2 bg-primary rounded-full opacity-70"></div>
        </div>
        <div className="absolute bottom-1/4 right-1/3 animate-pulse delay-500">
          <div className="w-2 h-2 bg-primary rounded-full opacity-60"></div>
        </div>
        <div className="absolute bottom-1/3 left-1/4 animate-pulse delay-1000">
          <div className="w-3 h-3 bg-accent/70 rounded-full opacity-50"></div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Header with App Name and Slogan */}
        <FadeIn>
          <div className="text-center mb-12 pt-8">
            <div className="flex items-center justify-center mb-3">
              <MapPin className="h-7 w-7 mr-2 text-primary" />
              <h1 className="text-5xl font-light tracking-wide text-foreground relative inline-block">
                HyperApp
                <span className="absolute -top-1 -right-4 w-3 h-3 bg-primary rounded-full animate-ping opacity-75"></span>
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-lg mx-auto">
              Stay safe. Stay connected.
            </p>
          </div>
        </FadeIn>

        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center justify-center">
          {/* Left Column - Auth Card */}
          <FadeIn delay="100ms" className="w-full max-w-md">
            {/* Auth Mode Toggle */}
            <div className="bg-muted rounded-full p-1 mb-8 inline-flex shadow-lg">
              <button 
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  authMode === "login" 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-accent/20"
                }`}
                onClick={() => setAuthMode("login")}
              >
                {t('signIn')}
              </button>
              <button 
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  authMode === "register" 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-accent/20"
                }`}
                onClick={() => setAuthMode("register")}
              >
                {t('register')}
              </button>
            </div>

            {/* Card Container */}
            <div className="w-full bg-card/90 backdrop-blur-lg rounded-3xl shadow-xl border border-border/50 overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
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
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="individual" className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Individual
                      </TabsTrigger>
                      <TabsTrigger value="organization" className="flex items-center">
                        <Building className="w-4 h-4 mr-2" />
                        Organization
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="individual" className="mt-0">
                      <IndividualRegisterForm />
                    </TabsContent>
                    
                    <TabsContent value="organization" className="mt-0 text-foreground h-[500px] overflow-auto">
                      <OrganizationRegisterForm />
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
            
            <p className="text-center text-sm text-muted-foreground mt-4">
              By continuing, you agree to HyperApp's{" "}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </p>
          </FadeIn>

          {/* Right Column - App Features */}
          <FadeIn delay="200ms" className="w-full max-w-md space-y-8">
            <div className="text-center md:text-left mb-8">
              <h2 className="text-3xl font-light text-foreground mb-3">The community safety app</h2>
              <p className="text-muted-foreground">
                Join the community and discover safe spaces around you. Real-time updates and personalized recommendations.
              </p>
            </div>

            <div className="space-y-4">
              <FeatureCard 
                title="Real-time Safety Information"
                description="Get instant alerts about safety concerns in your area."
                icon={<Activity className="h-6 w-6 text-primary" />}
                delay="100ms"
              />
              <FeatureCard 
                title="Connect with Community"
                description="Find like-minded people and build your support network."
                icon={<Users className="h-6 w-6 text-accent" />}
                delay="200ms"
              />
              <FeatureCard 
                title="Safe Spaces Directory"
                description="Discover welcoming venues verified by the community."
                icon={<Shield className="h-6 w-6 text-primary" />}
                delay="300ms"
              />
              <FeatureCard 
                title="Global Accessibility"
                description="Available in multiple languages with localized content."
                icon={<Globe className="h-6 w-6 text-accent" />}
                delay="400ms"
              />
            </div>

            <div className="flex justify-center md:justify-start">
              <Button 
                size="lg" 
                className="btn-gradient shadow-lg shadow-primary/20"
                onClick={() => navigate("/")}
              >
                Explore Now
              </Button>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
};

// Helper component for feature cards
const FeatureCard = ({ 
  title, 
  description, 
  icon,
  delay = "0ms" 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
  delay?: string;
}) => {
  return (
    <FadeIn delay={delay}>
      <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-md transition-all duration-300 overflow-hidden group">
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 group-hover:bg-primary/20 transition-colors p-3 rounded-full">
              {icon}
            </div>
            <div>
              <h3 className="text-base font-medium text-foreground mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
};

export default Welcome;
