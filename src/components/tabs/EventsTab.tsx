
"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Users, Plus, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  attendees: number;
  image?: string;
}

const sampleEvents: Event[] = [
  {
    id: "1",
    title: "Community Cleanup Day",
    description: "Join us to clean up the local park and make our neighborhood beautiful!",
    date: "Apr 28, 2025 • 9:00 AM",
    location: "Central Park",
    attendees: 24,
  },
  {
    id: "2",
    title: "Tech Meetup: AI & Society",
    description: "Discussion about the impacts of AI on our daily lives and future implications.",
    date: "Apr 30, 2025 • 6:30 PM",
    location: "Innovation Hub",
    attendees: 56,
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1470&auto=format&fit=crop"
  },
  {
    id: "3",
    title: "Street Food Festival",
    description: "Experience amazing street food from around the world. Free entry!",
    date: "May 2, 2025 • All Day",
    location: "Downtown Square",
    attendees: 142,
    image: "https://images.unsplash.com/photo-1533777324565-a040eb52facd?q=80&w=1548&auto=format&fit=crop"
  }
];

const EventsTab = () => {
  const [events, setEvents] = useState(sampleEvents);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredEvents = events.filter(
    event => event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEvent = () => {
    toast({
      title: "Create Event",
      description: "This feature will be available when connected to a database.",
    });
  };

  return (
    <div className="h-full flex flex-col space-y-4 overflow-hidden">
      {/* Header with search and filters */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Input 
            placeholder="Search events..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-background/50 backdrop-blur-sm border border-white/10 pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        </div>
        <Button variant="outline" size="icon" className="border border-white/10">
          <Filter className="h-4 w-4" />
        </Button>
        <Button onClick={handleAddEvent} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Create
        </Button>
      </div>
      
      {/* Events list */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="overflow-hidden border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300">
            {event.image && (
              <div className="relative h-40 w-full overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
              </div>
            )}
            <CardContent className={`p-4 ${event.image ? '-mt-10 relative z-10' : ''}`}>
              <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{event.description}</p>
              
              <div className="flex flex-col space-y-2">
                <div className="flex items-center text-xs">
                  <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center text-xs">
                  <MapPin className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center text-xs">
                  <Users className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  <span>{event.attendees} attending</span>
                </div>
              </div>
              
              <Button variant="outline" className="mt-3 w-full border border-white/10 hover:bg-primary/20">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EventsTab;
