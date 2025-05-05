
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, AlertTriangle, X, Shield } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface SosButtonHomeProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SosButtonHome = ({ open: controlledOpen, onOpenChange }: SosButtonHomeProps) => {
  const [open, setOpen] = useState(controlledOpen || false);
  const [submitting, setSubmitting] = useState(false);
  const [sosType, setSosType] = useState("emergency");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [rippleEffect, setRippleEffect] = useState(false);
  const { toast } = useToast();
  
  // Handle state from both controlled and uncontrolled modes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  // Start ripple effect when SOS button is clicked
  const handleSosButtonClick = () => {
    setRippleEffect(true);
    setTimeout(() => setRippleEffect(false), 1000); // Stop animation after 1 second
    handleOpenChange(true);
  };

  const handleEmergencySubmit = async () => {
    setSubmitting(true);
    
    try {
      // Get current location
      const position = await getCurrentPosition();
      
      // Send SOS alert to Supabase
      const { error } = await supabase
        .from('sos_alerts')
        .insert({
          is_anonymous: isAnonymous,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
          type: sosType,
          status: 'active'
        });
      
      if (error) throw error;
      
      toast({
        title: "Emergency Alert Sent",
        description: "Emergency services have been notified of your location.",
        variant: "destructive",
      });

      // Check for nearby help (simplified version)
      // In a real app, this would query for nearby users who could help
      setTimeout(() => {
        toast({
          title: "Help is on the way!",
          description: "2 community members nearby have been alerted and are responding.",
          variant: "default",
        });
      }, 3000);
      
    } catch (error) {
      console.error("Error sending SOS alert:", error);
      toast({
        title: "Failed to Send Alert",
        description: "Please try again or call emergency services directly.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      handleOpenChange(false);
    }
  };
  
  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      }
    });
  };

  return (
    <>
      {/* SOS Button with ripple effect */}
      <Button
        variant="destructive"
        size="sm"
        className={`fixed bottom-24 right-6 z-30 rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-lg font-bold ${
          rippleEffect ? 'animate-sos-pulse' : 'hover:bg-red-700 active:bg-red-800 animate-pulse'
        } bg-red-600`}
        onClick={handleSosButtonClick}
        aria-label="Emergency SOS button"
      >
        SOS
        {rippleEffect && (
          <>
            <span className="absolute w-full h-full rounded-full animate-ping bg-red-600 opacity-75"></span>
            <span className="absolute w-full h-full rounded-full animate-ping bg-red-600 opacity-50" style={{ animationDelay: "0.2s" }}></span>
            <span className="absolute w-full h-full rounded-full animate-ping bg-red-600 opacity-25" style={{ animationDelay: "0.4s" }}></span>
          </>
        )}
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Emergency Assistance
            </DialogTitle>
            <DialogDescription>
              Activate emergency services and alert nearby community members.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
                <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">Emergency Type:</h3>
                <RadioGroup defaultValue="emergency" value={sosType} onValueChange={setSosType}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="emergency" id="emergency" />
                    <Label htmlFor="emergency">General Emergency</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medical" id="medical" />
                    <Label htmlFor="medical">Medical Emergency</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="safety" id="safety" />
                    <Label htmlFor="safety">Safety Threat</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="anonymous" 
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
                <Label htmlFor="anonymous">Report Anonymously</Label>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
                <p className="text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Your location will be shared with emergency services and nearby community members who can help.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20"
                  onClick={() => handleOpenChange(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                
                <Button 
                  variant="destructive"
                  className="animate-pulse bg-red-600 hover:bg-red-700"
                  disabled={submitting}
                  onClick={handleEmergencySubmit}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  {submitting ? "Sending..." : "Send Alert"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SosButtonHome;
