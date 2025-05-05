
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
          
          if (!error && profileData?.settings?.darkTheme !== undefined) {
            // If we have a user preference, set it
            const userTheme: Theme = profileData.settings.darkTheme === true ? 'dark' : 'light';
            setThemeState(userTheme);
            localStorage.setItem("theme", userTheme); 
            updateDocumentClass(userTheme);
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
        
        await supabase
          .from('profiles')
          .update({ 
            settings: {
              darkTheme: isDark
            }
          })
          .eq('id', session.user.id);
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
