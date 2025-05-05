"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus, MapPin, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { safeParseInt } from '@/utils/typeConverters';
import { NativeSelect } from "@/components/ui/select";
import { VibeService } from '@/services/VibeService';
import { useAuth } from '@/components/auth/AuthProvider';

interface VibeType {
  id: number;
  name: string;
  color: string;
}

const AddVibeReportButton = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [vibeTypeId, setVibeTypeId] = useState<number | null>(null);
  const [vibeTypes, setVibeTypes] = useState<VibeType[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState('');

  // Fetch vibe types when the dialog opens
  useEffect(() => {
    if (open) {
      fetchVibeTypes();
      getCurrentLocation();
    }
  }, [open]);

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: 'Location Error',
            description: 'Unable to get your location. Please enable location services.',
            variant: 'destructive'
          });
        }
      );
    } else {
      toast({
        title: 'Location Not Supported',
        description: 'Your device does not support geolocation.',
        variant: 'destructive'
      });
    }
  };

  // Fetch vibe types from Supabase
  const fetchVibeTypes = async () => {
    try {
      setIsLoadingTypes(true);
      const { data, error } = await supabase
        .from('vibe_types')
        .select('id, name, color')
        .order('name');

      if (error) throw error;
      
      if (data) {
        setVibeTypes(data);
        if (data.length > 0) {
          setVibeTypeId(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching vibe types:', error);
      toast({
        title: 'Error',
        description: 'Failed to load vibe types.',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingTypes(false);
    }
  };

  // Submit vibe report
  const handleSubmit = async () => {
    if (!location) {
      toast({
        title: 'Location Required',
        description: 'Your location is required to submit a vibe report.',
        variant: 'destructive'
      });
      return;
    }

    if (!vibeTypeId) {
      toast({
        title: 'Vibe Type Required',
        description: 'Please select a vibe type.',
        variant: 'destructive'
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: 'Title Required',
        description: 'Please provide a title for your vibe report.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);

      // Get user session
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      const newVibeReport = {
        title,
        description: description.trim() || null,
        latitude: location.lat.toString(),
        longitude: location.lng.toString(),
        vibe_type_id: vibeTypeId,
        is_anonymous: isAnonymous,
        user_id: isAnonymous ? null : userId ? null : null, // Set to null since user_id expects a number in DB but auth returns string
      };

      const { error } = await supabase
        .from('vibe_reports')
        .insert(newVibeReport);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Your vibe report has been submitted.',
      });

      // Reset form and close dialog
      setTitle('');
      setDescription('');
      setIsAnonymous(false);
      setOpen(false);
    } catch (error) {
      console.error('Error submitting vibe report:', error);
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit your vibe report. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg z-20"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report a Vibe</DialogTitle>
          <DialogDescription>
            Share the vibe of your current location with the community.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="vibe-type">Vibe Type</Label>
            {isLoadingTypes ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading vibe types...</span>
              </div>
            ) : (
              <NativeSelect
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {vibeTypes.map((type) => (
                  <option 
                    key={type.id} 
                    value={type.id.toString()}
                  >
                    {type.name}
                  </option>
                ))}
              </NativeSelect>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your vibe a title"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the vibe in more detail..."
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="anonymous" 
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
            <Label htmlFor="anonymous">Report Anonymously</Label>
          </div>
          
          {location ? (
            <p className="text-xs text-muted-foreground">
              Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </p>
          ) : (
            <p className="text-xs text-rose-500 flex items-center">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Detecting your location...
            </p>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !location || !vibeTypeId}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Report'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddVibeReportButton;
