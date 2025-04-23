
"use client";

import React, { useState } from "react";
import {
  Avatar,
  Button,
  Input,
  Label,
  Switch,
  Textarea,
} from "@/components/ui";
import Navbar from "@/components/Navbar";

const Profile = () => {
  // Simulated user data & past reports for demo
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("Hello! I'm a HyperAPP user.");
  const [role, setRole] = useState("User");
  const [location, setLocation] = useState("Unknown");
  const [notifications, setNotifications] = useState(true);
  const [reports] = useState([
    { id: 1, type: "sos", desc: "Violence Alert reported", date: "2025-01-01" },
    { id: 2, type: "vibe", desc: "Happy Vibe posted", date: "2025-01-15" },
  ]);

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col min-h-screen pb-16">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      <div className="flex justify-center mb-4">
        <Avatar className="w-24 h-24" src={avatarUrl} alt="Avatar" />
      </div>
      <input
        type="text"
        placeholder="Avatar URL"
        className="mb-4 rounded border border-border px-3 py-2"
        value={avatarUrl}
        onChange={(e) => setAvatarUrl(e.target.value)}
      />

      <div className="mb-4">
        <Label htmlFor="role">Role</Label>
        <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} />
      </div>
      <div className="mb-4">
        <Label htmlFor="location">Location</Label>
        <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>

      <div className="mb-4">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>

      <div className="flex items-center mb-6 space-x-2">
        <Switch
          id="notifications"
          checked={notifications}
          onCheckedChange={setNotifications}
        />
        <Label htmlFor="notifications" className="select-none">
          Notifications
        </Label>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Past Reports</h2>
        {reports.length === 0 && <p>No past reports</p>}
        <ul className="space-y-2 max-h-48 overflow-y-auto">
          {reports.map((r) => (
            <li key={r.id} className="border border-border rounded p-2">
              <strong>{r.type.toUpperCase()}</strong> - {r.desc} <br />
              <span className="text-xs text-muted-foreground">{r.date}</span>
            </li>
          ))}
        </ul>
      </div>
      <Navbar />
    </div>
  );
};

export default Profile;

