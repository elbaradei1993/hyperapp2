
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, User, Settings, TrendingUp, Plus } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

interface VibeType {
  id: number;
  name: string;
  color: string;
}

const Navbar = () => {
  const { user } = useAuth();
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
        user_id: null, // Set to null since user_id expects a number in DB but auth returns string
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
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border/40 z-40">
      <div className="container max-w-md mx-auto">
        <div className="flex items-center justify-around">
          <NavItem to="/" icon={<Home />} label="Home" />
          <NavItem to="/trending" icon={<TrendingUp />} label="Trending" />
          
          {/* Add Vibe Report Button in Navbar */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="flex flex-col items-center py-2 px-3 transition-colors text-primary hover:text-primary/90">
                <div className="mb-1">
                  <Plus />
                </div>
                <span className="text-xs">Add Vibe</span>
              </button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Report a Vibe</DialogTitle>
                <DialogDescription>
                  Share the vibe of your current location with the community.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="vibe-type">Vibe Type</Label>
                  {isLoadingTypes ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Loading vibe types...</span>
                    </div>
                  ) : (
                    <select
                      id="vibe-type"
                      className="w-full flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={vibeTypeId?.toString() || ''}
                      onChange={(e) => setVibeTypeId(parseInt(e.target.value))}
                    >
                      <option value="" disabled>Select a vibe type</option>
                      {vibeTypes.map((type) => (
                        <option key={type.id} value={type.id.toString()}>
                          {type.name}
                        </option>
                      ))}
                    </select>
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

          {user ? (
            <>
              <NavItem to="/profile" icon={<User />} label="Profile" />
              <NavItem to="/settings" icon={<Settings />} label="Settings" />
            </>
          ) : (
            <NavItem to="/auth" icon={<User />} label="Sign In" />
          )}
        </div>
      </div>
    </nav>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem = ({ to, icon, label }: NavItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center py-2 px-3 transition-colors ${
        isActive
          ? 'text-primary'
          : 'text-muted-foreground hover:text-foreground'
      }`
    }
  >
    <div className="mb-1">{icon}</div>
    <span className="text-xs">{label}</span>
  </NavLink>
);

export default Navbar;
