
"use client";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const sosTypes = [
  { id: "violence", label: "Violence" },
  { id: "panic", label: "Panic" },
  { id: "medical", label: "Medical" },
  { id: "harassment", label: "Harassment" },
  { id: "other", label: "Other Emergency" }
];

interface SosData {
  type: string;
  anonymous: boolean;
  location: {
    lat: number;
    lng: number;
  } | null;
}

const SosButton = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [alertType, setAlertType] = useState<string>("violence");
  const [anonymous, setAnonymous] = useState(false);
  const [location, setLocation] = useState<{lat: number; lng: number} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenSOS = () => {
    // Get current location before opening the dialog
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsOpen(true);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Unable to get your location. SOS alerts require your location.",
            variant: "destructive"
          });
          // Still open the dialog, but without location
          setLocation(null);
          setIsOpen(true);
        }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description: "Your device doesn't support geolocation. SOS alerts require your location.",
        variant: "destructive"
      });
      setLocation(null);
      setIsOpen(true);
    }
  };

  const handleSendSOS = async () => {
    if (!location) {
      toast({
        title: "Location Required",
        description: "SOS alerts require your location to send help to the right place.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);

      // Get current user (if logged in)
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      // Create the SOS alert in Supabase
      const { error } = await supabase
        .from('sos_alerts')
        .insert({
          type: alertType,
          is_anonymous: anonymous,
          user_id: anonymous ? null : userId,
          latitude: location.lat.toString(),
          longitude: location.lng.toString(),
          status: 'active',
          resolved_at: null
        });

      if (error) throw error;

      // Close dialog and show success toast
      setIsOpen(false);
      
      toast({
        title: "SOS Alert Sent",
        description: "Emergency services and nearby users have been notified of your situation.",
        duration: 5000,
      });

      // Reset form
      setAlertType("violence");
      setAnonymous(false);
      
    } catch (error) {
      console.error("Error sending SOS alert:", error);
      toast({
        title: "Failed to Send Alert",
        description: "There was a problem sending your SOS alert. Please try again or call emergency services directly.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpenSOS}
        className="fixed right-6 bottom-24 z-50 w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-95 group"
        aria-label="Send SOS"
      >
        {/* Pulsing rings effect */}
        <div 
          className="absolute inset-0 rounded-full bg-red-500/50 animate-[pulse_1.5s_ease-in-out_infinite] opacity-90"
        />
        <div 
          className="absolute inset-0 scale-110 rounded-full bg-red-500/40 animate-[pulse_2s_ease-in-out_infinite]"
          style={{ animationDelay: '0.5s' }}
        />
        <div 
          className="absolute inset-0 scale-125 rounded-full bg-red-500/30 animate-[pulse_2.5s_ease-in-out_infinite]"
          style={{ animationDelay: '1s' }}
        />
        
        <span className="relative z-10 text-white font-bold text-base">SOS</span>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-red-500 font-bold text-xl">SOS EMERGENCY ALERT</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <p className="text-sm text-center">
              This will alert emergency services and nearby users to your situation.
              {location ? null : (
                <span className="block mt-2 text-red-500 font-semibold">
                  Warning: Unable to detect your location. Help may be delayed.
                </span>
              )}
            </p>
            
            <RadioGroup value={alertType} onValueChange={setAlertType} className="flex flex-col space-y-2">
              {sosTypes.map((sos) => (
                <div key={sos.id} className="flex items-center space-x-2 border border-red-200 p-3 rounded-md hover:bg-red-50">
                  <RadioGroupItem value={sos.id} id={sos.id} />
                  <Label htmlFor={sos.id} className="cursor-pointer flex-1">
                    {sos.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            <label className="inline-flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={() => setAnonymous(!anonymous)}
                className="h-4 w-4 rounded border border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm">Report Anonymously</span>
            </label>
            
            {location && (
              <p className="text-xs text-gray-500 mt-1">
                Your location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            )}
          </div>
          
          <DialogFooter className="flex space-x-2 sm:justify-center">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleSendSOS}
              disabled={isLoading}
              className="px-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : "Send SOS Alert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SosButton;
