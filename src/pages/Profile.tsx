
"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { User, Mail, Phone, Calendar, MapPin, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthService } from "@/services/AuthService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProfileData {
  name: string | null;
  email: string | null;
  phone_number: string | null;
  birthdate: string | null;
  location: string | null;
  profile_picture: string | null;
  username: string | null;
  points: number | null;
  reputation: number | null;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ProfileData>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data) {
          setProfileData({
            name: data.name,
            email: data.email || user.email,
            phone_number: data.phone_number,
            birthdate: data.birthdate,
            location: data.location,
            profile_picture: data.profile_picture,
            username: data.username,
            points: data.points || 0,
            reputation: data.reputation || 0
          });

          // Initialize edit form with current data
          setEditForm({
            name: data.name,
            email: data.email || user.email,
            phone_number: data.phone_number,
            birthdate: data.birthdate,
            location: data.location,
            username: data.username,
          });
        } else {
          // If no profile exists yet, create one with basic info
          const newProfile = {
            id: user.id,
            email: user.email
          };
          
          await supabase.from('profiles').upsert(newProfile);
          
          setProfileData({
            name: null,
            email: user.email,
            phone_number: null,
            birthdate: null,
            location: null,
            profile_picture: null,
            username: null,
            points: 0,
            reputation: 0
          });

          // Initialize edit form with current data
          setEditForm({
            email: user.email,
          });
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast({
          title: "Error",
          description: "Could not load profile data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user, toast]);

  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
      toast({
        title: "Signed out successfully",
      });
      navigate('/auth');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Could not sign out",
        variant: "destructive"
      });
    }
  };

  const handleEditSubmit = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...editForm
        });
        
      if (error) throw error;
      
      setProfileData(prev => prev ? {...prev, ...editForm} : null);
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Could not update profile information",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
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
      <h1 className="text-3xl font-bold mb-6">{t('profile')}</h1>

      <div className="flex flex-col space-y-6">
        <div className="flex flex-col items-center">
          <Avatar className="w-24 h-24">
            {profileData?.profile_picture ? (
              <AvatarImage src={profileData.profile_picture} />
            ) : (
              <AvatarFallback>
                {profileData?.name?.charAt(0) || profileData?.email?.charAt(0) || <User className="h-12 w-12" />}
              </AvatarFallback>
            )}
          </Avatar>
          
          <h2 className="text-xl font-semibold mt-4">
            {profileData?.name || profileData?.username || profileData?.email?.split('@')[0]}
          </h2>
          
          <div className="flex space-x-4 mt-2">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Points</p>
              <p className="font-semibold">{profileData?.points || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Reputation</p>
              <p className="font-semibold">{profileData?.reputation || 0}</p>
            </div>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{profileData?.email}</span>
            </div>
            
            {profileData?.phone_number && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{profileData?.phone_number}</span>
              </div>
            )}
            
            {profileData?.birthdate && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{profileData?.birthdate}</span>
              </div>
            )}
            
            {profileData?.location && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{profileData?.location}</span>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
          Edit Profile
        </Button>
        
        <Button variant="destructive" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={editForm.name || ''} 
                onChange={handleInputChange}
                placeholder="Your full name" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                name="username" 
                value={editForm.username || ''} 
                onChange={handleInputChange}
                placeholder="Your username" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                value={editForm.email || ''} 
                onChange={handleInputChange}
                placeholder="Your email address"
                type="email"
                disabled={!!user.email}
              />
              {user.email && (
                <p className="text-xs text-muted-foreground mt-1">
                  Email address is linked to your account and cannot be changed here
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input 
                id="phone_number" 
                name="phone_number" 
                value={editForm.phone_number || ''} 
                onChange={handleInputChange}
                placeholder="Your phone number" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="birthdate">Birthdate</Label>
              <Input 
                id="birthdate" 
                name="birthdate" 
                value={editForm.birthdate || ''} 
                onChange={handleInputChange}
                placeholder="YYYY-MM-DD" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                name="location" 
                value={editForm.location || ''} 
                onChange={handleInputChange}
                placeholder="Your location/city" 
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditSubmit}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Navbar />
    </div>
  );
};

export default Profile;
