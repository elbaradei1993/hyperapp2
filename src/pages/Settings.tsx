
"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Save, 
  Moon, 
  Sun, 
  Monitor, 
  Vibrate, 
  MapPin, 
  Bell, 
  UserRound, 
  Lock, 
  Phone, 
  UserRoundPlus,
  Trash2, 
  RefreshCw,
  LogOut, 
  Key,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Json } from "@/integrations/supabase/types";

interface UserSettings {
  radius: number;
  darkTheme: string; // 'dark', 'light', or 'system'
  notifications: boolean;
  sosNotifications: boolean;
  vibeNotifications: boolean;
  nearbyUsersNotifications: boolean;
  vibration: boolean;
  backgroundLocationWarning: boolean;
  shakeToOpenSos: boolean;
  anonymousSos: boolean;
  locationSharing: boolean;
  autoAlertEmergencyContact: boolean;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

// Helper function to safely extract settings from Json
const extractSettings = (settings: Json | null): UserSettings => {
  const defaultSettings: UserSettings = {
    radius: 10,
    darkTheme: 'system',
    notifications: true,
    sosNotifications: true,
    vibeNotifications: true,
    nearbyUsersNotifications: false,
    vibration: true,
    backgroundLocationWarning: true,
    shakeToOpenSos: false,
    anonymousSos: false,
    locationSharing: true,
    autoAlertEmergencyContact: false
  };
  
  if (!settings) return defaultSettings;
  
  // Handle if settings is a string, number, boolean, or array (invalid types)
  if (typeof settings !== 'object' || Array.isArray(settings)) {
    return defaultSettings;
  }
  
  // Now settings is a JSON object, we can safely access properties
  const settingsObj = settings as Record<string, unknown>;
  
  return {
    radius: typeof settingsObj.radius === 'number' ? settingsObj.radius : defaultSettings.radius,
    darkTheme: typeof settingsObj.darkTheme === 'string' ? settingsObj.darkTheme : defaultSettings.darkTheme,
    notifications: typeof settingsObj.notifications === 'boolean' ? settingsObj.notifications : defaultSettings.notifications,
    sosNotifications: typeof settingsObj.sosNotifications === 'boolean' ? settingsObj.sosNotifications : defaultSettings.sosNotifications,
    vibeNotifications: typeof settingsObj.vibeNotifications === 'boolean' ? settingsObj.vibeNotifications : defaultSettings.vibeNotifications,
    nearbyUsersNotifications: typeof settingsObj.nearbyUsersNotifications === 'boolean' ? settingsObj.nearbyUsersNotifications : defaultSettings.nearbyUsersNotifications,
    vibration: typeof settingsObj.vibration === 'boolean' ? settingsObj.vibration : defaultSettings.vibration,
    backgroundLocationWarning: typeof settingsObj.backgroundLocationWarning === 'boolean' ? settingsObj.backgroundLocationWarning : defaultSettings.backgroundLocationWarning,
    shakeToOpenSos: typeof settingsObj.shakeToOpenSos === 'boolean' ? settingsObj.shakeToOpenSos : defaultSettings.shakeToOpenSos,
    anonymousSos: typeof settingsObj.anonymousSos === 'boolean' ? settingsObj.anonymousSos : defaultSettings.anonymousSos,
    locationSharing: typeof settingsObj.locationSharing === 'boolean' ? settingsObj.locationSharing : defaultSettings.locationSharing,
    autoAlertEmergencyContact: typeof settingsObj.autoAlertEmergencyContact === 'boolean' ? settingsObj.autoAlertEmergencyContact : defaultSettings.autoAlertEmergencyContact
  };
};

const Settings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<UserSettings>({
    radius: 10,
    darkTheme: 'system',
    notifications: true,
    sosNotifications: true,
    vibeNotifications: true,
    nearbyUsersNotifications: false,
    vibration: true,
    backgroundLocationWarning: true,
    shakeToOpenSos: false,
    anonymousSos: false,
    locationSharing: true,
    autoAlertEmergencyContact: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authProvider, setAuthProvider] = useState<string>('email');
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [newContact, setNewContact] = useState<{ name: string; phone: string }>({ name: '', phone: '' });
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Apply theme based on settings
  useEffect(() => {
    if (settings.darkTheme === 'dark') {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else if (settings.darkTheme === 'light') {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      // System default
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      }
    }
  }, [settings.darkTheme]);

  // Fetch user settings
  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUserEmail(session.user.email);
          
          // Determine auth provider
          if (session.user.app_metadata?.provider) {
            setAuthProvider(session.user.app_metadata.provider);
          }
          
          // Fetch user settings from profiles table
          const { data, error } = await supabase
            .from('profiles')
            .select('settings')
            .eq('id', session.user.id)
            .single();
          
          if (error && error.code !== 'PGRST116') {
            throw error;
          }
          
          if (data && data.settings) {
            const userSettings = extractSettings(data.settings);
            setSettings(userSettings);
          }
          
          // For demo purposes, create some sample emergency contacts
          // In a real app, these would be fetched from a separate table in Supabase
          setEmergencyContacts([
            { id: '1', name: 'Emergency Contact 1', phone: '+1234567890' },
            { id: '2', name: 'Emergency Contact 2', phone: '+0987654321' }
          ]);
        } else {
          // Not logged in, redirect to auth page
          navigate('/auth');
          return;
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast({
          title: "Error loading settings",
          description: "Failed to load your user settings",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserSettings();
  }, [navigate]);

  // Handle theme selection
  const setThemePreference = (theme: 'light' | 'dark' | 'system') => {
    setSettings({
      ...settings,
      darkTheme: theme
    });
  };

  // Handle toggle changes
  const handleToggleChange = (key: keyof UserSettings) => {
    setSettings({
      ...settings,
      [key]: !settings[key as keyof UserSettings]
    });
  };

  // Handle radius change
  const handleRadiusChange = (value: number[]) => {
    setSettings({
      ...settings,
      radius: value[0]
    });
  };
  
  // Add emergency contact
  const addEmergencyContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast({
        title: "Missing information",
        description: "Please provide both name and phone number",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would be saved to Supabase
    const newId = Date.now().toString();
    setEmergencyContacts([...emergencyContacts, { 
      id: newId, 
      name: newContact.name,
      phone: newContact.phone
    }]);
    
    setNewContact({ name: '', phone: '' });
    
    toast({
      title: "Contact added",
      description: "Emergency contact has been added"
    });
  };
  
  // Remove emergency contact
  const removeEmergencyContact = (id: string) => {
    // In a real app, this would be deleted from Supabase
    setEmergencyContacts(emergencyContacts.filter(contact => contact.id !== id));
    
    toast({
      title: "Contact removed",
      description: "Emergency contact has been removed"
    });
  };
  
  // Change password
  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New passwords do not match",
        variant: "destructive"
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setChangingPassword(true);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully"
      });
      
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast({
        title: "Failed to change password",
        description: error.message || "An error occurred while changing your password",
        variant: "destructive"
      });
    } finally {
      setChangingPassword(false);
    }
  };
  
  // Save settings
  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Update settings in profiles table
        const { error } = await supabase
          .from('profiles')
          .update({ 
            settings: settings as unknown as Json,
            updated_at: new Date().toISOString()
          })
          .eq('id', session.user.id);
        
        if (error) throw error;
      
        // Save to localStorage for shared components
        localStorage.setItem('user_settings', JSON.stringify(settings));
        
        toast({
          title: "Settings saved",
          description: "Your preferences have been updated",
          duration: 3000,
        });
      } else {
        throw new Error("Not authenticated");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error saving settings",
        description: "Failed to save your preferences",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Clear app cache
  const clearAppCache = () => {
    try {
      // Clear localStorage
      localStorage.clear();
      
      // If using IndexedDB, would clear that here too
      
      toast({
        title: "Cache cleared",
        description: "Application cache has been cleared"
      });
    } catch (error) {
      console.error("Error clearing cache:", error);
      toast({
        title: "Failed to clear cache",
        description: "An error occurred while clearing the cache",
        variant: "destructive"
      });
    }
  };
  
  // Reset all preferences
  const resetAllPreferences = async () => {
    try {
      const defaultSettings: UserSettings = {
        radius: 10,
        darkTheme: 'system',
        notifications: true,
        sosNotifications: true,
        vibeNotifications: true,
        nearbyUsersNotifications: false,
        vibration: true,
        backgroundLocationWarning: true,
        shakeToOpenSos: false,
        anonymousSos: false,
        locationSharing: true,
        autoAlertEmergencyContact: false
      };
      
      setSettings(defaultSettings);
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Update settings in profiles table
        const { error } = await supabase
          .from('profiles')
          .update({ 
            settings: defaultSettings as unknown as Json,
            updated_at: new Date().toISOString()
          })
          .eq('id', session.user.id);
        
        if (error) throw error;
      }
      
      // Update theme
      if (defaultSettings.darkTheme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add("dark");
          document.documentElement.classList.remove("light");
        } else {
          document.documentElement.classList.remove("dark");
          document.documentElement.classList.add("light");
        }
      }
      
      toast({
        title: "Preferences reset",
        description: "All settings have been reset to defaults"
      });
      
    } catch (error) {
      console.error("Error resetting preferences:", error);
      toast({
        title: "Failed to reset preferences",
        description: "An error occurred while resetting your preferences",
        variant: "destructive"
      });
    }
  };
  
  // Logout
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/welcome');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Failed to sign out",
        description: "An error occurred during sign out",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-4 min-h-screen mt-16 pb-16 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Loading your preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 min-h-screen mt-16 pb-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button 
          onClick={saveSettings} 
          disabled={saving}
          className="gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <div className="space-y-6">
        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notification Preferences
            </CardTitle>
            <CardDescription>Control what notifications you receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="flex flex-col">
                <span>All Notifications</span>
                <span className="text-xs text-muted-foreground">Master toggle for all notifications</span>
              </Label>
              <Switch 
                id="notifications" 
                checked={settings.notifications} 
                onCheckedChange={() => handleToggleChange('notifications')}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="sosNotifications" className="flex flex-col">
                <span>SOS Alerts</span>
                <span className="text-xs text-muted-foreground">Receive emergency alerts in your area</span>
              </Label>
              <Switch 
                id="sosNotifications" 
                checked={settings.sosNotifications && settings.notifications} 
                onCheckedChange={() => handleToggleChange('sosNotifications')}
                disabled={!settings.notifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="vibeNotifications" className="flex flex-col">
                <span>Vibe Alerts</span>
                <span className="text-xs text-muted-foreground">Get notified about new vibes near you</span>
              </Label>
              <Switch 
                id="vibeNotifications" 
                checked={settings.vibeNotifications && settings.notifications} 
                onCheckedChange={() => handleToggleChange('vibeNotifications')}
                disabled={!settings.notifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="nearbyUsersNotifications" className="flex flex-col">
                <span>Nearby Users</span>
                <span className="text-xs text-muted-foreground">Notifications when community members are nearby</span>
              </Label>
              <Switch 
                id="nearbyUsersNotifications" 
                checked={settings.nearbyUsersNotifications && settings.notifications} 
                onCheckedChange={() => handleToggleChange('nearbyUsersNotifications')}
                disabled={!settings.notifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Radius Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Vibe Radius Settings
            </CardTitle>
            <CardDescription>Set how far you want to receive alerts and see vibes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Radius: {settings.radius} km</Label>
                <span className="text-sm text-muted-foreground">{settings.radius < 5 ? "Small" : settings.radius < 10 ? "Medium" : "Large"} area</span>
              </div>
              <Slider
                min={1}
                max={20}
                step={1}
                value={[settings.radius]}
                onValueChange={handleRadiusChange}
              />
              <p className="text-xs text-muted-foreground">
                This affects how far away you'll receive alerts and see reported vibes
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-primary" />
              Appearance & Theme
            </CardTitle>
            <CardDescription>Customize how the app looks and feels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant={settings.darkTheme === 'light' ? "default" : "outline"} 
                className="flex flex-col items-center justify-center h-24 gap-2"
                onClick={() => setThemePreference('light')}
              >
                <Sun className="h-8 w-8" />
                <span>Light</span>
              </Button>
              <Button 
                variant={settings.darkTheme === 'dark' ? "default" : "outline"} 
                className="flex flex-col items-center justify-center h-24 gap-2"
                onClick={() => setThemePreference('dark')}
              >
                <Moon className="h-8 w-8" />
                <span>Dark</span>
              </Button>
              <Button 
                variant={settings.darkTheme === 'system' ? "default" : "outline"} 
                className="flex flex-col items-center justify-center h-24 gap-2"
                onClick={() => setThemePreference('system')}
              >
                <Monitor className="h-8 w-8" />
                <span>System</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* App Behavior */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vibrate className="h-5 w-5 text-primary" />
              App Behavior
            </CardTitle>
            <CardDescription>Configure app functionality and behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="vibration" className="flex flex-col">
                <span>Vibration Feedback</span>
                <span className="text-xs text-muted-foreground">Vibrate device on SOS alerts</span>
              </Label>
              <Switch 
                id="vibration" 
                checked={settings.vibration} 
                onCheckedChange={() => handleToggleChange('vibration')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="backgroundLocationWarning" className="flex flex-col">
                <span>Background Location Access</span>
                <span className="text-xs text-muted-foreground">Show warning about background location access</span>
              </Label>
              <Switch 
                id="backgroundLocationWarning" 
                checked={settings.backgroundLocationWarning} 
                onCheckedChange={() => handleToggleChange('backgroundLocationWarning')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="shakeToOpenSos" className="flex flex-col">
                <span>Shake to Open SOS</span>
                <span className="text-xs text-muted-foreground">Quickly access SOS by shaking your device (coming soon)</span>
              </Label>
              <Switch 
                id="shakeToOpenSos" 
                checked={settings.shakeToOpenSos} 
                onCheckedChange={() => handleToggleChange('shakeToOpenSos')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data & Cache */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-primary" />
              Data & Cache
            </CardTitle>
            <CardDescription>Manage your app data and cached content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={clearAppCache}
              >
                <Trash2 className="h-4 w-4" />
                Clear App Cache
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset All Preferences
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset all preferences?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will reset all your preferences to their default values. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={resetAllPreferences}>Reset</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              Privacy & Security
            </CardTitle>
            <CardDescription>Manage your privacy and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Emergency Contacts</h3>
              
              <div className="space-y-3">
                {emergencyContacts.map(contact => (
                  <div key={contact.id} className="flex items-center justify-between border p-3 rounded-md">
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.phone}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeEmergencyContact(contact.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input 
                    placeholder="Name" 
                    value={newContact.name}
                    onChange={e => setNewContact({...newContact, name: e.target.value})}
                  />
                  <Input 
                    placeholder="Phone Number" 
                    value={newContact.phone}
                    onChange={e => setNewContact({...newContact, phone: e.target.value})}
                  />
                  <Button 
                    onClick={addEmergencyContact}
                    className="gap-2 whitespace-nowrap"
                  >
                    <UserRoundPlus className="h-4 w-4" />
                    Add Contact
                  </Button>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoAlertEmergencyContact" className="flex flex-col">
                  <span>Auto-Alert Emergency Contacts</span>
                  <span className="text-xs text-muted-foreground">Automatically notify your emergency contacts when SOS is triggered</span>
                </Label>
                <Switch 
                  id="autoAlertEmergencyContact" 
                  checked={settings.autoAlertEmergencyContact} 
                  onCheckedChange={() => handleToggleChange('autoAlertEmergencyContact')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="anonymousSos" className="flex flex-col">
                  <span>Anonymous SOS</span>
                  <span className="text-xs text-muted-foreground">Send SOS alerts without revealing your identity</span>
                </Label>
                <Switch 
                  id="anonymousSos" 
                  checked={settings.anonymousSos} 
                  onCheckedChange={() => handleToggleChange('anonymousSos')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="locationSharing" className="flex flex-col">
                  <span>Location Sharing</span>
                  <span className="text-xs text-muted-foreground">Share your location with the app and emergency services</span>
                </Label>
                <Switch 
                  id="locationSharing" 
                  checked={settings.locationSharing} 
                  onCheckedChange={() => handleToggleChange('locationSharing')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-primary" />
              Account Management
            </CardTitle>
            <CardDescription>Manage your account settings and authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{userEmail || 'Not available'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Authentication Method</Label>
                  <p className="font-medium capitalize">{authProvider}</p>
                </div>
              </div>
            </div>
            
            {authProvider === 'email' && (
              <>
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Key className="h-5 w-5" /> Change Password
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input 
                          id="newPassword" 
                          type="password"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input 
                          id="confirmPassword" 
                          type="password"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                      </div>
                      
                      <Button 
                        onClick={changePassword}
                        disabled={changingPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                        className="gap-2"
                      >
                        {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                        Change Password
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            <Separator />
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be redirected to the welcome page and will need to sign in again to access your account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={logout}>Logout</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
      
      <Navbar />
    </div>
  );
};

export default Settings;
