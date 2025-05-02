
"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { CalendarIcon, Loader2, MapPin } from "lucide-react";
import { EventData, EventService } from "@/services/EventService";
import { VibeService } from "@/services/VibeService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { Select } from "@/components/ui/select";
import Map from "@/components/Map";

// Form schema
const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().optional(),
  location: z.string().min(2, { message: "Location is required." }),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  start_date: z.date({ required_error: "Start date is required." }),
  end_date: z.date({ required_error: "End date is required." }),
  vibe_type_id: z.number().optional(),
  max_attendees: z.number().optional(),
  is_public: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

const EventCreate = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [vibeTypes, setVibeTypes] = useState<Array<{ id: number; name: string; color: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [initialCoords, setInitialCoords] = useState<[number, number]>([-74.006, 40.7128]);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      latitude: "",
      longitude: "",
      start_date: new Date(),
      end_date: new Date(),
      max_attendees: undefined,
      is_public: true,
    },
  });

  // Load vibe types
  useEffect(() => {
    const loadVibeTypes = async () => {
      try {
        const types = await VibeService.getVibeTypes();
        setVibeTypes(types);
      } catch (error) {
        console.error("Error loading vibe types:", error);
        toast({
          title: t("error"),
          description: "Could not load vibe types",
          variant: "destructive",
        });
      }
    };

    loadVibeTypes();
    
    // Get user current location for map
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setInitialCoords([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, [toast, t]);

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be signed in to create events",
      });
      navigate("/auth");
    }
  }, [user, navigate, toast]);

  // Handle location pin from map
  const handleLocationSelect = (lat: number, lng: number) => {
    form.setValue("latitude", lat.toString());
    form.setValue("longitude", lng.toString());
    
    // Try to get address from coordinates using reverse geocoding
    const getAddressFromCoordinates = async (lat: number, lng: number) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        if (data?.display_name) {
          form.setValue("location", data.display_name);
        }
      } catch (error) {
        console.error("Error getting address:", error);
      }
    };
    
    getAddressFromCoordinates(lat, lng);
  };

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be signed in to create events",
      });
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    
    try {
      const eventData: EventData = {
        ...data,
        organization_id: user.id,
      };

      await EventService.createEvent(eventData);
      
      toast({
        title: "Event created",
        description: "Your event has been created successfully",
      });
      
      navigate("/");
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: t("error"),
        description: "Could not create event",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 pb-20">
      <Card>
        <CardHeader>
          <CardTitle>{t("createEvent")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("eventTitle")}</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event title" {...field} />
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
                    <FormLabel>{t("eventDescription")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter event description"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Optional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex flex-col space-y-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("eventLocation")}</FormLabel>
                      <div className="flex space-x-2">
                        <FormControl>
                          <Input placeholder="Enter event location" {...field} />
                        </FormControl>
                        <Button
                          type="button"
                          size="icon"
                          onClick={() => setIsMapVisible(!isMapVisible)}
                          variant="outline"
                        >
                          <MapPin className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {isMapVisible && (
                  <div className="h-60 rounded-md overflow-hidden border">
                    <Map 
                      initialCenter={initialCoords} 
                      vibes={[]} 
                    />
                  </div>
                )}
                
                <input
                  type="hidden"
                  {...form.register("latitude")}
                />
                <input
                  type="hidden"
                  {...form.register("longitude")}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t("startDate")}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t("endDate")}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < form.getValues("start_date")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="vibe_type_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vibe Type</FormLabel>
                      <Select
                        value={field.value?.toString() || ""}
                        onValueChange={(value) => field.onChange(parseInt(value) || undefined)}
                      >
                        <option value="">Select vibe type</option>
                        {vibeTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </Select>
                      <FormDescription>Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="max_attendees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("maxAttendees")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Leave empty for unlimited"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="is_public"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t("isPublic")}
                      </FormLabel>
                      <FormDescription>
                        Make this event visible to everyone
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                >
                  {t("cancel")}
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("loading")}
                    </>
                  ) : (
                    t("createEvent")
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventCreate;
