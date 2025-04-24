
"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, SkullIcon, Map, AlertTriangle, Vibrate, AlertOctagon, BadgeInfo, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Alert {
  id: string;
  type: "sos" | "danger" | "notice" | "update";
  title: string;
  description: string;
  distance: string;
  time: string;
  read: boolean;
}

const sampleAlerts: Alert[] = [
  {
    id: "1",
    type: "sos",
    title: "SOS Alert Nearby",
    description: "Someone has triggered an SOS alert in your vicinity. Please be cautious.",
    distance: "500m away",
    time: "Just now",
    read: false,
  },
  {
    id: "2",
    type: "danger",
    title: "Dangerous Area Reported",
    description: "Recent reports indicate unsafe conditions near Broadway St. due to ongoing protests.",
    distance: "1.2km away",
    time: "10 minutes ago",
    read: false,
  },
  {
    id: "3",
    type: "notice",
    title: "New Vibe Report",
    description: "A calm area has been reported near your favorite coffee shop.",
    distance: "350m away",
    time: "30 minutes ago",
    read: true,
  },
  {
    id: "4",
    type: "update",
    title: "System Update",
    description: "New features have been added to HypperApp. Tap to learn more.",
    distance: "",
    time: "1 hour ago",
    read: true,
  },
];

const AlertsTab = () => {
  const [alerts, setAlerts] = useState(sampleAlerts);
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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

  const markAllAsRead = () => {
    setAlerts(alerts.map(alert => ({ ...alert, read: true })));
    toast({
      title: "Notifications",
      description: "All alerts marked as read",
    });
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast({
      title: notificationsEnabled ? "Notifications disabled" : "Notifications enabled",
      description: notificationsEnabled ? "You won't receive new alerts" : "You'll receive alerts in real-time",
    });
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
        {alerts.map((alert) => (
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
                  <span className="text-xs text-muted-foreground">{alert.time}</span>
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
        ))}
      </div>
    </div>
  );
};

export default AlertsTab;
