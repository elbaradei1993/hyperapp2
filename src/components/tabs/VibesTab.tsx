"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ThumbsUp, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VibeService, VibeType, VibeReport } from "@/services/VibeService";
import { useToast } from "@/hooks/use-toast";

const VibesTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [vibeReports, setVibeReports] = useState<VibeReport[]>([]);
  const [vibeTypes, setVibeTypes] = useState<VibeType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [reports, types] = await Promise.all([
          VibeService.getVibeReports(),
          VibeService.getVibeTypes()
        ]);
        
        setVibeReports(reports);
        setVibeTypes(types);
      } catch (error) {
        console.error("Error fetching vibe data:", error);
        toast({
          title: "Error loading vibes",
          description: "Could not load vibe data from the server",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleUpvote = async (id: number) => {
    try {
      await VibeService.upvoteVibe(id);
      
      // Update the local state after successful upvote
      setVibeReports(prevReports => 
        prevReports.map(report => 
          report.id === id 
            ? { ...report, confirmed_count: report.confirmed_count + 1 } 
            : report
        )
      );
      
      toast({
        title: "Vibe upvoted",
        description: "Thank you for confirming this vibe!",
      });
    } catch (error) {
      console.error("Error upvoting vibe:", error);
      toast({
        title: "Error",
        description: "Could not upvote this vibe. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredVibeReports = vibeReports.filter(vibe => 
    (vibe.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     vibe.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getVibeColor = (vibeTypeId: number): string => {
    const vibeType = vibeTypes.find(type => type.id === vibeTypeId);
    return vibeType?.color || "#888888";
  };

  const getVibeName = (vibeTypeId: number): string => {
    const vibeType = vibeTypes.find(type => type.id === vibeTypeId);
    return vibeType?.name || "Unknown";
  };

  const formatTimestamp = (timestamp: string | null): string => {
    if (!timestamp) return "Just now";
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="h-full flex flex-col space-y-4 overflow-hidden">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Search vibes..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-background/50 backdrop-blur-sm border border-white/10"
        />
      </div>
      
      {/* Vibes list */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading vibes...</p>
          </div>
        </div>
      ) : filteredVibeReports.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No vibes found.</p>
            <p className="text-sm text-muted-foreground">Be the first to report a vibe in this area!</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredVibeReports.map((vibe) => (
            <Card key={vibe.id} className="border border-white/10 shadow-md hover:shadow-lg transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <span 
                    className="text-xs px-2 py-1 rounded-full border" 
                    style={{ 
                      backgroundColor: `${vibe.vibe_type ? vibe.vibe_type.color : getVibeColor(vibe.vibe_type_id)}20`,
                      color: vibe.vibe_type ? vibe.vibe_type.color : getVibeColor(vibe.vibe_type_id),
                      borderColor: `${vibe.vibe_type ? vibe.vibe_type.color : getVibeColor(vibe.vibe_type_id)}40`
                    }}
                  >
                    {vibe.vibe_type ? vibe.vibe_type.name : getVibeName(vibe.vibe_type_id)}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTimestamp(vibe.created_at)}
                  </span>
                </div>
                
                <h3 className="font-semibold mb-1">{vibe.title}</h3>
                {vibe.description && (
                  <p className="text-sm text-muted-foreground mb-3">{vibe.description}</p>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {`${parseFloat(vibe.latitude).toFixed(6)}, ${parseFloat(vibe.longitude).toFixed(6)}`}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2"
                      onClick={() => handleUpvote(vibe.id)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      <span className="text-xs">{vibe.confirmed_count}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VibesTab;
