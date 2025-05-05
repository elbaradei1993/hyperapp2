
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type Theme = "light" | "dark" | "system";

export function useTheme() {
  // Use localStorage to store theme preference
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("theme") as Theme || "system";
    }
    return "system";
  });
  
  // Effect for loading user theme preference from profile if logged in
  useEffect(() => {
    const loadUserThemePreference = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('settings')
            .eq('id', session.user.id)
            .single();
          
          if (!error && profileData?.settings) {
            // Parse settings if it's a string
            const settings = typeof profileData.settings === 'string' 
              ? JSON.parse(profileData.settings) 
              : profileData.settings;
            
            // Check if darkTheme setting exists
            if (settings && typeof settings === 'object' && 'darkTheme' in settings) {
              // If we have a user preference, set it
              const userTheme: Theme = settings.darkTheme === true ? 'dark' : 'light';
              setThemeState(userTheme);
              localStorage.setItem("theme", userTheme); 
              updateDocumentClass(userTheme);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load user theme preference", err);
      }
    };

    loadUserThemePreference();
  }, []);
  
  // Update the theme in localStorage, Supabase, and the DOM
  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    
    // Update the document class
    updateDocumentClass(newTheme);
    
    // Save to user profile if logged in
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const isDark = newTheme === 'dark' || 
          (newTheme === 'system' && window.matchMedia("(prefers-color-scheme: dark)").matches);
        
        // Get current profile settings first
        const { data: profileData } = await supabase
          .from('profiles')
          .select('settings')
          .eq('id', session.user.id)
          .single();
        
        // Prepare the settings object
        let currentSettings = profileData?.settings || {};
        
        // Convert from string if needed
        if (typeof currentSettings === 'string') {
          try {
            currentSettings = JSON.parse(currentSettings);
          } catch (e) {
            currentSettings = {};
          }
        }
        
        // Make sure currentSettings is an object before spreading
        const settingsObj = typeof currentSettings === 'object' && currentSettings !== null 
          ? currentSettings 
          : {};
        
        // Create a new settings object with the updated darkTheme value
        const newSettings = {
          ...settingsObj,
          darkTheme: isDark
        };
        
        const { error } = await supabase
          .from('profiles')
          .update({ 
            settings: newSettings
          })
          .eq('id', session.user.id);
          
        if (error) {
          console.error("Failed to save theme preference to profile:", error);
        }
      }
    } catch (err) {
      console.error("Failed to save theme preference", err);
    }
  };
  
  // Handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      if (theme === "system") {
        updateDocumentClass("system");
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    updateDocumentClass(theme); // Initial setting
    
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme]);
  
  function updateDocumentClass(theme: Theme) {
    const isDark = 
      theme === "dark" || 
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    
    // Update the class on the document element
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
  
  return { theme, setTheme };
}
