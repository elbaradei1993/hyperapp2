
"use client";

import React, { useState } from "react";
import { Label, Select, Slider, Switch } from "@/components/ui";
import Navbar from "@/components/Navbar";

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
];

const Settings = () => {
  const [language, setLanguage] = useState("en");
  const [radius, setRadius] = useState<number>(10);
  const [darkTheme, setDarkTheme] = useState(true);

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen pb-16 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div>
        <Label htmlFor="language">Language</Label>
        <Select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="max-w-xs"
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="radius">Radius (KM): {radius}</Label>
        <Slider
          id="radius"
          min={5}
          max={20}
          step={1}
          value={[radius]}
          onValueChange={(value) => setRadius(value[0])}
          className="max-w-xs"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="theme" checked={darkTheme} onCheckedChange={setDarkTheme} />
        <Label htmlFor="theme" className="select-none">
          Dark Theme (toggle disabled in this lite version)
        </Label>
      </div>
      <p className="text-sm text-muted-foreground">
        Dark/Light theme toggle feature is not fully implemented.
      </p>
      <Navbar />
    </div>
  );
};

export default Settings;
