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
import { Calendar, MapPin, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateEventModal = ({ isOpen, onClose }: CreateEventModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: ''
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
        title: "Event Created",
        description: "Your event has been created successfully"
      });
      
      onClose();
      setFormData({ title: '', description: '', date: '', time: '', location: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event",
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
          <DialogTitle>Create Community Event</DialogTitle>
          <DialogDescription>
            Organize a gathering that brings your neighborhood together
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              placeholder="e.g. Community BBQ"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your event..."
              className="min-h-[100px]"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g. Community Center"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              required
            />
          </div>

          <div className="bg-muted p-3 rounded-md flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
            <div>
              <h4 className="text-sm font-medium">GPS Location</h4>
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
              Create Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};