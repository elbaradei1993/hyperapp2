
"use client";

import React from "react";
import { NavLink } from "react-router-dom";
import { Home, User, Settings, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const { toast } = useToast();

  const handleAddVibe = () => {
    toast({
      title: "Add Vibe",
      description: "This feature will be available when connected to a database.",
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      <Button 
        onClick={handleAddVibe}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 rounded-full w-14 h-14 shadow-lg flex items-center justify-center bg-primary hover:bg-primary/90"
      >
        <Plus className="h-6 w-6" />
      </Button>
      
      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full bg-background border-t border-border shadow-lg flex justify-around items-center px-6 py-2 z-40">
        <NavLink
          to="/"
          className={({ isActive }) =>
            (isActive ? "text-primary" : "text-muted-foreground") +
            " flex flex-col items-center text-xs"
          }
        >
          <Home className="mb-1" />
          Home
        </NavLink>
        <NavLink
          to="/trending"
          className={({ isActive }) =>
            (isActive ? "text-primary" : "text-muted-foreground") +
            " flex flex-col items-center text-xs"
          }
        >
          <TrendingUp className="mb-1" />
          Trending
        </NavLink>
        <div className="w-10" /> {/* Spacer for FAB */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            (isActive ? "text-primary" : "text-muted-foreground") +
            " flex flex-col items-center text-xs"
          }
        >
          <User className="mb-1" />
          Profile
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            (isActive ? "text-primary" : "text-muted-foreground") +
            " flex flex-col items-center text-xs"
          }
        >
          <Settings className="mb-1" />
          Settings
        </NavLink>
      </nav>
    </>
  );
};

export default Navbar;
