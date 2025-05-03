
import { useState, useEffect } from "react";

type Theme = "light" | "dark" | "system";

export function useTheme() {
  // Use localStorage to store theme preference (for SSG/SSR safety use useEffect)
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem("theme") as Theme | null;
      return savedTheme || "system";
    }
    return "system";
  });
  
  // Update the theme in localStorage and the DOM
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    
    // Update the document class
    updateDocumentClass(newTheme);
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
