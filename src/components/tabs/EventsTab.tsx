
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Plus, Users } from "lucide-react";
import { EventService, EventResponse } from "@/services/EventService";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/AuthProvider";

const EventsTab = () => {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await EventService.getEvents();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast({
          title: t("error"),
          description: "Could not load events",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [toast, t]);

  const handleCreateEvent = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be signed in to create events",
      });
      navigate("/auth");
      return;
    }
    
    navigate("/events/create");
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{t("events")}</h2>
        <Button onClick={handleCreateEvent} size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          {t("createEvent")}
        </Button>
      </div>

      {loading ? (
        // Loading skeletons
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="p-0">
                <Skeleton className="h-40 w-full" />
              </CardHeader>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-grow text-center p-8">
          <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium">No Events Found</h3>
          <p className="text-muted-foreground mb-4">
            Be the first to create an event for the community!
          </p>
          <Button onClick={handleCreateEvent}>
            <Plus className="h-4 w-4 mr-2" />
            {t("createEvent")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-auto pb-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

const EventCard = ({ event }: { event: EventResponse }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "PPP");
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-40 bg-muted/50 flex items-center justify-center">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Calendar className="h-12 w-12 text-muted-foreground" />
        )}
      </div>
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium line-clamp-1">{event.title}</h3>
          <Badge variant="outline">
            {event.current_attendees}/{event.max_attendees || '∞'}
          </Badge>
        </div>
        <div className="flex items-center text-muted-foreground text-sm">
          <Calendar className="h-3 w-3 mr-1" />
          <span className="line-clamp-1">{formatDate(event.start_date_time)}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {event.description}
          </p>
        )}
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{event.location}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button variant="outline" size="sm" className="w-full">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventsTab;
