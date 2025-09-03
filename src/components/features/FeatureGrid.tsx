import React from "react";
import { Link } from "react-router-dom";
import { TrendingUp, MapPin, BarChart3 } from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Trending Vibes",
    description: "See what's happening in your area right now",
    href: "/trending",
    color: "text-red-500"
  },
  {
    icon: MapPin,
    title: "Explore Nearby",
    description: "Live feed of nearby activities and alerts",
    href: "/explore",
    color: "text-green-500"
  },
  {
    icon: BarChart3,
    title: "Community Pulse",
    description: "Real-time mood and safety metrics",
    href: "/pulse",
    color: "text-purple-500"
  }
];

export const FeatureGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature) => {
        const Icon = feature.icon;
        
        return (
          <Link
            key={feature.title}
            to={feature.href}
            className="feature-card group"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={cn(
                "p-3 rounded-full bg-muted group-hover:scale-110 transition-transform",
                feature.color
              )}>
                <Icon size={24} />
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

function cn(...args: any[]) {
  return args.filter(Boolean).join(' ');
}