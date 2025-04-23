
"use client";

import React from "react";
import { NavLink } from "react-router-dom";
import { Home, User, Settings } from "lucide-react";

const Navbar = () => {
  return (
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
  );
};

export default Navbar;

