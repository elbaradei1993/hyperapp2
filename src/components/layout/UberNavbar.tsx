import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Wrench, Activity, User } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const navItems = [
  { 
    icon: Home, 
    label: "Home", 
    path: "/" 
  },
  { 
    icon: Activity, 
    label: "Pulse", 
    path: "/pulse" 
  },
  { 
    icon: Wrench, 
    label: "Explore", 
    path: "/explore" 
  },
  { 
    icon: User, 
    label: "Account", 
    path: "/account" 
  },
];

export const UberNavbar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <>
        <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 portrait:flex landscape:hidden">
          <div className="grid grid-cols-4 h-16 w-full">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center justify-center space-y-1 nav-item",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
        
        {/* Landscape mobile notice */}
        <div className="landscape:flex portrait:hidden fixed bottom-0 left-0 right-0 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-2 text-center text-sm z-50">
          Please rotate your device to portrait mode for the best experience
        </div>
      </>
    );
  }

  return (
    <nav className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-foreground">
            HyperAPP
          </Link>
          
          <div className="flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-2 nav-item font-medium",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};