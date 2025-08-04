
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
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

interface AddVibeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddVibeModal = ({ isOpen, onClose }: AddVibeModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    vibe_type_id: 1
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to report a vibe",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Get or create user mapping first
      let userMapping;
      const { data: existingMapping } = await supabase
        .from('user_mapping')
        .select('integer_id')
        .eq('uuid_id', user.id)
        .maybeSingle();

      if (existingMapping) {
        userMapping = existingMapping;
      } else {
        // Create new mapping
        const integerId = Math.floor(Math.random() * 2147483647);
        const { data: newMapping, error: mappingError } = await supabase
          .from('user_mapping')
          .insert({ uuid_id: user.id, integer_id: integerId })
          .select('integer_id')
          .single();
        
        if (mappingError) throw mappingError;
        userMapping = newMapping;
      }

      // Create the vibe report with proper timezone handling
      const vibeData = {
        title: formData.title,
        description: formData.description,
        latitude: userLocation.lat.toString(),
        longitude: userLocation.lng.toString(),
        vibe_type_id: formData.vibe_type_id,
        user_id: userMapping.integer_id,
        is_anonymous: false,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('vibe_reports')
        .insert(vibeData)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Vibe Reported",
        description: "Your vibe report has been submitted successfully"
      });
      
      onClose();
      setFormData({ title: '', description: '', vibe_type_id: 1 });
      
      // Refresh the page to show new data
      window.location.reload();
    } catch (error) {
      console.error('Error creating vibe report:', error);
      toast({
        title: "Error",
        description: "Failed to submit vibe report. Please try again.",
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
            <Label htmlFor="vibe_type_id">Vibe Type</Label>
            <select
              id="vibe_type_id"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.vibe_type_id}
              onChange={(e) => setFormData(prev => ({ ...prev, vibe_type_id: parseInt(e.target.value) }))}
            >
              <option value={1}>Calm</option>
              <option value={2}>Crowded</option>
              <option value={3}>Event</option>
              <option value={4}>Suspicious</option>
              <option value={5}>Noisy</option>
              <option value={6}>LGBTQIA+ Friendly</option>
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
