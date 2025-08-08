import React, { useState, useEffect } from "react";
import { UberNavbar } from "@/components/layout/UberNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Activity, 
  AlertTriangle,
  Calendar,
  Users,
  Clock,
  Navigation
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { VibeReportsService } from "@/services/vibes/vibeReportsService";
import { EventService } from "@/services/EventService";
import { supabase } from "@/integrations/supabase/client";

interface NearbyActivity {
  id: string;
  type: 'vibe' | 'sos' | 'event' | 'user';
  title: string;
  description?: string;
  distance: number;
  timestamp: string;
  location: string;
  priority?: 'low' | 'medium' | 'high';
  vibe_type?: {
    name: string;
    color: string;
  };
}

export const Explore = () => {
  const isMobile = useIsMobile();
  const [activities, setActivities] = useState<NearbyActivity[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const [vibeReports, events, sosAlerts] = await Promise.all([
        VibeReportsService.getVibeReports(0, 50),
        EventService.getEvents(50),
        loadSOSAlerts()
      ]);

      const allActivities: NearbyActivity[] = [
        ...vibeReports.map(vibe => ({
          id: vibe.id.toString(),
          type: 'vibe' as const,
          title: vibe.title || `${vibe.vibe_type?.name || 'Unknown'} Report`,
          description: vibe.description || undefined,
          distance: Math.random() * 5, // Mock distance for now
          timestamp: new Date(vibe.created_at).toLocaleString(),
          location: `${parseFloat(vibe.latitude).toFixed(4)}, ${parseFloat(vibe.longitude).toFixed(4)}`,
          vibe_type: vibe.vibe_type
        })),
        ...events.map(event => ({
          id: event.id,
          type: 'event' as const,
          title: event.title,
          description: event.description || undefined,
          distance: Math.random() * 5, // Mock distance for now
          timestamp: new Date(event.start_date_time).toLocaleString(),
          location: event.location || event.address || 'Unknown location'
        })),
        ...sosAlerts.map(sos => ({
          id: sos.id,
          type: 'sos' as const,
          title: `SOS Alert - ${sos.type}`,
          description: undefined,
          distance: Math.random() * 5, // Mock distance for now
          timestamp: new Date(sos.created_at).toLocaleString(),
          location: `${parseFloat(sos.latitude).toFixed(4)}, ${parseFloat(sos.longitude).toFixed(4)}`,
          priority: 'high' as const
        }))
      ];

      setActivities(allActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
    } catch (error) {
      console.error('Error loading activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSOSAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('sos_alerts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading SOS alerts:', error);
      return [];
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'vibe': return Activity;
      case 'sos': return AlertTriangle;
      case 'event': return Calendar;
      case 'user': return Users;
      default: return MapPin;
    }
  };

  const getActivityColor = (type: string, priority?: string) => {
    if (type === 'sos' || priority === 'high') return 'text-red-500';
    if (priority === 'medium') return 'text-yellow-500';
    if (type === 'event') return 'text-green-500';
    if (type === 'user') return 'text-blue-500';
    return 'text-primary';
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    
    const variants = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary'
    } as const;
    
    return (
      <Badge variant={variants[priority]}>
        {priority}
      </Badge>
    );
  };

  const filteredActivities = activities.filter(activity => 
    selectedFilter === 'all' || activity.type === selectedFilter
  );

  const filters = [
    { id: 'all', label: 'All', count: activities.length },
    { id: 'vibe', label: 'Vibes', count: activities.filter(a => a.type === 'vibe').length },
    { id: 'sos', label: 'SOS', count: activities.filter(a => a.type === 'sos').length },
    { id: 'event', label: 'Events', count: activities.filter(a => a.type === 'event').length },
    { id: 'user', label: 'Users', count: activities.filter(a => a.type === 'user').length }
  ];

  return (
    <div className="min-h-screen bg-background">
      <UberNavbar />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Explore Nearby
          </h1>
          <p className="text-muted-foreground text-lg">
            Live feed of activities and alerts in your area
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={selectedFilter === filter.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter(filter.id)}
              className="flex items-center space-x-2"
            >
              <span>{filter.label}</span>
              <Badge variant="secondary" className="ml-1">
                {filter.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Activities List */}
        <div className="space-y-4">
          {filteredActivities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const iconColor = getActivityColor(activity.type, activity.priority);
            
            return (
              <Card key={activity.id} className="feature-card group">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-full bg-muted ${iconColor}`}>
                      <Icon size={20} />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{activity.title}</h3>
                          {activity.description && (
                            <p className="text-muted-foreground text-sm">
                              {activity.description}
                            </p>
                          )}
                        </div>
                        {getPriorityBadge(activity.priority)}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <MapPin size={12} />
                          <span>{activity.distance}km away</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Clock size={12} />
                          <span>{activity.timestamp}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Navigation size={12} />
                          <span>{activity.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Navigate to map with location
                        const lat = activity.type === 'vibe' || activity.type === 'sos' 
                          ? parseFloat(activity.location.split(',')[0]) 
                          : null;
                        const lng = activity.type === 'vibe' || activity.type === 'sos'
                          ? parseFloat(activity.location.split(',')[1])
                          : null;
                        
                        if (lat && lng) {
                          // Store location in sessionStorage for map to use
                          sessionStorage.setItem('mapLocation', JSON.stringify({ lat, lng, zoom: 16 }));
                          window.location.href = '/pulse?tab=heatmap';
                        } else {
                          window.location.href = '/pulse?tab=heatmap';
                        }
                      }}
                    >
                      <MapPin className="mr-1" size={14} />
                      View Heatmap
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {!loading && filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="mx-auto mb-4 text-muted-foreground" size={48} />
            <h3 className="text-lg font-medium mb-2">No activities found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or check back later
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading activities...</p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {activities.filter(a => a.type === 'vibe').length}
              </div>
              <div className="text-xs text-muted-foreground">Active Vibes</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-500 mb-1">
                {activities.filter(a => a.type === 'sos').length}
              </div>
              <div className="text-xs text-muted-foreground">SOS Alerts</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500 mb-1">
                {activities.filter(a => a.type === 'event').length}
              </div>
              <div className="text-xs text-muted-foreground">Live Events</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500 mb-1">
                {activities.filter(a => a.type === 'user').length * 3}
              </div>
              <div className="text-xs text-muted-foreground">Users Online</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile spacing */}
      {isMobile && <div className="h-16" />}
    </div>
  );
};

export default Explore;