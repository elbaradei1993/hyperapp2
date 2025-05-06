
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VibeService, VibeType, Vibe } from "@/services/vibes";
import { useToast } from "@/hooks/use-toast";
import { ThumbsUp, Loader2, Heart, Star, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const TrendingVibesSection = () => {
  const [trendingVibes, setTrendingVibes] = useState<Vibe[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const trending = await VibeService.getTrendingVibes(5); // Get top 5 trending vibes
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

  // Helper function to check if vibe is LGBTQIA+ friendly
  const isLGBTQIAFriendly = (vibeName: string | undefined): boolean => {
    return vibeName?.toLowerCase().includes('lgbtq') || false;
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">
          Loading trending vibes...
        </p>
      </div>
    );
  }
  
  return (
    <Card className="border border-border/40 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <span>Trending Vibes</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3 pt-0">
        {trendingVibes.length > 0 ? (
          <div className="space-y-3">
            {trendingVibes.map((vibe, index) => {
              const isLGBTQ = isLGBTQIAFriendly(vibe.vibe_type?.name);
              
              return (
                <motion.div 
                  key={vibe.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <motion.div 
                    className="relative overflow-hidden rounded-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {/* Colorful background with interactive UI */}
                    <div 
                      className="p-3 border border-transparent transition-all duration-300 bg-gradient-to-br from-background to-background/80"
                      style={{ 
                        boxShadow: `0 4px 12px ${vibe.vibe_type?.color || '#888'}15`
                      }}
                    >
                      {/* Decorative colorful edge */}
                      {isLGBTQ ? (
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500" />
                      ) : (
                        <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: vibe.vibe_type?.color || '#888' }}/>
                      )}
                      
                      <div className="flex justify-between items-start mb-1 pl-2">
                        <div className="flex items-center">
                          <h3 className="font-medium text-sm">{vibe.title || "Untitled Vibe"}</h3>
                          {index === 0 && (
                            <div className="ml-2 flex items-center">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {vibe.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2 pl-2">
                          {vibe.description}
                        </p>
                      )}
                      
                      <div className="flex justify-between items-center mt-2 pl-2">
                        <div className="text-xs text-muted-foreground flex items-center">
                          {/* Circular vibe type indicator */}
                          {isLGBTQ ? (
                            <div className="w-2 h-2 rounded-full mr-2 bg-gradient-to-r from-red-500 via-yellow-300 via-green-500 via-blue-500 to-purple-500" />
                          ) : (
                            <div 
                              className="w-2 h-2 rounded-full mr-2"
                              style={{ backgroundColor: vibe.vibe_type?.color || '#888' }}
                            />
                          )}
                          <span className="text-xs opacity-70">
                            {formatTimestamp(vibe.created_at)}
                          </span>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-7 px-2 flex items-center gap-1 text-xs hover:bg-background"
                          onClick={() => handleConfirmVibe(vibe.id)}
                        >
                          <ThumbsUp className="h-3 w-3" />
                          <span>{vibe.confirmed_count}</span>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>No trending vibes available</p>
          </div>
        )}
        
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={() => navigate('/trending')}
        >
          View All Trending Vibes
        </Button>
      </CardContent>
    </Card>
  );
};

export default TrendingVibesSection;
