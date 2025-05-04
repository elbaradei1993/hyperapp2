
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Map, AlertTriangle, Vibrate, AlertOctagon, BadgeInfo, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Alert {
  id: string;
  type: string;
  title: string;
  description: string;
  distance?: string;
  created_at: string;
  read: boolean;
  latitude?: string;
  longitude?: string;
  status?: string;
}

const AlertsTab = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Get user location first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }

    // Load user notification preferences
    const loadNotificationPreferences = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('settings')
            .eq('id', session.user.id)
            .single();
            
          if (error) throw error;
          
          if (data?.settings && typeof data.settings === 'object') {
            const settings = data.settings as any;
            if (typeof settings.notifications === 'boolean') {
              setNotificationsEnabled(settings.notifications);
            }
          }
        }
      } catch (error) {
        console.error("Error loading notification preferences:", error);
      }
    };

    loadNotificationPreferences();
    fetchAlerts();
    
    // Set up real-time subscription for new alerts
    const channel = supabase
      .channel('public:sos_alerts')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'sos_alerts' 
      }, (payload) => {
        handleNewAlert(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      // Fetch SOS alerts
      const { data: sosData, error: sosError } = await supabase
        .from('sos_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (sosError) throw sosError;

      // Convert SOS alerts to our Alert format
      const formattedAlerts = (sosData || []).map(sos => {
        // Calculate time ago
        const timeAgo = getTimeAgo(new Date(sos.created_at));
        
        // Calculate distance if user location is available
        let distance = undefined;
        if (userLocation && sos.latitude && sos.longitude) {
          const alertLat = parseFloat(sos.latitude);
          const alertLng = parseFloat(sos.longitude);
          const distanceKm = calculateDistance(
            userLocation.lat, userLocation.lng, 
            alertLat, alertLng
          );
          distance = `${distanceKm.toFixed(1)}km away`;
        }

        return {
          id: sos.id,
          type: sos.type === 'emergency' ? 'sos' : sos.type,
          title: `${sos.type === 'emergency' ? 'SOS Alert' : 'Alert'} Nearby`,
          description: `An emergency alert has been activated ${distance ? `${distance}` : 'in your area'}. Please be cautious.`,
          distance,
          created_at: sos.created_at,
          read: sos.resolved_at !== null,
          latitude: sos.latitude,
          longitude: sos.longitude,
          status: sos.status
        };
      });

      setAlerts(formattedAlerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      toast({
        title: "Failed to load alerts",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewAlert = (newAlert: any) => {
    if (notificationsEnabled) {
      toast({
        title: "New Emergency Alert",
        description: "Someone needs help in your area",
        variant: "destructive",
      });

      // Add the new alert to the list
      const timeAgo = getTimeAgo(new Date(newAlert.created_at));
      
      // Calculate distance if user location is available
      let distance = undefined;
      if (userLocation && newAlert.latitude && newAlert.longitude) {
        const alertLat = parseFloat(newAlert.latitude);
        const alertLng = parseFloat(newAlert.longitude);
        const distanceKm = calculateDistance(
          userLocation.lat, userLocation.lng, 
          alertLat, alertLng
        );
        distance = `${distanceKm.toFixed(1)}km away`;
      }
      
      const formattedAlert: Alert = {
        id: newAlert.id,
        type: newAlert.type === 'emergency' ? 'sos' : newAlert.type,
        title: `${newAlert.type === 'emergency' ? 'SOS Alert' : 'Alert'} Nearby`,
        description: `An emergency alert has been activated ${distance ? `${distance}` : 'in your area'}. Please be cautious.`,
        distance,
        created_at: newAlert.created_at,
        read: false,
        latitude: newAlert.latitude,
        longitude: newAlert.longitude,
        status: newAlert.status
      };

      setAlerts(prevAlerts => [formattedAlert, ...prevAlerts]);
    }
  };

  // Calculate distance between two coordinates in kilometers
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180);
  };

  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    
    if (seconds < 10) return "Just now";
    
    return Math.floor(seconds) + " seconds ago";
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "sos": return <AlertOctagon className="h-6 w-6 text-red-500" />;
      case "danger": return <AlertTriangle className="h-6 w-6 text-orange-500" />;
      case "notice": return <BadgeInfo className="h-6 w-6 text-blue-500" />;
      case "update": return <Vibrate className="h-6 w-6 text-green-500" />;
      default: return <Bell className="h-6 w-6" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "sos": return "bg-red-500/10 border-red-500/20";
      case "danger": return "bg-orange-500/10 border-orange-500/20";
      case "notice": return "bg-blue-500/10 border-blue-500/20";
      case "update": return "bg-green-500/10 border-green-500/20";
      default: return "bg-gray-500/10 border-gray-500/20";
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      // In a real app, we would update the read status in the database
      setAlerts(alerts.map(alert => ({ ...alert, read: true })));
      
      toast({
        title: "Notifications",
        description: "All alerts marked as read",
      });
    } catch (error) {
      console.error("Error marking alerts as read:", error);
    }
  };

  const toggleNotifications = async () => {
    try {
      const newValue = !notificationsEnabled;
      setNotificationsEnabled(newValue);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Get current settings
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('settings')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) throw profileError;
        
        // Update settings with new notification preference
        const currentSettings = profileData?.settings || {};
        const updatedSettings = { 
          ...currentSettings, 
          notifications: newValue 
        };
        
        // Save to Supabase
        const { error } = await supabase
          .from('profiles')
          .update({ settings: updatedSettings })
          .eq('id', session.user.id);
        
        if (error) throw error;
      }
      
      toast({
        title: notificationsEnabled ? "Notifications disabled" : "Notifications enabled",
        description: notificationsEnabled ? "You won't receive new alerts" : "You'll receive alerts in real-time",
      });
    } catch (error) {
      console.error("Error toggling notifications:", error);
      // Revert the UI state if the update failed
      setNotificationsEnabled(!notificationsEnabled);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4 overflow-hidden">
      {/* Header with controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Alerts</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="notifications" className="text-sm">
              {notificationsEnabled ? "On" : "Off"}
            </Label>
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={toggleNotifications}
            />
          </div>
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <Check className="h-4 w-4 mr-1" />
            Read All
          </Button>
        </div>
      </div>
      
      {/* Alerts list */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Loading alerts...</p>
          </div>
        ) : alerts.length > 0 ? (
          alerts.map((alert) => (
            <Card 
              key={alert.id} 
              className={`overflow-hidden border transition-all duration-200 ${
                alert.read ? 'border-white/5' : 'border-white/20 shadow-lg'
              } ${getAlertColor(alert.type)}`}
            >
              <CardContent className="p-4 flex">
                <div className="mr-4 mt-1">
                  {getAlertIcon(alert.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-semibold ${!alert.read ? 'text-white' : 'text-muted-foreground'}`}>
                      {alert.title}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {getTimeAgo(new Date(alert.created_at))}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                  
                  {alert.distance && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Map className="h-3 w-3 mr-1" />
                      <span>{alert.distance}</span>
                    </div>
                  )}
                  
                  {alert.type === "sos" && (
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="mt-2 text-xs h-8"
                    >
                      View SOS Location
                    </Button>
                  )}
                </div>

                {!alert.read && (
                  <div className="ml-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <Bell className="h-12 w-12 text-muted-foreground mb-2 opacity-20" />
            <p className="text-muted-foreground">No alerts at this time</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsTab;
