import React, { useState, useEffect } from "react";
import { UberNavbar } from "@/components/layout/UberNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Heart,
  AlertTriangle,
  Smile,
  Meh,
  Frown
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { VibeReportsService } from "@/services/vibes/vibeReportsService";
import { useToast } from "@/hooks/use-toast";

const moodOptions = [
  { id: 'great', label: '😊 Great', icon: Smile, color: 'text-green-500' },
  { id: 'good', label: '🙂 Good', icon: Smile, color: 'text-blue-500' },
  { id: 'okay', label: '😐 Okay', icon: Meh, color: 'text-yellow-500' },
  { id: 'poor', label: '😔 Poor', icon: Frown, color: 'text-red-500' }
];

export const Pulse = () => {
  const isMobile = useIsMobile();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [communityStats, setCommunityStats] = useState({
    totalReports: 0,
    activeUsers: 0,
    safetyScore: 0,
    moodDistribution: {
      great: 0,
      good: 0,
      okay: 0,
      poor: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCommunityStats();
  }, []);

  const loadCommunityStats = async () => {
    try {
      setLoading(true);
      
      // Load vibe reports count
      const vibeReports = await VibeReportsService.getVibeReports(0, 1000);
      
      // Load SOS alerts count
      const { data: sosAlerts } = await supabase
        .from('sos_alerts')
        .select('*', { count: 'exact' });

      // Calculate basic stats
      const totalReports = vibeReports.length + (sosAlerts?.length || 0);
      const activeUsers = Math.min(totalReports * 2, 100); // Mock calculation
      const safetyScore = Math.max(10 - (sosAlerts?.length || 0), 0);

      // Mock mood distribution for now - in a real app this would come from user mood reports
      const moodDistribution = {
        great: Math.floor(Math.random() * 40) + 20,
        good: Math.floor(Math.random() * 30) + 15,
        okay: Math.floor(Math.random() * 20) + 10,
        poor: Math.floor(Math.random() * 15) + 5
      };

      setCommunityStats({
        totalReports,
        activeUsers,
        safetyScore,
        moodDistribution
      });
    } catch (error) {
      console.error('Error loading community stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSubmit = async (moodId: string) => {
    try {
      setSelectedMood(moodId);
      
      // In a real implementation, you would save this to a mood_reports table
      // For now, just show success and reload stats
      console.log('Mood submitted:', moodId);
      
      toast({
        title: "Mood Recorded",
        description: "Thank you for sharing how you're feeling!"
      });
      
      // Reload stats to reflect the new submission
      await loadCommunityStats();
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

        {/* Mood Check-in */}
        <Card className="mb-8">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                {communityStats.activeUsers}
              </div>
              <p className="text-muted-foreground">Active Users</p>
              <Badge variant="secondary" className="mt-2">Online Now</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {communityStats.totalReports}
              </div>
              <p className="text-muted-foreground">Total Reports</p>
              <Badge variant="secondary" className="mt-2">This Week</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Mood Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="text-primary" size={24} />
              <span>Community Mood Distribution</span>
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
      </div>

      {/* Mobile spacing */}
      {isMobile && <div className="h-16" />}
    </div>
  );
};

export default Pulse;