
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const SosButton = () => {
  const [open, setOpen] = useState(false);
  const [calling, setCalling] = useState(false);
  const { toast } = useToast();

  const handleEmergencyCall = () => {
    setCalling(true);
    // Simulate emergency call
    setTimeout(() => {
      setCalling(false);
      setOpen(false);
      toast({
        title: "Emergency Notification Sent",
        description: "Emergency services and nearby users have been notified of your location.",
        variant: "default",
      });
    }, 2000);
  };

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        className="fixed bottom-24 right-6 z-50 rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-lg font-bold hover:bg-red-700 active:bg-red-800 animate-pulse bg-red-600"
        onClick={() => setOpen(true)}
        aria-label="Emergency SOS button"
      >
        SOS
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
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

export default SosButton;
