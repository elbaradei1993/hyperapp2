import React, { useState, useEffect } from "react";
import { UberNavbar } from "@/components/layout/UberNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users,
  Plus,
  Search
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  maxAttendees?: number;
  type: 'community' | 'safety' | 'social';
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Community Safety Meeting',
    description: 'Monthly neighborhood safety discussion and planning session',
    date: '2024-01-20',
    time: '7:00 PM',
    location: 'Community Center, Main St',
    attendees: 23,
    maxAttendees: 50,
    type: 'safety'
  },
  {
    id: '2',
    title: 'Block Party',
    description: 'Annual summer block party with food, music, and activities',
    date: '2024-01-22',
    time: '2:00 PM',
    location: 'Maple Avenue Block',
    attendees: 47,
    maxAttendees: 100,
    type: 'social'
  },
  {
    id: '3',
    title: 'Emergency Preparedness Workshop',
    description: 'Learn essential emergency response techniques and planning',
    date: '2024-01-25',
    time: '6:00 PM',
    location: 'Fire Station 12',
    attendees: 12,
    maxAttendees: 30,
    type: 'safety'
  }
];

export const Events = () => {
  const isMobile = useIsMobile();
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'safety': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'social': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'community': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <UberNavbar />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Community Events
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover and create events that bring your neighborhood together
          </p>
        </div>

        {/* Search and Create */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="mr-2" size={16} />
            Create Event
          </Button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="feature-card group">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <Badge className={getTypeColor(event.type)}>
                    {event.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  {event.description}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-muted-foreground" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock size={16} className="text-muted-foreground" />
                    <span>{event.time}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} className="text-muted-foreground" />
                    <span>{event.location}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Users size={16} className="text-muted-foreground" />
                    <span>
                      {event.attendees} attendees
                      {event.maxAttendees && ` / ${event.maxAttendees} max`}
                    </span>
                  </div>
                </div>
                
                <Button className="w-full" variant="outline">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto mb-4 text-muted-foreground" size={48} />
            <h3 className="text-lg font-medium mb-2">No events found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Be the first to create an event!'}
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2" size={16} />
              Create Event
            </Button>
          </div>
        )}
      </div>

      {/* Mobile spacing */}
      {isMobile && <div className="h-16" />}
    </div>
  );
};

export default Events;