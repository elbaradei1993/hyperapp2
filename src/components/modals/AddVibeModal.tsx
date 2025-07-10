import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddVibeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddVibeModal = ({ isOpen, onClose }: AddVibeModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'positive'
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      getUserLocation();
    }
  }, [isOpen]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Location Error",
            description: "Could not get your location. Please try again.",
            variant: "destructive"
          });
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userLocation) {
      toast({
        title: "Location Required",
        description: "Please allow access to your location to continue",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Vibe Reported",
        description: "Your vibe report has been submitted successfully"
      });
      
      onClose();
      setFormData({ title: '', description: '', type: 'positive' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit vibe report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Report a Vibe</DialogTitle>
          <DialogDescription>
            Share what's happening around you with the community
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g. Amazing Street Festival"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what's happening here..."
              className="min-h-[100px]"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Vibe Type</Label>
            <select
              id="type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="alert">Alert</option>
            </select>
          </div>

          <div className="bg-muted p-3 rounded-md flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
            <div>
              <h4 className="text-sm font-medium">Location</h4>
              {userLocation ? (
                <p className="text-xs text-muted-foreground">
                  Lat: {userLocation.lat.toFixed(6)}, Long: {userLocation.lng.toFixed(6)}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Detecting your location...</p>
              )}
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="ml-auto"
              onClick={getUserLocation}
            >
              Refresh
            </Button>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !userLocation || !formData.title || !formData.description}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Report
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};