import React, { useState, useEffect } from "react";
import { UberNavbar } from "@/components/layout/UberNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  AlertTriangle, 
  Calendar,
  MapPin,
  Clock,
  Eye,
  CheckCircle
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface ActivityItem {
  id: string;
  type: 'vibe' | 'sos' | 'event';
  title: string;
  description?: string;
  created_at: string;
  status?: string;
  latitude: string;
  longitude: string;
  confirmed_count?: number;
}

export const Activity = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserActivities();
    }
  }, [user]);

  const fetchUserActivities = async () => {
    try {
      setLoading(true);
      
      // Get user mapping for integer IDs
      const { data: userMapping } = await supabase
        .from('user_mapping')
        .select('integer_id')
        .eq('uuid_id', user?.id)
        .single();

      // Fetch user's vibe reports using integer ID
      const { data: vibeReports } = await supabase
        .from('vibe_reports')
        .select(`
          id,
          title,
          description,
          created_at,
          latitude,
          longitude,
          confirmed_count,
          vibe_type:vibe_type_id (
            name,
            color
          )
        `)
        .eq('user_id', userMapping?.integer_id || 0)
        .order('created_at', { ascending: false });

      // Fetch user's SOS alerts
      const { data: sosAlerts } = await supabase
        .from('sos_alerts')
        .select('id, type, created_at, latitude, longitude, status')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      // Fetch user's events using the same integer ID
      const { data: events } = await supabase
        .from('events')
        .select('id, title, description, created_at, latitude, longitude, address')
        .eq('organizer_id', userMapping?.integer_id || 0)
        .order('created_at', { ascending: false });

      // Combine and format activities
      const allActivities: ActivityItem[] = [
        ...(vibeReports || []).map(vibe => ({
          id: vibe.id.toString(),
          type: 'vibe' as const,
          title: vibe.title || `${vibe.vibe_type?.name || 'Unknown'} Report`,
          description: vibe.description,
          created_at: vibe.created_at,
          latitude: vibe.latitude,
          longitude: vibe.longitude,
          confirmed_count: vibe.confirmed_count
        })),
        ...(sosAlerts || []).map(sos => ({
          id: sos.id,
          type: 'sos' as const,
          title: `SOS Alert - ${sos.type}`,
          description: `Emergency alert sent`,
          created_at: sos.created_at,
          status: sos.status,
          latitude: sos.latitude,
          longitude: sos.longitude
        })),
        ...(events || []).map(event => ({
          id: event.id.toString(),
          type: 'event' as const,
          title: event.title,
          description: event.description,
          created_at: event.created_at,
          latitude: event.latitude,
          longitude: event.longitude
        }))
      ];

      // Sort by date
      allActivities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setActivities(allActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'vibe':
        return MessageSquare;
      case 'sos':
        return AlertTriangle;
      case 'event':
        return Calendar;
      default:
        return MessageSquare;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'vibe':
        return 'text-blue-500';
      case 'sos':
        return 'text-red-500';
      case 'event':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusBadge = (activity: ActivityItem) => {
    if (activity.type === 'sos') {
      return (
        <Badge variant={activity.status === 'active' ? 'destructive' : 'default'}>
          {activity.status}
        </Badge>
      );
    }
    
    if (activity.type === 'vibe' && activity.confirmed_count !== undefined) {
      return (
        <Badge variant="secondary">
          <CheckCircle className="mr-1" size={12} />
          {activity.confirmed_count} confirms
        </Badge>
      );
    }
    
    return null;
  };

  const viewOnMap = (activity: ActivityItem) => {
    // Store location in sessionStorage for map to use
    sessionStorage.setItem('mapLocation', JSON.stringify({ 
      lat: parseFloat(activity.latitude), 
      lng: parseFloat(activity.longitude), 
      zoom: 16 
    }));
    
    // Navigate to Pulse page with map tab
    window.location.href = '/pulse?tab=map';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <UberNavbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your activity</h1>
          <Button onClick={() => window.location.href = '/auth'}>
            Log In
          </Button>
        </div>
        {isMobile && <div className="h-16" />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UberNavbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Your Activity
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your contributions to the community
          </p>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <MessageSquare className="mx-auto mb-2 text-blue-500" size={24} />
              <div className="text-2xl font-bold">
                {activities.filter(a => a.type === 'vibe').length}
              </div>
              <div className="text-sm text-muted-foreground">Vibes Reported</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="mx-auto mb-2 text-red-500" size={24} />
              <div className="text-2xl font-bold">
                {activities.filter(a => a.type === 'sos').length}
              </div>
              <div className="text-sm text-muted-foreground">SOS Alerts</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="mx-auto mb-2 text-green-500" size={24} />
              <div className="text-2xl font-bold">
                {activities.filter(a => a.type === 'event').length}
              </div>
              <div className="text-sm text-muted-foreground">Events Created</div>
            </CardContent>
          </Card>
        </div>

        {/* Activity List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No activity yet. Start by reporting a vibe or creating an event!
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  const iconColor = getActivityColor(activity.type);
                  
                  return (
                    <div
                      key={`${activity.type}-${activity.id}`}
                      className="flex items-start space-x-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className={`p-2 rounded-full bg-muted ${iconColor}`}>
                        <Icon size={20} />
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{activity.title}</h3>
                          {getStatusBadge(activity)}
                        </div>
                        
                        {activity.description && (
                          <p className="text-muted-foreground text-sm">
                            {activity.description}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock size={12} />
                            <span>{format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewOnMap(activity)}
                      >
                        <MapPin className="mr-1" size={14} />
                        <Eye className="mr-1" size={14} />
                        View
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mobile spacing */}
      {isMobile && <div className="h-16" />}
    </div>
  );
};

export default Activity;