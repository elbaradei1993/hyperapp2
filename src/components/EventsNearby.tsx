
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventService, EventResponse } from "@/services/EventService";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, Loader2, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from 'date-fns';

const EventsNearby = () => {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const nearbyEvents = await EventService.getEvents(5); // Get top 5 nearby events
        setEvents(nearbyEvents);
      } catch (error) {
        console.error("Error fetching nearby events:", error);
        toast({
          title: "Error loading events",
          description: "Could not load nearby events",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  const formatTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, 'h:mm a');
    } catch (e) {
      return dateString;
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">
          Loading nearby events...
        </p>
      </div>
    );
  }
  
  return (
    <Card className="border border-border/40 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarDays className="h-5 w-5 text-primary" />
          <span>Events Nearby</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3 pt-0">
        {events.length > 0 ? (
          <div className="space-y-3">
            {events.map((event, index) => (
              <motion.div 
                key={event.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <motion.div 
                  className="relative overflow-hidden rounded-lg"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div className="p-3 border hover:border-primary/30 transition-all duration-300 bg-gradient-to-br from-background to-background/80 rounded-lg">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/60" />
                    
                    <div className="flex justify-between items-start mb-1 pl-2">
                      <h3 className="font-medium text-sm">{event.title}</h3>
                      {event.is_public === false && (
                        <div className="ml-2 text-xs px-1.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded-sm">
                          Paid
                        </div>
                      )}
                    </div>
                    
                    {event.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2 pl-2">
                        {event.description}
                      </p>
                    )}
                    
                    <div className="flex justify-between items-center mt-2 pl-2">
                      <div className="space-y-1.5">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1 opacity-70" />
                          <span>{formatDate(event.start_date_time)}</span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1 opacity-70" />
                          <span>{formatTime(event.start_date_time)}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1 opacity-70" />
                            <span className="truncate max-w-[150px]">{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>No events nearby</p>
          </div>
        )}
        
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={() => navigate('/events')}
        >
          View All Events
        </Button>
      </CardContent>
    </Card>
  );
};

export default EventsNearby;
