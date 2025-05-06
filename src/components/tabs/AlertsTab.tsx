
"use client";

import React, { useState, useEffect } from "react";
import { VibeService } from "@/services/vibes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistance } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AlertItem {
  id: string;
  title: string;
  description: string;
  location: string;
  time: string;
  confirmCount: number;
  vibeType: {
    name: string;
    color: string;
  };
}

const AlertsTab = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const rawData = await VibeService.getVibeReports();

        const formattedData = rawData.map(item => ({
          id: item.id.toString(),
          title: item.title,
          description: item.description,
          location: `${item.latitude.substring(0, 6)}, ${item.longitude.substring(0, 6)}`,
          time: formatDistance(new Date(item.created_at), new Date(), { addSuffix: true }),
          confirmCount: item.confirmed_count,
          vibeType: item.vibe_type || { name: "Unknown", color: "#888888" }
        }));
        
        setAlerts(formattedData);
      } catch (error) {
        console.error("Error fetching alerts:", error);
        toast({
          title: "Error loading alerts",
          description: "Could not load alert data from the server",
          variant: "destructive"
        });
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [toast]);

  return (
    <div className="space-y-4 h-full overflow-auto">
      {loading ? (
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading alerts...</span>
        </div>
      ) : alerts.length > 0 ? (
        alerts.map((alert) => (
          <Card key={alert.id} className="border border-border/40">
            <CardHeader>
              <CardTitle className="text-sm font-medium">{alert.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="text-sm text-muted-foreground">
                {alert.description}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: alert.vibeType.color }}
                />
                <span className="text-xs text-muted-foreground">
                  {alert.vibeType.name}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Location: {alert.location} • {alert.time}
              </div>
              <div className="text-xs text-muted-foreground">
                Confirmed by {alert.confirmCount} users
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center text-muted-foreground">
          No alerts found.
        </div>
      )}
    </div>
  );
};

export default AlertsTab;
