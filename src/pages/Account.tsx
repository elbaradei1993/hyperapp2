import React, { useState, useEffect } from "react";
import { UberNavbar } from "@/components/layout/UberNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Settings, 
  Shield,
  MapPin,
  Bell,
  Globe,
  Moon,
  LogOut,
  Edit3,
  Save,
  X
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { format } from "date-fns";

interface UserProfile {
  name: string | null;
  username: string | null;
  email: string | null;
  phone_number: string | null;
  location: string | null;
  profile_picture: string | null;
  settings: any;
  points: number | null;
  reputation: number | null;
}

export const Account = () => {
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          username: profile.username,
          phone_number: profile.phone_number,
          location: profile.location,
          settings: profile.settings
        })
        .eq('id', user?.id);

      if (error) throw error;

      setEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <UberNavbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your account</h1>
          <Button onClick={() => window.location.href = '/auth'}>
            Log In
          </Button>
        </div>
        {isMobile && <div className="h-16" />}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <UberNavbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <div>Loading...</div>
        </div>
        {isMobile && <div className="h-16" />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UberNavbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Account
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your profile and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <User size={20} />
                  <span>Profile Information</span>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editing ? setEditing(false) : setEditing(true)}
                >
                  {editing ? <X size={16} /> : <Edit3 size={16} />}
                  {editing ? 'Cancel' : 'Edit'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile?.name || ''}
                      onChange={(e) => setProfile(prev => prev ? {...prev, name: e.target.value} : null)}
                      disabled={!editing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profile?.username || ''}
                      onChange={(e) => setProfile(prev => prev ? {...prev, username: e.target.value} : null)}
                      disabled={!editing}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile?.email || user?.email || ''}
                    disabled
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile?.phone_number || ''}
                    onChange={(e) => setProfile(prev => prev ? {...prev, phone_number: e.target.value} : null)}
                    disabled={!editing}
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profile?.location || ''}
                    onChange={(e) => setProfile(prev => prev ? {...prev, location: e.target.value} : null)}
                    disabled={!editing}
                    placeholder="City, State"
                  />
                </div>

                {editing && (
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full"
                  >
                    <Save className="mr-2" size={16} />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings size={20} />
                  <span>Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell size={20} />
                    <div>
                      <p className="font-medium">Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive alerts for nearby activities
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={profile?.settings?.notifications || false}
                    onCheckedChange={(checked) => 
                      setProfile(prev => prev ? {
                        ...prev, 
                        settings: {...prev.settings, notifications: checked}
                      } : null)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Moon size={20} />
                    <div>
                      <p className="font-medium">Dark Theme</p>
                      <p className="text-sm text-muted-foreground">
                        Use dark mode interface
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => {
                      const newTheme = checked ? 'dark' : 'light';
                      setTheme(newTheme);
                      // Also update the profile
                      setProfile(prev => prev ? {
                        ...prev, 
                        settings: {...prev.settings, darkTheme: checked}
                      } : null);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <MapPin size={20} />
                    <div>
                      <p className="font-medium">Search Radius</p>
                      <p className="text-sm text-muted-foreground">
                        {profile?.settings?.radius || 10} km
                      </p>
                    </div>
                  </div>
                  <Input
                    type="range"
                    min="1"
                    max="50"
                    value={profile?.settings?.radius || 10}
                    onChange={(e) => 
                      setProfile(prev => prev ? {
                        ...prev, 
                        settings: {...prev.settings, radius: parseInt(e.target.value)}
                      } : null)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield size={20} />
                  <span>Community Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {profile?.points || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Points</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {profile?.reputation || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Reputation</div>
                </div>
                
                <div className="text-center">
                  <Badge variant="secondary">Community Member</Badge>
                </div>
              </CardContent>
            </Card>

            {/* About HyperAPP */}
            <Card>
              <CardHeader>
                <CardTitle>About HyperAPP</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p className="mb-3">
                  HyperAPP is a community-powered platform for real-time safety 
                  and event awareness.
                </p>
                <p className="mb-3">
                  Built for individuals, responders, and organizations, HyperAPP 
                  lets users report local vibes, send SOS alerts, and share public 
                  events — all on a live map interface.
                </p>
                <p>
                  Just like how Uber moves people, HyperAPP keeps communities 
                  informed, safe, and connected — block by block, vibe by vibe.
                </p>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <Button variant="outline" className="w-full" asChild>
                  <a href="/terms">Terms & Conditions</a>
                </Button>
                
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2" size={16} />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile spacing */}
      {isMobile && <div className="h-16" />}
    </div>
  );
};

export default Account;