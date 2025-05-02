"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Json } from "@/integrations/supabase/types";
import { useLanguage, LanguageType } from "@/contexts/LanguageContext";

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "ar", label: "العربية" }
];

interface UserSettings {
  language: LanguageType;
  radius: number;
  darkTheme: boolean;
  notifications: boolean;
}

// Helper function to safely extract settings from Json
const extractSettings = (settings: Json | null): UserSettings => {
  const defaultSettings: UserSettings = {
    language: 'en' as LanguageType,
    radius: 10,
    darkTheme: true,
    notifications: true
  };
  
  if (!settings) return defaultSettings;
  
  // Handle if settings is a string, number, boolean, or array (invalid types)
  if (typeof settings !== 'object' || Array.isArray(settings)) {
    return defaultSettings;
  }
  
  // Now settings is a JSON object, we can safely access properties
  const settingsObj = settings as Record<string, unknown>;
  
  return {
    language: (settingsObj.language as LanguageType) || defaultSettings.language,
    radius: typeof settingsObj.radius === 'number' ? settingsObj.radius : defaultSettings.radius,
    darkTheme: typeof settingsObj.darkTheme === 'boolean' ? settingsObj.darkTheme : defaultSettings.darkTheme,
    notifications: typeof settingsObj.notifications === 'boolean' ? settingsObj.notifications : defaultSettings.notifications
  };
};

const Settings = () => {
  const { toast } = useToast();
  const { language: currentLanguage, setLanguage, t } = useLanguage();
  const [settings, setSettings] = useState<UserSettings>({
    language: currentLanguage as LanguageType,
    radius: 10,
    darkTheme: true,
    notifications: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Apply dark mode
    if (settings.darkTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings.darkTheme]);

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
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
        } else {
          // Load from localStorage if user is not logged in
          const savedSettings = localStorage.getItem('user_settings');
          if (savedSettings) {
            try {
              const parsedSettings = JSON.parse(savedSettings);
              setSettings({
                language: (parsedSettings.language as LanguageType) || 'en',
                radius: parsedSettings.radius || 10,
                darkTheme: parsedSettings.darkTheme !== undefined ? parsedSettings.darkTheme : true,
                notifications: parsedSettings.notifications !== undefined ? parsedSettings.notifications : true
              });
            } catch (e) {
              console.error("Error parsing stored settings:", e);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserSettings();
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value as LanguageType;
    setSettings({
      ...settings,
      language: newLanguage
    });
    // Update the global language context immediately
    setLanguage(newLanguage);
  };

  const handleRadiusChange = (value: number[]) => {
    setSettings({
      ...settings,
      radius: value[0]
    });
  };
  
  const handleThemeChange = (checked: boolean) => {
    setSettings({
      ...settings,
      darkTheme: checked
    });
  };
  
  const handleNotificationsChange = (checked: boolean) => {
    setSettings({
      ...settings,
      notifications: checked
    });
  };
  
  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // Save to localStorage for all users
      localStorage.setItem('user_settings', JSON.stringify(settings));
      
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
      }
      
      toast({
        title: t('saved'),
        duration: 3000,
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: t('error'),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-4 min-h-screen pb-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={`max-w-md mx-auto p-4 min-h-screen pb-16 space-y-8 ${settings.language === 'ar' ? 'text-right' : 'text-left'}`}>
      <h1 className="text-3xl font-bold mb-6">{t('settings')}</h1>

      <div className="space-y-8">
        <div className="space-y-2">
          <Label htmlFor="language">{t('language')}</Label>
          <Select
            id="language"
            value={settings.language}
            onChange={handleLanguageChange}
            className={settings.language === 'ar' ? 'text-right' : 'text-left'}
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="radius">{t('radius')}: {settings.radius}</Label>
          <Slider
            id="radius"
            min={5}
            max={20}
            step={1}
            value={[settings.radius]}
            onValueChange={handleRadiusChange}
            className="max-w-xs"
          />
        </div>

        <div className={`flex items-center space-x-2 ${settings.language === 'ar' ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <Switch 
            id="theme" 
            checked={settings.darkTheme} 
            onCheckedChange={handleThemeChange} 
          />
          <Label htmlFor="theme" className="select-none">
            {t('darkTheme')}
          </Label>
        </div>
        
        <div className={`flex items-center space-x-2 ${settings.language === 'ar' ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <Switch 
            id="notifications" 
            checked={settings.notifications} 
            onCheckedChange={handleNotificationsChange} 
          />
          <Label htmlFor="notifications" className="select-none">
            {t('notifications')}
          </Label>
        </div>
        
        <Button 
          onClick={saveSettings} 
          disabled={saving}
          className="w-full"
        >
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          {t('save')}
        </Button>
      </div>
      
      <Navbar />
    </div>
  );
};

export default Settings;
