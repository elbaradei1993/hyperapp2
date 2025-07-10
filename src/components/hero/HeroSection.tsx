import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Users, MapPin } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="hero-gradient py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              Get in the safety seat
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Real-time community safety and event awareness. Connect with your neighborhood, 
              report incidents, and stay informed — block by block, vibe by vibe.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Get Started
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
            <div className="flex flex-col items-center space-y-2">
              <Shield className="text-primary" size={32} />
              <h3 className="font-semibold">Real-time Safety</h3>
              <p className="text-muted-foreground text-sm text-center">
                Instant alerts and community reports
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <Users className="text-primary" size={32} />
              <h3 className="font-semibold">Community Powered</h3>
              <p className="text-muted-foreground text-sm text-center">
                Built by neighbors, for neighbors
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <MapPin className="text-primary" size={32} />
              <h3 className="font-semibold">Hyperlocal</h3>
              <p className="text-muted-foreground text-sm text-center">
                Focused on your immediate area
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};