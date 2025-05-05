
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VibeService, VibeType, Vibe } from "@/services/VibeService";
import { useToast } from "@/hooks/use-toast";
import { ThumbsUp, MapPin, Clock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TrendingVibesSection = () => {
  const [trendingVibes, setTrendingVibes] = useState<Vibe[]>([]);
  const [vibeTypes, setVibeTypes] = useState<VibeType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [types, trending] = await Promise.all([
          VibeService.getVibeTypes(),
          VibeService.getTrendingVibes(5) // Get top 5 trending vibes
        ]);
        
        setVibeTypes(types);
        setTrendingVibes(trending);
      } catch (error) {
        console.error("Error fetching trending data:", error);
        toast({
          title: "Error loading trending vibes",
          description: "Could not load trending data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
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
  
  const handleConfirmVibe = async (id: number) => {
    try {
      await VibeService.upvoteVibe(id);
      
      // Update local state to reflect the new count
      setTrendingVibes(prevVibes => 
        prevVibes.map(vibe => 
          vibe.id === id 
            ? { ...vibe, confirmed_count: vibe.confirmed_count + 1 } 
            : vibe
        )
      );
      
      toast({
        title: "Vibe confirmed",
        description: "Thanks for confirming this vibe!",
      });
    } catch (error) {
      console.error("Error confirming vibe:", error);
      toast({
        title: "Failed to confirm vibe",
        description: "Could not register your confirmation",
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">
          Loading trending vibes...
        </p>
      </div>
    );
  }
  
  return (
    <Card className="mb-6 border border-border/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ThumbsUp className="h-5 w-5" />
          Trending Vibes
        </CardTitle>
        <CardDescription>See what's happening around you</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Vibe Types Section */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Popular Vibes Categories</h3>
          <div className="flex flex-wrap gap-2">
            {vibeTypes.map(type => (
              <Badge 
                key={type.id}
                className="py-1 px-2"
                style={{ 
                  backgroundColor: `${type.color}20`, 
                  color: type.color,
                  borderColor: `${type.color}40` 
                }}
                variant="outline"
              >
                {type.name}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Trending Vibes List */}
        <div>
          <h3 className="text-sm font-medium mb-2">Top Vibes</h3>
          
          {trendingVibes.length > 0 ? (
            <div className="space-y-3">
              {trendingVibes.map(vibe => (
                <div key={vibe.id} className="p-3 border rounded-md">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-sm">{vibe.title || "Untitled Vibe"}</h3>
                    <Badge 
                      variant="outline"
                      className="text-xs px-2"
                      style={{ 
                        backgroundColor: `${vibe.vibe_type.color}20`,
                        color: vibe.vibe_type.color,
                        borderColor: `${vibe.vibe_type.color}40` 
                      }}
                    >
                      {vibe.vibe_type.name}
                    </Badge>
                  </div>
                  
                  {vibe.description && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {vibe.description}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(vibe.created_at)}
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-7 px-2 flex items-center gap-1 text-xs"
                      onClick={() => handleConfirmVibe(vibe.id)}
                    >
                      <ThumbsUp className="h-3 w-3" />
                      {vibe.confirmed_count}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>No trending vibes yet</p>
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4"
            onClick={() => navigate('/trending')}
          >
            View All Trending Vibes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendingVibesSection;
