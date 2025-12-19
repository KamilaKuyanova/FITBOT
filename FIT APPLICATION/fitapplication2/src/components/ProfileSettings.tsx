import React from "react";
import { motion } from "motion/react";
import { User, Ruler, Palette, Bell, Settings, ChevronRight, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Switch } from "./ui/switch";
import { useProfile } from "../contexts/ProfileContext";
import { useCloset } from "../contexts/ClosetContext";

interface ProfileSettingsProps {
  onNavigate?: (screen: string) => void;
}

export function ProfileSettings({ onNavigate }: ProfileSettingsProps) {
  const { profile } = useProfile();
  const { items } = useCloset();
  const menuItems = [
    { icon: User, label: "Edit Profile", screen: "edit-profile" },
    { icon: Settings, label: "AI Model Settings", screen: "ai-settings" },
  ];

  const stats = [
    { label: "Outfits", value: "42" },
    { label: "Items", value: "128" },
    { label: "Favorites", value: "36" },
  ];

  return (
    <div className="min-h-screen pb-28 px-6 pt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h3 className="text-2xl font-semibold tracking-wide text-[#4A4A4A]">Profile</h3>
        </div>

        <motion.div
          className="rounded-[28px] bg-gradient-to-br from-[#F5DCE7] via-[#E3F0FF] to-[#E8F5E9] p-8 shadow-lg"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex flex-col items-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="mb-4"
            >
              <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                <AvatarImage src={profile.personalInfo.avatarUrl} />
                <AvatarFallback className="bg-gradient-to-br from-[#C8A2C8] to-[#E3B8E3] text-white">
                  {profile.personalInfo.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <h3 className="text-[#2d3748] mb-1 font-semibold">{profile.personalInfo.name}</h3>
            <p className="text-[#4a5568] mb-6">{profile.location.city}, {profile.location.country}</p>
            
            <div className="flex gap-8">
              <div className="text-center">
                <h3 className="text-[#2d3748] mb-1 font-semibold">42</h3>
                <p className="text-[#4a5568]">Outfits</p>
              </div>
              <div className="text-center">
                <h3 className="text-[#2d3748] mb-1 font-semibold">{items.length}</h3>
                <p className="text-[#4a5568]">Items</p>
              </div>
              <div className="text-center">
                <h3 className="text-[#2d3748] mb-1 font-semibold">36</h3>
                <p className="text-[#4a5568]">Favorites</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="rounded-[24px] bg-white/60 backdrop-blur-md border border-white/40 shadow-lg overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.screen}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onNavigate && onNavigate(item.screen)}
                className="w-full flex items-center justify-between p-5 hover:bg-white/60 transition-all border-b border-white/40 last:border-b-0"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#C8A2C8] to-[#E3B8E3] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[#4A4A4A]">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-[#8A8A8A]" />
              </motion.button>
            );
          })}
        </div>

        <div className="rounded-[24px] bg-white/60 backdrop-blur-md border border-white/40 shadow-lg p-6">
          <h4 className="mb-4">Preferred Style Tags</h4>
          <div className="flex flex-wrap gap-2">
            {profile.stylePreferences.tags.map((tag, index) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-[#F5DCE7] to-[#E3F0FF] shadow-md"
              >
                <p className="text-[#4A4A4A]">{tag}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-[24px] bg-white/60 backdrop-blur-md border border-white/40 shadow-lg p-5 flex items-center justify-center gap-3 text-[#d4183d] hover:bg-white transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </motion.button>
      </motion.div>
    </div>
  );
}
