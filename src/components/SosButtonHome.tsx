
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, AlertTriangle, X } from 'lucide-react';
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

const SosButtonHome = () => {
  const [open, setOpen] = useState(false);
  const [calling, setCalling] = useState(false);
  const { toast } = useToast();

  const handleEmergencyCall = async () => {
    setCalling(true);
    
    try {
      // Get current location
      const position = await getCurrentPosition();
      
      // Send SOS alert to Supabase
      const { error } = await supabase
        .from('sos_alerts')
        .insert({
          is_anonymous: false,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
          type: 'emergency',
          status: 'active'
        });
      
      if (error) throw error;
      
      toast({
        title: "Emergency Alert Sent",
        description: "Emergency services and nearby users have been notified of your location.",
        variant: "destructive",
      });
      
    } catch (error) {
      console.error("Error sending SOS alert:", error);
      toast({
        title: "Failed to Send Alert",
        description: "Please try again or call emergency services directly.",
        variant: "destructive",
      });
    } finally {
      setCalling(false);
      setOpen(false);
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
      <Button
        variant="destructive"
        className="rounded-full shadow-lg w-16 h-16 flex items-center justify-center animate-pulse bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-400"
        onClick={() => setOpen(true)}
      >
        <AlertTriangle className="h-8 w-8" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-500">Emergency Assistance</DialogTitle>
            <DialogDescription>
              Activate emergency services and alert nearby community members.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
                <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">This will:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-600 dark:text-red-400">
                  <li>Share your current location with emergency services</li>
                  <li>Alert nearby community members who have opted in to help</li>
                  <li>Notify your emergency contacts (if configured)</li>
                </ul>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                
                <Button 
                  variant="destructive"
                  className="animate-pulse bg-red-600 hover:bg-red-700"
                  disabled={calling}
                  onClick={handleEmergencyCall}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  {calling ? "Sending..." : "Send Alert"}
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
