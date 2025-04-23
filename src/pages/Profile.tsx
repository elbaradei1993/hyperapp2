
"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { toast } = useToast();

  const showMessage = () => {
    toast({
      title: "Coming Soon",
      description: "Profile functionality will be available when connected to a database.",
    });
  };

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col min-h-screen pb-16">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      <div className="flex flex-col items-center justify-center space-y-6 flex-grow">
        <Avatar className="w-24 h-24">
          <AvatarFallback>
            <User className="h-12 w-12" />
          </AvatarFallback>
        </Avatar>
        
        <div className="text-center">
          <h2 className="text-xl font-semibold">Welcome!</h2>
          <p className="text-muted-foreground">Sign in to view your profile</p>
        </div>
        
        <Button onClick={showMessage}>
          Sign In
        </Button>
      </div>

      <Navbar />
    </div>
  );
};

export default Profile;
