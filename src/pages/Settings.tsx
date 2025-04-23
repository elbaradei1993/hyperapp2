
"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select } from "@/components/ui/select";
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
          value={language}
          onValueChange={setLanguage}
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
          Dark Theme
        </Label>
      </div>
      
      <Navbar />
    </div>
  );
};

export default Settings;
