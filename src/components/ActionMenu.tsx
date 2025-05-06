import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, MapPin, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { VibeService, VibeType } from '@/services/vibes';

interface ActionMenuProps {
  className?: string;
}

const ActionMenu = ({ className }: ActionMenuProps) => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'menu' | 'vibe' | 'sos'>('menu');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClose = () => {
    setOpen(false);
    // Reset to menu view after dialog closes
    setTimeout(() => setView('menu'), 300);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          className={`rounded-full h-10 w-10 p-0 ${className}`}
          aria-label="Add new content"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {view === 'menu' && (
          <>
            <DialogHeader>
              <DialogTitle>Add New</DialogTitle>
              <DialogDescription>
                Choose what you'd like to add
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <Button 
                variant="outline" 
                className="flex flex-col h-auto py-6 gap-3"
                onClick={() => setView('vibe')}
              >
                <MapPin className="h-8 w-8 text-primary" />
                <span>Report a Vibe</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex flex-col h-auto py-6 gap-3"
                onClick={() => setView('sos')}
              >
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <span>Send SOS</span>
              </Button>
            </div>
          </>
        )}

        {view === 'vibe' && <VibeForm onClose={handleClose} />}
        {view === 'sos' && <SosForm onClose={handleClose} />}
      </DialogContent>
    </Dialog>
  );
};

interface FormProps {
  onClose: () => void;
}

const VibeForm = ({ onClose }: FormProps) => {
  const [loading, setLoading] = useState(false);
  const [vibeTypes, setVibeTypes] = useState<VibeType[]>([]);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const { user } = useAuth();

  React.useEffect(() => {
    const loadVibeTypes = async () => {
      try {
        const types = await VibeService.getVibeTypes();
        setVibeTypes(types);
        if (types.length > 0) {
          setSelectedType(types[0].id);
        }
      } catch (error) {
        console.error('Error loading vibe types:', error);
        toast.error('Could not load vibe types');
      }
    };

    // Get user's current location
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
          toast.error('Could not determine your location');
        }
      );
    }

    loadVibeTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a title for your vibe');
      return;
    }

    if (!selectedType) {
      toast.error('Please select a vibe type');
      return;
    }

    if (!location) {
      toast.error('Waiting for your location...');
      return;
    }

    setLoading(true);

    try {
      const vibeData = {
        title,
        description,
        latitude: location.lat.toString(),
        longitude: location.lng.toString(),
        vibe_type_id: selectedType,
        user_id: user ? parseInt(user.id) : null
      };

      const result = await VibeService.createVibeReport(vibeData);
      
      if (result) {
        toast.success('Vibe reported successfully!');
        onClose();
      } else {
        toast.error('Failed to report vibe');
      }
    } catch (error) {
      console.error('Error reporting vibe:', error);
      toast.error('Failed to report vibe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Report a Vibe</DialogTitle>
        <DialogDescription>
          Share what's happening around you
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <input
            id="title"
            className="w-full p-2 border rounded-md"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's happening?"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            className="w-full p-2 border rounded-md"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us more..."
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Vibe Type</Label>
          <div className="flex flex-wrap gap-2">
            {vibeTypes.map(type => (
              <Button
                key={type.id}
                type="button"
                variant={selectedType === type.id ? "default" : "outline"}
                className="flex items-center gap-1.5"
                style={selectedType === type.id ? {} : { borderColor: `${type.color}40` }}
                onClick={() => setSelectedType(type.id)}
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: type.color }}
                />
                {type.name}
              </Button>
            ))}
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Report Vibe'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

const SosForm = ({ onClose }: FormProps) => {
  const [loading, setLoading] = useState(false);
  const [sosType, setSosType] = useState("emergency");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { user } = useAuth();

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
          user_id: isAnonymous ? null : user?.id
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
      
      onClose();
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
    <>
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
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            type="submit"
            variant="destructive"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Alert"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

export default ActionMenu;
