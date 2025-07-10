import React from "react";
import { UberNavbar } from "./UberNavbar";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      <UberNavbar />
      
      <main className="flex-1">
        {children}
      </main>
      
      {/* Mobile spacing for bottom nav */}
      {isMobile && <div className="h-16" />}
    </div>
  );
};