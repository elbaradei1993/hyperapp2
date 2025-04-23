
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { LifeBuoy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SosButton = () => {
  const { toast } = useToast();

  const handleSOS = () => {
    toast({
      title: "SOS Alert",
      description: "This feature will be available when connected to a database.",
      variant: "destructive",
    });
  };

  return (
    <Button
      variant="destructive"
      className="fixed bottom-24 right-6 z-30 rounded-full w-16 h-16 shadow-lg flex items-center justify-center"
      onClick={handleSOS}
    >
      <LifeBuoy className="h-8 w-8" />
    </Button>
  );
};

export default SosButton;
