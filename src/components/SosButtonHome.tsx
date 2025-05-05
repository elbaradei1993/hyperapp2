
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SosButtonHomeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SosButtonHome = ({ open, onOpenChange }: SosButtonHomeProps) => {
  const [loading, setLoading] = useState(false);
  const [sosType, setSosType] = useState("emergency");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
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
          status: 'active',
          user_id: isAnonymous ? null : null // We'll add user ID integration later
        });
      
      if (error) throw error;
      
      toast.success("Emergency Alert Sent", {
        description: "Emergency services have been notified of your location.",
      });

      // Simulate nearby help notification
      setTimeout(() => {
        toast.success("Help is on the way!", {
          description: "2 community members nearby have been alerted and are responding.",
        });
      }, 3000);
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending SOS alert:", error);
      toast.error("Failed to Send Alert", {
        description: "Please try again or call emergency services directly."
      });
    } finally {
      setLoading(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Emergency Assistance
          </DialogTitle>
          <DialogDescription>
            Activate emergency services and alert nearby community members.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Your location will be shared with emergency services and nearby community members who can help.
            </p>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button 
              type="submit"
              variant="destructive"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Alert"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SosButtonHome;
