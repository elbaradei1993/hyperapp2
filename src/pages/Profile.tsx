
import React, { useEffect, useState, useRef, ChangeEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { 
  User, Mail, MapPin, Loader2, Save, Pencil, X, Check, 
  BadgeCheck, Building, Shield, Calendar, ThumbsUp, MapIcon
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { AuthService } from "@/services/AuthService";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  ProfileService,
  UserProfile,
  UserReportedVibe,
  UserEvent,
  SavedVibe
} from "@/services/ProfileService";

const ROLES = [
  { value: "individual", label: "Individual", icon: User },
  { value: "organization", label: "Organization", icon: Shield },
  { value: "venue", label: "Venue", icon: Building },
  { value: "responder", label: "Responder", icon: BadgeCheck }
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "it", label: "Italiano" },
  { value: "pt", label: "Português" }
];

const INTERESTS = [
  "Music", "Art", "Sports", "Technology", "Food", "Fashion", 
  "Travel", "Nature", "Education", "Fitness", "Photography", "Gaming",
  "Social", "Community", "Health", "Business", "Entertainment", "Culture"
];

interface EditableFieldProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
}

const EditableField: React.FC<EditableFieldProps> = ({ 
  value, 
  onSave, 
  placeholder = "Click to edit",
  multiline = false,
  className = ""
}) => {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || "");
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);
  
  useEffect(() => {
    setTempValue(value || "");
  }, [value]);

  const handleSave = () => {
    onSave(tempValue);
    setEditing(false);
  };
  
  const handleCancel = () => {
    setTempValue(value || "");
    setEditing(false);
  };
  
  if (editing) {
    return (
      <div className={`relative flex ${className}`}>
        {multiline ? (
          <Textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="pr-16"
            placeholder={placeholder}
          />
        ) : (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="pr-16"
            placeholder={placeholder}
          />
        )}
        <div className="absolute right-1 top-1 flex space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7" 
            onClick={handleCancel}
          >
            <X className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7" 
            onClick={handleSave}
          >
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`group flex items-start gap-2 cursor-pointer ${className}`}
      onClick={() => setEditing(true)}
    >
      <div className="flex-1">
        {value ? (
          multiline ? (
            <p className="text-sm whitespace-pre-wrap">{value}</p>
          ) : (
            <p className="text-sm">{value}</p>
          )
        ) : (
          <p className="text-sm text-muted-foreground italic">{placeholder}</p>
        )}
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" 
        onClick={(e) => {
          e.stopPropagation();
          setEditing(true);
        }}
      >
        <Pencil className="h-3 w-3" />
      </Button>
    </div>
  );
};

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [reportedVibes, setReportedVibes] = useState<UserReportedVibe[]>([]);
  const [createdEvents, setCreatedEvents] = useState<UserEvent[]>([]);
  const [savedVibes, setSavedVibes] = useState<SavedVibe[]>([]);
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<'vibe' | 'event' | 'saved' | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [interestsDialogOpen, setInterestsDialogOpen] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user profile
        const profileData = await ProfileService.getCurrentUserProfile();
        
        if (profileData) {
          setProfile(profileData);
          
          // Set interests from profile
          if (profileData.interests) {
            setInterests(profileData.interests);
          }
          
          // Fetch user's reported vibes
          const vibes = await ProfileService.getUserReportedVibes(user.id);
          setReportedVibes(vibes);
          
          // Fetch user's created events
          const events = await ProfileService.getUserCreatedEvents(user.id);
          setCreatedEvents(events);
          
          // Fetch user's saved vibes
          const saved = await ProfileService.getUserSavedVibes(user.id);
          setSavedVibes(saved);
        } else {
          // Create a basic profile if none exists
          const newProfile: Partial<UserProfile> = {
            id: user.id,
            email: user.email,
            notification_preferences: {
              email: true,
              push: true,
              vibes: true,
              events: true,
              alerts: true,
            }
          };
          
          const createdProfile = await ProfileService.updateUserProfile(user.id, newProfile);
          if (createdProfile) {
            setProfile(createdProfile);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error loading profile",
          description: "Could not load your profile data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, toast]);
  
  const handleUpdateProfile = async (key: string, value: any) => {
    if (!user || !profile) return;
    
    setSaving(true);
    
    try {
      const updates: Partial<UserProfile> = { [key]: value };
      const updated = await ProfileService.updateUserProfile(user.id, updates);
      
      if (updated) {
        setProfile(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "Could not update your profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    if (!user) return;
    
    const file = e.target.files[0];
    
    // File size validation (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }
    
    setUploadingImage(true);
    
    try {
      const photoUrl = await ProfileService.uploadProfilePicture(user.id, file);
      
      if (photoUrl) {
        setProfile(prev => prev ? { ...prev, profile_picture: photoUrl } : null);
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
        description: "Could not upload your profile picture",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleUpdateInterests = async (selectedInterests: string[]) => {
    if (!user) return;
    
    setInterests(selectedInterests);
    await handleUpdateProfile('interests', selectedInterests);
    setInterestsDialogOpen(false);
  };
  
  const handleNotificationToggle = async (key: string, value: boolean) => {
    if (!user || !profile || !profile.notification_preferences) return;
    
    const updatedPreferences = {
      ...profile.notification_preferences,
      [key]: value
    };
    
    await handleUpdateProfile('notification_preferences', updatedPreferences);
  };
  
  const handleViewItem = (item: any, type: 'vibe' | 'event' | 'saved') => {
    setSelectedItem(item);
    setSelectedItemType(type);
    setViewDialogOpen(true);
  };
  
  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
      navigate('/auth');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign out failed",
        description: "Could not sign out",
        variant: "destructive"
      });
    }
  };
  
  const getRoleBadge = (role: string) => {
    const roleObj = ROLES.find(r => r.value === role);
    if (!roleObj) return null;
    
    const Icon = roleObj.icon;
    
    return (
      <Badge 
        variant="outline" 
        className="flex items-center gap-1 px-2 py-1 text-xs font-normal"
      >
        <Icon className="h-3 w-3" />
        <span>{roleObj.label}</span>
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-4 flex flex-col min-h-screen pb-16 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto p-4 flex flex-col min-h-screen pb-16">
        <h1 className="text-3xl font-bold mb-6">{t('profile')}</h1>

        <div className="flex flex-col items-center justify-center space-y-6 flex-grow">
          <Avatar className="w-24 h-24">
            <AvatarFallback>
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold">{t('welcome')}</h2>
            <p className="text-muted-foreground">{t('signIn')} to view your profile</p>
          </div>
          
          <Button onClick={() => navigate('/auth')}>
            {t('signIn')}
          </Button>
        </div>

        <Navbar />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col min-h-screen pb-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('profile')}</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSignOut}
        >
          {t('signOut')}
        </Button>
      </div>

      <div className="flex flex-col space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center relative">
          <div className="relative group">
            <Avatar className="w-24 h-24 border-2 border-background ring-2 ring-primary">
              {profile?.profile_picture ? (
                <AvatarImage src={profile.profile_picture} />
              ) : (
                <AvatarFallback className="bg-primary/10">
                  {profile?.name?.charAt(0) || profile?.username?.charAt(0) || profile?.email?.charAt(0) || <User className="h-12 w-12" />}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div 
              className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadingImage ? (
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              ) : (
                <Pencil className="h-6 w-6 text-white" />
              )}
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploadingImage}
            />
          </div>
          
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              {profile?.role && getRoleBadge(profile.role)}
            </div>
            
            <EditableField 
              value={profile?.name || ''}
              onSave={(value) => handleUpdateProfile('name', value)}
              placeholder="Add your name"
              className="justify-center text-xl font-semibold h-8"
            />
            
            <EditableField 
              value={profile?.username || ''}
              onSave={(value) => handleUpdateProfile('username', value)}
              placeholder="Add a username"
              className="justify-center text-sm text-muted-foreground mb-2 h-6"
            />

            {profile?.email && (
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span>{profile.email}</span>
              </div>
            )}
            
            {profile?.location && (
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                <span>{profile.location}</span>
              </div>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="bio" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="bio">Bio</TabsTrigger>
            <TabsTrigger value="reports">Vibes</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>
          
          {/* Bio Tab */}
          <TabsContent value="bio" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">About</CardTitle>
                <CardDescription>Your public profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Bio</Label>
                  <EditableField 
                    value={profile?.bio || ''}
                    onSave={(value) => handleUpdateProfile('bio', value)}
                    placeholder="Write something about yourself"
                    multiline
                    className="border rounded-md p-3"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Location</Label>
                  <EditableField 
                    value={profile?.location || ''}
                    onSave={(value) => handleUpdateProfile('location', value)}
                    placeholder="Add your location"
                    className="border rounded-md p-3"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs text-muted-foreground">Interests</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-xs"
                      onClick={() => setInterestsDialogOpen(true)}
                    >
                      Edit
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 border rounded-md p-3 min-h-[60px]">
                    {interests.length > 0 ? (
                      interests.map(interest => (
                        <Badge key={interest} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Add your interests</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Role</Label>
                  <Select
                    value={profile?.role || 'individual'}
                    onValueChange={(value) => handleUpdateProfile('role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map(role => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center gap-2">
                            <role.icon className="h-4 w-4" />
                            <span>{role.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Language</Label>
                  <Select
                    value={profile?.language || 'en'}
                    onValueChange={(value) => handleUpdateProfile('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(language => (
                        <SelectItem key={language.value} value={language.value}>
                          {language.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive email updates</p>
                  </div>
                  <Switch 
                    checked={profile?.notification_preferences?.email || false}
                    onCheckedChange={(checked) => handleNotificationToggle('email', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Push Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive mobile notifications</p>
                  </div>
                  <Switch 
                    checked={profile?.notification_preferences?.push || false}
                    onCheckedChange={(checked) => handleNotificationToggle('push', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Vibe Alerts</p>
                    <p className="text-xs text-muted-foreground">Notifications about new vibes</p>
                  </div>
                  <Switch 
                    checked={profile?.notification_preferences?.vibes || false}
                    onCheckedChange={(checked) => handleNotificationToggle('vibes', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Event Updates</p>
                    <p className="text-xs text-muted-foreground">Notifications about events</p>
                  </div>
                  <Switch 
                    checked={profile?.notification_preferences?.events || false}
                    onCheckedChange={(checked) => handleNotificationToggle('events', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Emergency Alerts</p>
                    <p className="text-xs text-muted-foreground">Critical safety notifications</p>
                  </div>
                  <Switch 
                    checked={profile?.notification_preferences?.alerts || false}
                    onCheckedChange={(checked) => handleNotificationToggle('alerts', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Reported Vibes Tab */}
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reported Vibes</CardTitle>
                <CardDescription>Vibes you've reported in the community</CardDescription>
              </CardHeader>
              <CardContent>
                {reportedVibes.length > 0 ? (
                  <div className="space-y-3">
                    {reportedVibes.map(vibe => (
                      <div 
                        key={vibe.id} 
                        className="p-3 border rounded-md cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => handleViewItem(vibe, 'vibe')}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium text-sm">{vibe.title || 'Untitled Vibe'}</h3>
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: vibe.vibe_type.color }}
                          ></div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                          {vibe.description || 'No description'}
                        </p>
                        
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            <span>{vibe.confirmed_count}</span>
                          </div>
                          
                          <span>
                            {new Date(vibe.created_at as string).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <MapIcon className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
                    <p className="mt-2 text-sm text-muted-foreground">You haven't reported any vibes yet</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => navigate('/')}
                    >
                      Explore Vibes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Created Events Tab */}
          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Created Events</CardTitle>
                <CardDescription>Events you've organized</CardDescription>
              </CardHeader>
              <CardContent>
                {createdEvents.length > 0 ? (
                  <div className="space-y-3">
                    {createdEvents.map(event => (
                      <div 
                        key={event.id} 
                        className="p-3 border rounded-md cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => handleViewItem(event, 'event')}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium text-sm">{event.title}</h3>
                          {event.vibe_type && (
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: event.vibe_type.color }}
                            ></div>
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                          {event.description || 'No description'}
                        </p>
                        
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(event.start_date_time).toLocaleDateString()}</span>
                          </div>
                          
                          {event.address && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate max-w-[100px]">{event.address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Calendar className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
                    <p className="mt-2 text-sm text-muted-foreground">You haven't created any events yet</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => navigate('/events/create')}
                    >
                      Create Event
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Saved Vibes Tab */}
          <TabsContent value="saved" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Saved Vibes</CardTitle>
                <CardDescription>Vibes you've bookmarked</CardDescription>
              </CardHeader>
              <CardContent>
                {savedVibes.length > 0 ? (
                  <div className="space-y-3">
                    {savedVibes.map(saved => (
                      <div 
                        key={saved.id} 
                        className="p-3 border rounded-md cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => handleViewItem(saved, 'saved')}
                      >
                        {saved.vibe && (
                          <>
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-medium text-sm">{saved.vibe.title || 'Untitled Vibe'}</h3>
                              {saved.vibe.vibe_type && (
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: saved.vibe.vibe_type.color }}
                                ></div>
                              )}
                            </div>
                            
                            <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                              {saved.vibe.description || 'No description'}
                            </p>
                            
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                              <span>Saved {new Date(saved.saved_at).toLocaleDateString()}</span>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (user) {
                                    ProfileService.unsaveVibe(user.id, saved.vibe_id)
                                      .then(success => {
                                        if (success) {
                                          setSavedVibes(prev => prev.filter(v => v.id !== saved.id));
                                        }
                                      });
                                  }
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <ThumbsUp className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
                    <p className="mt-2 text-sm text-muted-foreground">You haven't saved any vibes yet</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => navigate('/')}
                    >
                      Explore Vibes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Interests Dialog */}
      <Dialog open={interestsDialogOpen} onOpenChange={setInterestsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Your Interests</DialogTitle>
            <DialogDescription>
              Choose topics that interest you. This helps us show you relevant content.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(interest => {
                const isSelected = interests.includes(interest);
                return (
                  <Badge 
                    key={interest}
                    variant={isSelected ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      if (isSelected) {
                        setInterests(interests.filter(i => i !== interest));
                      } else {
                        setInterests([...interests, interest]);
                      }
                    }}
                  >
                    {interest}
                  </Badge>
                );
              })}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setInterestsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleUpdateInterests(interests)}>
              Save Interests
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Item Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selectedItemType === 'event' && selectedItem.title}
                  {selectedItemType === 'vibe' && (selectedItem.title || 'Untitled Vibe')}
                  {selectedItemType === 'saved' && selectedItem.vibe && (selectedItem.vibe.title || 'Untitled Vibe')}
                </DialogTitle>
                {selectedItemType === 'event' && (
                  <DialogDescription>
                    Event on {new Date(selectedItem.start_date_time).toLocaleDateString()}
                  </DialogDescription>
                )}
                {selectedItemType === 'vibe' && (
                  <DialogDescription>
                    Vibe reported on {new Date(selectedItem.created_at).toLocaleDateString()}
                  </DialogDescription>
                )}
                {selectedItemType === 'saved' && selectedItem.vibe && (
                  <DialogDescription>
                    Saved on {new Date(selectedItem.saved_at).toLocaleDateString()}
                  </DialogDescription>
                )}
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Vibe or Event Details */}
                {(selectedItemType === 'vibe' || (selectedItemType === 'saved' && selectedItem.vibe)) && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Description</Label>
                      <p className="text-sm border rounded-md p-3">
                        {selectedItemType === 'vibe' 
                          ? (selectedItem.description || 'No description') 
                          : (selectedItem.vibe?.description || 'No description')}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Type</Label>
                        <div className="flex items-center gap-2 border rounded-md p-3 mt-1">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ 
                              backgroundColor: selectedItemType === 'vibe' 
                                ? selectedItem.vibe_type?.color 
                                : selectedItem.vibe?.vibe_type?.color 
                            }}
                          ></div>
                          <span className="text-sm">
                            {selectedItemType === 'vibe' 
                              ? selectedItem.vibe_type?.name 
                              : selectedItem.vibe?.vibe_type?.name}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-muted-foreground">Confirmations</Label>
                        <div className="flex items-center gap-2 border rounded-md p-3 mt-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span className="text-sm">
                            {selectedItemType === 'vibe' 
                              ? selectedItem.confirmed_count 
                              : selectedItem.vibe?.confirmed_count}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {selectedItemType === 'event' && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Description</Label>
                      <p className="text-sm border rounded-md p-3">
                        {selectedItem.description || 'No description'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Start Time</Label>
                        <p className="text-sm border rounded-md p-3 mt-1">
                          {new Date(selectedItem.start_date_time).toLocaleString()}
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-muted-foreground">End Time</Label>
                        <p className="text-sm border rounded-md p-3 mt-1">
                          {new Date(selectedItem.end_date_time).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {selectedItem.address && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Address</Label>
                        <p className="text-sm border rounded-md p-3">
                          {selectedItem.address}
                        </p>
                      </div>
                    )}
                  </>
                )}
                
                <div className="pt-2">
                  <Button 
                    onClick={() => {
                      setViewDialogOpen(false);
                      // Handle navigation to item on map
                      navigate('/');
                    }}
                    className="w-full"
                  >
                    <MapIcon className="h-4 w-4 mr-2" />
                    View on Map
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Navbar />
    </div>
  );
};

export default Profile;
