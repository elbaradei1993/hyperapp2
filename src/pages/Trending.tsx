
"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { TrendingUp, MapPin, Clock, ThumbsUp, Filter, ChevronUp, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { safeParseInt, safeToString } from "@/utils/typeConverters";
import { VibeService } from "@/services/VibeService";
import { H1, H2, PageHeader, FadeIn } from "@/components/ui/design-system";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [vibeTypes, setVibeTypes] = useState<{id: number, name: string, color: string}[]>([]);

  useEffect(() => {
    const fetchVibeTypes = async () => {
      try {
        const types = await VibeService.getVibeTypes();
        setVibeTypes(types);
      } catch (error) {
        console.error("Error fetching vibe types:", error);
      }
    };
    
    fetchVibeTypes();
  }, []);

  useEffect(() => {
    const fetchTrendingVibes = async () => {
      try {
        setLoading(true);
        
        let vibeReportsQuery = supabase
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
          .order('confirmed_count', { ascending: false });
        
        if (selectedTab !== "all") {
          vibeReportsQuery = vibeReportsQuery.eq('vibe_type_id', parseInt(selectedTab));
        }
        
        const { data: vibeReports, error } = await vibeReportsQuery.limit(10);
        
        if (error) throw error;
        
        if (vibeReports) {
          // Transform the data for UI display
          const formattedVibes: TrendingVibe[] = vibeReports.map(vibe => {
            // Create a location string from lat/long
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
                down: 0 
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
    
    // Set up realtime subscription
    const subscription = supabase
      .channel('public:vibe_reports')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'vibe_reports' 
      }, (payload) => {
        fetchNewVibe(payload.new.id.toString());
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [toast, selectedTab]);
  
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
      
      // Only add if it matches the current filter
      if (selectedTab === "all" || data.vibe_type_id.toString() === selectedTab) {
        // Add new vibe to the beginning of the array and limit to 10 items
        setTrendingVibes(prev => [newVibe, ...prev.slice(0, 9)]);
        
        toast({
          title: "New trending vibe",
          description: `${newVibe.title} is now trending!`,
        });
      }
    }
  };

  // Function to handle voting
  const handleVote = async (id: string, voteType: 'up' | 'down') => {
    try {
      if (voteType === 'up') {
        // Call the function to increment counter
        await VibeService.upvoteVibe(safeParseInt(id));
        
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

  return (
    <div className="min-h-screen pb-24 md:pb-6 bg-background">
      <div className="container max-w-4xl mx-auto p-4 pt-20">
        <FadeIn>
          <PageHeader>
            <div className="flex items-center space-x-3">
              <div className="bg-primary/20 p-2 rounded-full">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <H1>Trending Vibes</H1>
            </div>
            <p className="text-muted-foreground mt-2">
              Discover what's buzzing in your community right now
            </p>
          </PageHeader>
        </FadeIn>
        
        <FadeIn delay="100ms">
          <Card className="mb-6 overflow-x-auto">
            <CardContent className="p-2">
              <Tabs 
                defaultValue="all" 
                value={selectedTab} 
                onValueChange={setSelectedTab}
                className="w-full"
              >
                <TabsList className="flex w-full gap-1 overflow-x-auto overflow-y-hidden">
                  <TabsTrigger value="all" className="flex-shrink-0">
                    All Vibes
                  </TabsTrigger>
                  {vibeTypes.map((type) => (
                    <TabsTrigger 
                      key={type.id} 
                      value={type.id.toString()}
                      className="flex-shrink-0 flex items-center"
                    >
                      <div 
                        className="w-3 h-3 rounded-full mr-1.5"
                        style={{ backgroundColor: type.color }} 
                      />
                      {type.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </FadeIn>
      
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
            {trendingVibes.map((vibe, index) => (
              <FadeIn key={vibe.id} delay={`${index * 50}ms`}>
                <Card className="border border-white/10 shadow-md hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span 
                        className="text-xs px-2 py-1 rounded-full border flex items-center"
                        style={{
                          backgroundColor: `${vibe.vibe_type.color}20`,
                          color: vibe.vibe_type.color,
                          borderColor: `${vibe.vibe_type.color}40`
                        }}
                      >
                        <Tag className="h-3 w-3 mr-1" />
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
                          className="h-8 px-2 hover:bg-primary/10 text-primary"
                          onClick={() => handleVote(vibe.id, 'up')}
                        >
                          <ChevronUp className="h-4 w-4 mr-1" />
                          <span className="text-xs">Boost</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        ) : (
          <FadeIn>
            <div className="flex flex-col items-center justify-center space-y-4 min-h-[60vh] p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-primary opacity-80" />
              </div>
              <H2 className="text-center">No trending vibes</H2>
              <p className="text-center text-muted-foreground max-w-sm">
                {selectedTab === "all" 
                  ? "There are no trending vibes available at the moment" 
                  : "No vibes of this type are trending right now"}
              </p>
              <Button 
                variant="outline"
                onClick={() => setSelectedTab("all")}
                className="mt-4"
              >
                View All Vibes
              </Button>
            </div>
          </FadeIn>
        )}
      </div>
      
      <Navbar />
    </div>
  );
};

export default Trending;
