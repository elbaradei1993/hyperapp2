import React, { useState, useEffect } from "react";
import { UberNavbar } from "@/components/layout/UberNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Heart,
  AlertTriangle,
  Smile,
  Meh,
  Frown,
  Activity,
  Flame
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import HeatMapTab from "@/components/tabs/HeatMapTab";
import { useSearchParams } from "react-router-dom";
import { usePulseMetrics } from "@/hooks/usePulseMetrics";
import CommunitiesInline from "@/components/pulse/CommunitiesInline";
import { CommunityStatsService } from "@/services/CommunityStatsService";

const moodOptions = [
  { id: 'great', label: '😊 Great', icon: Smile, color: 'text-green-500' },
  { id: 'good', label: '🙂 Good', icon: Smile, color: 'text-blue-500' },
  { id: 'okay', label: '😐 Okay', icon: Meh, color: 'text-yellow-500' },
  { id: 'poor', label: '😔 Poor', icon: Frown, color: 'text-red-500' }
];

export const Pulse = () => {
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'pulse';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const { metrics: communityStats, loading: statsLoading, areaLabel } = usePulseMetrics({ radiusKm: 10 });
  const [realCommunityStats, setRealCommunityStats] = useState<any>(null);
  const [loadingRealStats, setLoadingRealStats] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRealStats = async () => {
      try {
        setLoadingRealStats(true);
        const stats = await CommunityStatsService.getCommunityStats();
        setRealCommunityStats(stats);
      } catch (error) {
        console.error('Error fetching real community stats:', error);
      } finally {
        setLoadingRealStats(false);
      }
    };

    fetchRealStats();
  }, []);

  const handleMoodSubmit = async (moodId: string) => {
    try {
      setSelectedMood(moodId);
      toast({
        title: "Mood Recorded",
        description: "Thank you for sharing how you're feeling!"
      });
    } catch (error) {
      console.error('Error submitting mood:', error);
      toast({
        title: "Error",
        description: "Failed to record your mood",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <UberNavbar />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Community Pulse
          </h1>
          <p className="text-muted-foreground text-lg">
            Real-time mood and safety metrics for your neighborhood
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="pulse" className="flex items-center space-x-2">
              <Activity size={16} />
              <span>Pulse</span>
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="flex items-center space-x-2">
              <Flame size={16} />
              <span>Heat Map</span>
            </TabsTrigger>
          </TabsList>

          {/* Pulse Tab */}
          <TabsContent value="pulse" className="space-y-8">
            {/* Mood Check-in */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="text-red-500" size={24} />
                  <span>How are you feeling today?</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedMood ? (
                  <div className="text-center py-6">
                    <div className="text-green-500 mb-4">
                      <Heart size={48} className="mx-auto mb-2" />
                      <p className="text-lg font-medium">Thank you for sharing!</p>
                      <p className="text-muted-foreground">Your mood has been recorded.</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedMood(null)}
                    >
                      Submit Another Response
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {moodOptions.map((mood) => {
                      const Icon = mood.icon;
                      return (
                        <Button
                          key={mood.id}
                          variant="outline"
                          className="h-20 flex flex-col space-y-2 hover:scale-105 transition-transform"
                          onClick={() => handleMoodSubmit(mood.id)}
                        >
                          <span className="text-2xl">{mood.label.split(' ')[0]}</span>
                          <span className="text-sm">{mood.label.split(' ')[1]}</span>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Community Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-500 mb-2">
                    {communityStats.safetyScore}/10
                  </div>
                  <p className="text-muted-foreground">Safety Score</p>
                  <Badge variant="secondary" className="mt-2">Safe</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-500 mb-2">
                    {realCommunityStats?.activeUsersToday || communityStats.activeUsers}
                  </div>
                  <p className="text-muted-foreground">Active Users Today</p>
                  <Badge variant="secondary" className="mt-2">Real Data</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {realCommunityStats?.totalVibeReports || communityStats.totalReports}
                  </div>
                  <p className="text-muted-foreground">Total Vibe Reports</p>
                  <Badge variant="secondary" className="mt-2">All Time</Badge>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Community Stats */}
            {realCommunityStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-500 mb-1">
                      {realCommunityStats.totalCommunities}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Communities</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-500 mb-1">
                      {realCommunityStats.totalMembers}
                    </div>
                    <p className="text-sm text-muted-foreground">Community Members</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-teal-500 mb-1">
                      {realCommunityStats.totalSosAlerts}
                    </div>
                    <p className="text-sm text-muted-foreground">Safety Alerts</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-pink-500 mb-1">
                      {realCommunityStats.averageVibesPerCommunity}
                    </div>
                    <p className="text-sm text-muted-foreground">Avg Vibes/Community</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Most Active Community Highlight */}
            {realCommunityStats?.mostActiveCommnuity && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="text-primary" size={24} />
                    <span>Most Active Community</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-4">
                    <h3 className="text-xl font-bold mb-2">{realCommunityStats.mostActiveCommnuity.name}</h3>
                    <p className="text-muted-foreground">
                      {realCommunityStats.mostActiveCommnuity.memberCount} active members
                    </p>
                    <Badge variant="outline" className="mt-2">
                      Community Leader
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mood Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="text-primary" size={24} />
                  <span>Community Mood Distribution</span>
                  <Badge variant="secondary" className="ml-2">{areaLabel}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moodOptions.map((mood) => {
                    const percentage = communityStats.moodDistribution[mood.id as keyof typeof communityStats.moodDistribution];
                    return (
                      <div key={mood.id} className="flex items-center space-x-4">
                        <div className="w-20 text-sm">
                          {mood.label}
                        </div>
                        <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-full ${mood.color.replace('text-', 'bg-')}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="w-12 text-sm text-muted-foreground">
                          {percentage}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Communities */}
            <CommunitiesInline />
          </TabsContent>

          {/* Heatmap Tab */}
          <TabsContent value="heatmap" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Flame className="text-primary" size={24} />
                  <span>Community Activity Heatmap</span>
                </CardTitle>
                <p className="text-muted-foreground">
                  Visualize vibe density and hotspots across your neighborhood
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div style={{ height: isMobile ? "400px" : "600px" }} className="rounded-lg overflow-hidden">
                  <HeatMapTab />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile spacing */}
      {isMobile && <div className="h-16" />}
    </div>
  );
};

export default Pulse;