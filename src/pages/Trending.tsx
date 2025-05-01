
"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { TrendingUp, MapPin, Clock, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { safeParseInt, safeToString } from "@/utils/typeConverters";

interface TrendingVibe {
  id: string;
  title: string;
  description: string;
  location: string;
  created_at: string;
  vibe_type: {
    name: string;
    color: string;
  };
  votes: {
    up: number;
    down: number;
  };
}

const Trending = () => {
  const { toast } = useToast();
  const [trendingVibes, setTrendingVibes] = useState<TrendingVibe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingVibes = async () => {
      try {
        setLoading(true);
        
        // Fetch vibe reports and join with vibe types
        const { data: vibeReports, error } = await supabase
          .from('vibe_reports')
          .select(`
            id,
            title,
            description,
            latitude,
            longitude,
            created_at,
            confirmed_count,
            vibe_type: vibe_type_id (
              name,
              color
            )
          `)
          .order('confirmed_count', { ascending: false })
          .limit(10);
        
        if (error) throw error;
        
        if (vibeReports) {
          // Transform the data for UI display
          const formattedVibes: TrendingVibe[] = vibeReports.map(vibe => {
            // Create a location string from lat/long
            // In a real app, you'd reverse geocode this
            const location = `${vibe.latitude.substring(0, 6)}, ${vibe.longitude.substring(0, 6)}`;
            
            // Format relative time
            const timeAgo = getTimeAgo(new Date(vibe.created_at));
            
            return {
              id: vibe.id.toString(),
              title: vibe.title || "Untitled Vibe",
              description: vibe.description || "No description provided",
              location: location,
              created_at: timeAgo,
              vibe_type: {
                name: vibe.vibe_type?.name || "Unknown",
                color: vibe.vibe_type?.color || "#888888"
              },
              votes: {
                up: vibe.confirmed_count || 0,
                down: 0 // Assuming downvotes aren't tracked in the current schema
              }
            };
          });
          
          setTrendingVibes(formattedVibes);
        }
      } catch (error) {
        console.error("Error fetching trending vibes:", error);
        toast({
          title: "Failed to load trending vibes",
          description: "Please check your connection and try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrendingVibes();
    
    // Set up realtime subscription for new trending vibes
    const subscription = supabase
      .channel('public:vibe_reports')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'vibe_reports' 
      }, (payload) => {
        // Fetch the complete data for the new vibe with joins
        fetchNewVibe(payload.new.id.toString());
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [toast]);
  
  const fetchNewVibe = async (id: string) => {
    const { data, error } = await supabase
      .from('vibe_reports')
      .select(`
        id,
        title,
        description,
        latitude,
        longitude,
        created_at,
        confirmed_count,
        vibe_type: vibe_type_id (
          name,
          color
        )
      `)
      .eq('id', safeParseInt(id))
      .single();
    
    if (error) {
      console.error("Error fetching new vibe:", error);
      return;
    }
    
    if (data) {
      const newVibe: TrendingVibe = {
        id: safeToString(data.id),
        title: data.title || "Untitled Vibe",
        description: data.description || "No description provided",
        location: `${data.latitude.substring(0, 6)}, ${data.longitude.substring(0, 6)}`,
        created_at: getTimeAgo(new Date(data.created_at)),
        vibe_type: {
          name: data.vibe_type?.name || "Unknown",
          color: data.vibe_type?.color || "#888888"
        },
        votes: {
          up: data.confirmed_count || 0,
          down: 0
        }
      };
      
      // Add new vibe to the beginning of the array and limit to 10 items
      setTrendingVibes(prev => [newVibe, ...prev.slice(0, 9)]);
      
      toast({
        title: "New trending vibe",
        description: `${newVibe.title} is now trending!`,
      });
    }
  };

  // Function to handle voting
  const handleVote = async (id: string, voteType: 'up' | 'down') => {
    try {
      if (voteType === 'up') {
        // Call the Edge Function to increment counter
        const { data, error } = await supabase.functions.invoke('increment-counter', {
          body: { 
            row_id: safeParseInt(id), 
            table_name: 'vibe_reports', 
            column_name: 'confirmed_count', 
            increment_amount: 1 
          }
        });
        
        if (error) {
          console.error("Error with edge function:", error);
          
          // Fallback direct update if edge function fails
          // First get the current value
          const { data: currentVibe } = await supabase
            .from('vibe_reports')
            .select('confirmed_count')
            .eq('id', safeParseInt(id))
            .single();
            
          if (currentVibe) {
            // Then update with the new value
            await supabase
              .from('vibe_reports')
              .update({ 
                confirmed_count: (currentVibe.confirmed_count || 0) + 1 
              })
              .eq('id', safeParseInt(id));
          }
        }
        
        // Update local state optimistically
        setTrendingVibes(prev => 
          prev.map(vibe => 
            vibe.id === id 
              ? { ...vibe, votes: { ...vibe.votes, up: vibe.votes.up + 1 } }
              : vibe
          )
        );
        
        toast({
          title: "Vote recorded",
          description: "Thanks for your input!",
        });
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Failed to record vote",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  // Helper function to format time ago
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
    
    return "just now";
  };

  // Function to get vibe color based on type
  const getVibeColor = (color: string) => {
    return {
      backgroundColor: `${color}20`,
      color: color,
      borderColor: `${color}40`
    };
  };

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen pb-16">
      <h1 className="text-3xl font-bold mb-6">Trending Vibes</h1>
      
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border border-white/10 shadow-md">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-5 w-3/4 mb-1" />
                <Skeleton className="h-4 w-full mb-3" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-1/3" />
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : trendingVibes.length > 0 ? (
        <div className="space-y-4 animate-fade-in">
          {trendingVibes.map((vibe) => (
            <Card key={vibe.id} className="border border-white/10 shadow-md hover:shadow-lg transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <span 
                    className="text-xs px-2 py-1 rounded-full border"
                    style={getVibeColor(vibe.vibe_type.color)}
                  >
                    {vibe.vibe_type.name}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {vibe.created_at}
                  </span>
                </div>
                
                <h3 className="font-semibold mb-1">{vibe.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{vibe.description}</p>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {vibe.location}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900 dark:hover:text-green-300"
                      onClick={() => handleVote(vibe.id, 'up')}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      <span className="text-xs">{vibe.votes.up}</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900 dark:hover:text-red-300"
                      onClick={() => handleVote(vibe.id, 'down')}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      <span className="text-xs">{vibe.votes.down}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4 min-h-[60vh]">
          <TrendingUp className="w-16 h-16 text-primary opacity-30 animate-pulse" />
          <p className="text-lg text-center text-muted-foreground">
            No trending vibes available at the moment
          </p>
          <Button onClick={() => window.location.href = "/"}>
            Go to Map
          </Button>
        </div>
      )}
      
      <Navbar />
    </div>
  );
};

export default Trending;
