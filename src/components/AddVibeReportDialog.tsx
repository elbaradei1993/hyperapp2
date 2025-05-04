
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VibeService, fetchVibeTypes, VibeType } from '@/services/VibeService';

// Form schema
const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  vibeTypeId: z.string().min(1, { message: 'Please select a vibe type' }),
});

type FormValues = z.infer<typeof formSchema>;

interface AddVibeReportDialogProps {
  trigger: React.ReactNode;
}

const AddVibeReportDialog = ({ trigger }: AddVibeReportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [vibeTypes, setVibeTypes] = useState<VibeType[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      vibeTypeId: '',
    },
  });

  // Get vibe types
  useEffect(() => {
    const getVibeTypes = async () => {
      const types = await fetchVibeTypes();
      setVibeTypes(types);
    };
    
    if (open) {
      getVibeTypes();
      getUserLocation();
    }
  }, [open]);

  // Get user location
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
            description: "Could not get your location. Please try again or enter coordinates manually.",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive"
      });
    }
  };

  // Form submission
  const onSubmit = async (values: FormValues) => {
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
      // Get current user (if logged in)
      const { data: { session } } = await supabase.auth.getSession();
      
      const vibeData = {
        title: values.title,
        description: values.description,
        latitude: userLocation.lat.toString(),
        longitude: userLocation.lng.toString(),
        vibe_type_id: parseInt(values.vibeTypeId),
        user_id: session?.user?.id ? Number(session.user.id) : null,
      };
      
      const newVibe = await VibeService.createVibeReport(vibeData);
      
      if (newVibe) {
        toast({
          title: "Vibe Reported",
          description: "Your vibe report has been submitted successfully",
          variant: "default",
        });
        setOpen(false);
        form.reset();
      } else {
        throw new Error("Failed to create vibe report");
      }
    } catch (error) {
      console.error('Error submitting vibe report:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your vibe report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)}>
        {trigger}
      </div>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Report a Vibe</DialogTitle>
          <DialogDescription>
            Share what's happening around you with the community
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Amazing Street Festival" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what's happening here..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vibeTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vibe Type</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      onChange={e => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      value={field.value}
                    >
                      <option value="" disabled>Select vibe type</option>
                      {vibeTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button 
                type="submit" 
                disabled={loading || !userLocation}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Report
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddVibeReportDialog;
