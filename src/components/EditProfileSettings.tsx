import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Save,
  Upload,
  MapPin,
  Cloud,
  Sun,
  Loader2,
  ChevronDown,
  ChevronUp,
  X,
  Trash2,
  Download,
  AlertTriangle,
  User,
  Ruler,
  Palette,
  Bell,
  Settings,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useProfile } from "../contexts/ProfileContext";
import { useCloset } from "../contexts/ClosetContext";

interface EditProfileSettingsProps {
  onBack: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function EditProfileSettings({ onBack }: EditProfileSettingsProps) {
  const { profile, updateProfile, saveProfile, hasUnsavedChanges, resetProfile } =
    useProfile();
  const { items } = useCloset();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["personalInfo"])
  );
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [locationInput, setLocationInput] = useState(profile.location.city);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetLearningEnabled, setResetLearningEnabled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch weather when location changes
  useEffect(() => {
    if (profile.location.coordinates.lat && profile.location.coordinates.lon) {
      fetchWeatherForLocation(
        profile.location.coordinates.lat,
        profile.location.coordinates.lon
      );
    }
  }, [profile.location.coordinates]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const fetchWeatherForLocation = async (lat: number, lon: number) => {
    setWeatherLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/weather/current`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon }),
      });

      if (response.ok) {
        const data = await response.json();
        setWeatherData(data);
      }
    } catch (error) {
      console.error("Failed to fetch weather:", error);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleLocationSearch = async (city: string) => {
    if (!city.trim()) return;

    setWeatherLoading(true);
    try {
      // Try to get coordinates from city name
      const response = await fetch(
        `${API_BASE_URL}/api/weather/location?city=${encodeURIComponent(city)}`
      );

      if (response.ok) {
        const data = await response.json();
        updateProfile({
          location: {
            ...profile.location,
            city: data.city || city,
            country: data.country || profile.location.country,
            coordinates: {
              lat: data.coordinates.lat,
              lon: data.coordinates.lon,
            },
            timezone: data.timezone || profile.location.timezone,
          },
        });
      }
    } catch (error) {
      console.error("Failed to search location:", error);
      alert("Location not found. Please try again.");
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setWeatherLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        await fetchWeatherForLocation(latitude, longitude);

        // Reverse geocode to get city name (simplified - in production use a geocoding API)
        updateProfile({
          location: {
            ...profile.location,
            coordinates: { lat: latitude, lon: longitude },
          },
        });
      },
      (err) => {
        console.error(err);
        alert("Unable to access location.");
        setWeatherLoading(false);
      }
    );
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      updateProfile({
        personalInfo: {
          ...profile.personalInfo,
          avatarUrl: base64String,
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveProfile();
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onBack();
      }, 1500);
    } catch (error) {
      alert("Failed to save profile. Changes saved locally.");
      onBack();
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(profile, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fitbot-profile-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    // In production, this would call an API endpoint
    alert("Account deletion would be processed here. This is a demo.");
    setShowDeleteConfirm(false);
  };

  const handleResetAI = () => {
    // In production, this would call an API endpoint
    updateProfile({
      aiSettings: {
        ...profile.aiSettings,
        creativity: 6,
        verbosity: 5,
        learningFrequency: "Daily",
      },
    });
    setShowResetConfirm(false);
    alert("AI learning has been reset.");
  };

  const availableStyleTags = [
    "Casual",
    "Chic",
    "Minimalist",
    "Bohemian",
    "Streetwear",
    "Classic",
    "Sporty",
    "Vintage",
    "Modern",
    "Elegant",
    "Edgy",
    "Romantic",
  ];

  const availablePatterns = [
    "Solids",
    "Stripes",
    "Florals",
    "Geometric",
    "Polka Dots",
    "Plaid",
    "Abstract",
  ];


  const SectionHeader = ({
    title,
    icon: Icon,
    section,
  }: {
    title: string;
    icon: any;
    section: string;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 hover:bg-white/40 transition-colors rounded-[16px]"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#C8A2C8] to-[#E3B8E3] flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-[#4A4A4A]">{title}</h3>
      </div>
      {expandedSections.has(section) ? (
        <ChevronUp className="w-5 h-5 text-[#8A8A8A]" />
      ) : (
        <ChevronDown className="w-5 h-5 text-[#8A8A8A]" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen pb-32 px-6 pt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-6"
        style={{ "--spacing-sm": "8px", "--spacing-md": "16px", "--spacing-lg": "24px", "--spacing-xl": "32px" } as React.CSSProperties}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-md border border-white/40 flex items-center justify-center hover:bg-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#4A4A4A]" />
            </button>
            <div>
              <h2>Profile Settings</h2>
              {hasUnsavedChanges && (
                <p className="text-sm text-[#8A8A8A]">You have unsaved changes</p>
              )}
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            className="rounded-[16px] bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white shadow-lg hover:from-[#B892B8] hover:to-[#D3A8D3] transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>

        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[16px] bg-gradient-to-r from-[#E8F5E9] to-[#D0E8D1] p-4 text-center"
          >
            <p className="text-[#4A4A4A] font-medium">Profile saved successfully!</p>
          </motion.div>
        )}

        {/* A. Personal Information */}
        <motion.div
          className="rounded-[24px] bg-white/60 backdrop-blur-md border border-white/40 shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <SectionHeader title="Personal Information" icon={User} section="personalInfo" />
          <AnimatePresence>
            {expandedSections.has("personalInfo") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-6 pb-6"
                style={{ paddingTop: "var(--spacing-lg)", paddingBottom: "var(--spacing-lg)" }}
              >
                <div className="flex flex-col gap-6" style={{ gap: "var(--spacing-lg)" }}>
                  {/* Avatar Upload */}
                  <div className="flex flex-col items-center gap-4" style={{ gap: "var(--spacing-md)" }}>
                    <div className="relative">
                      <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                        <AvatarImage src={profile.personalInfo.avatarUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-[#C8A2C8] to-[#E3B8E3] text-white">
                          {profile.personalInfo.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#C8A2C8] to-[#E3B8E3] flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      >
                        <Upload className="w-4 h-4 text-white" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        style={{
                          display: 'none',
                          visibility: 'hidden',
                          position: 'absolute',
                          width: 0,
                          height: 0,
                          opacity: 0,
                          pointerEvents: 'none'
                        }}
                        aria-label="Upload profile picture"
                        tabIndex={-1}
                      />
                    </div>
                  </div>

                  {/* Name */}
                  <div className="flex flex-col gap-2" style={{ gap: "var(--spacing-sm)" }}>
                    <Label className="text-sm font-medium text-[#4A4A4A]">Name</Label>
                    <Input
                      value={profile.personalInfo.name}
                      onChange={(e) =>
                        updateProfile({
                          personalInfo: {
                            ...profile.personalInfo,
                            name: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 h-10"
                      required
                    />
                  </div>

                  {/* Bio */}
                  <div className="flex flex-col gap-2" style={{ gap: "var(--spacing-sm)" }}>
                    <Label className="text-sm font-medium text-[#4A4A4A]">Bio / Description</Label>
                    <div className="relative">
                      <textarea
                        value={profile.personalInfo.bio}
                        onChange={(e) => {
                          if (e.target.value.length <= 150) {
                            updateProfile({
                              personalInfo: {
                                ...profile.personalInfo,
                                bio: e.target.value,
                              },
                            });
                          }
                        }}
                        className="w-full rounded-[16px] border border-[#C8A2C8]/30 px-3 py-2 min-h-[100px] resize-none focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20"
                        placeholder="Tell us about your style..."
                      />
                      <p className="absolute bottom-2 right-3 text-xs text-[#8A8A8A]">
                        {profile.personalInfo.bio.length}/150
                      </p>
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="flex flex-col gap-2" style={{ gap: "var(--spacing-sm)" }}>
                    <Label className="text-sm font-medium text-[#4A4A4A]">Gender Preference</Label>
                    <Select
                      value={profile.personalInfo.gender || ""}
                      onValueChange={(value) =>
                        updateProfile({
                          personalInfo: {
                            ...profile.personalInfo,
                            gender: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger className="rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 bg-white/80 h-10">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="rounded-[16px] bg-white z-50">
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Non-binary">Non-binary</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* B. Body Measurements */}
        <motion.div
          className="rounded-[24px] bg-white/60 backdrop-blur-md border border-white/40 shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SectionHeader
            title="Body Measurements"
            icon={Ruler}
            section="measurements"
          />
          <AnimatePresence>
            {expandedSections.has("measurements") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-6 pb-6"
                style={{ paddingTop: "var(--spacing-lg)", paddingBottom: "var(--spacing-lg)" }}
              >
                <div className="flex flex-col gap-6" style={{ gap: "var(--spacing-lg)" }}>
                  {/* Height */}
                  <div className="flex flex-col gap-2" style={{ gap: "var(--spacing-sm)" }}>
                    <Label className="text-sm font-medium text-[#4A4A4A]">Height</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number"
                        value={profile.measurements.height.value || ""}
                        onChange={(e) =>
                          updateProfile({
                            measurements: {
                              ...profile.measurements,
                              height: {
                                ...profile.measurements.height,
                                value: parseFloat(e.target.value) || 0,
                              },
                            },
                          })
                        }
                        placeholder={profile.measurements.height.unit === "cm" ? "Enter height in cm" : "Enter height in inches"}
                        className="flex-1 rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 h-10 text-[#4A4A4A]"
                      />
                      <div className="flex gap-1 border border-[#C8A2C8]/30 rounded-[8px] overflow-hidden">
                        <button
                          onClick={() =>
                            updateProfile({
                              measurements: {
                                ...profile.measurements,
                                height: {
                                  ...profile.measurements.height,
                                  unit: "cm",
                                },
                              },
                            })
                          }
                          className={`px-4 py-2 text-sm font-medium transition-all ${
                            profile.measurements.height.unit === "cm"
                              ? "bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white"
                              : "bg-white/60 text-[#8A8A8A] hover:bg-white/80"
                          }`}
                        >
                          cm
                        </button>
                        <button
                          onClick={() =>
                            updateProfile({
                              measurements: {
                                ...profile.measurements,
                                height: {
                                  ...profile.measurements.height,
                                  unit: "in",
                                },
                              },
                            })
                          }
                          className={`px-4 py-2 text-sm font-medium transition-all ${
                            profile.measurements.height.unit === "in"
                              ? "bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white"
                              : "bg-white/60 text-[#8A8A8A] hover:bg-white/80"
                          }`}
                        >
                          in
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-[#8A8A8A] mt-1">
                      Enter your height for better clothing recommendations
                    </p>
                  </div>

                  {/* Weight */}
                  <div className="flex flex-col gap-2" style={{ gap: "var(--spacing-sm)" }}>
                    <Label className="text-sm font-medium text-[#4A4A4A]">Weight</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number"
                        value={profile.measurements.weight.value || ""}
                        onChange={(e) =>
                          updateProfile({
                            measurements: {
                              ...profile.measurements,
                              weight: {
                                ...profile.measurements.weight,
                                value: parseFloat(e.target.value) || 0,
                              },
                            },
                          })
                        }
                        placeholder={profile.measurements.weight.unit === "kg" ? "Enter weight in kg" : "Enter weight in lbs"}
                        className="flex-1 rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 h-10 text-[#4A4A4A]"
                      />
                      <div className="flex gap-1 border border-[#C8A2C8]/30 rounded-[8px] overflow-hidden">
                        <button
                          onClick={() =>
                            updateProfile({
                              measurements: {
                                ...profile.measurements,
                                weight: {
                                  ...profile.measurements.weight,
                                  unit: "kg",
                                },
                              },
                            })
                          }
                          className={`px-4 py-2 text-sm font-medium transition-all ${
                            profile.measurements.weight.unit === "kg"
                              ? "bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white"
                              : "bg-white/60 text-[#8A8A8A] hover:bg-white/80"
                          }`}
                        >
                          kg
                        </button>
                        <button
                          onClick={() =>
                            updateProfile({
                              measurements: {
                                ...profile.measurements,
                                weight: {
                                  ...profile.measurements.weight,
                                  unit: "lbs",
                                },
                              },
                            })
                          }
                          className={`px-4 py-2 text-sm font-medium transition-all ${
                            profile.measurements.weight.unit === "lbs"
                              ? "bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white"
                              : "bg-white/60 text-[#8A8A8A] hover:bg-white/80"
                          }`}
                        >
                          lbs
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Body Type */}
                  <div className="flex flex-col gap-2" style={{ gap: "var(--spacing-sm)" }}>
                    <Label className="text-sm font-medium text-[#4A4A4A]">Body Type</Label>
                    <Select
                      value={profile.measurements.bodyType}
                      onValueChange={(value) =>
                        updateProfile({
                          measurements: {
                            ...profile.measurements,
                            bodyType: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger className="w-full rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 bg-white/80 h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-[16px] bg-white z-50">
                        <SelectItem value="Hourglass">Hourglass</SelectItem>
                        <SelectItem value="Pear">Pear</SelectItem>
                        <SelectItem value="Apple">Apple</SelectItem>
                        <SelectItem value="Rectangle">Rectangle</SelectItem>
                        <SelectItem value="Athletic">Athletic</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Size System */}
                  <div className="flex flex-col gap-2" style={{ gap: "var(--spacing-sm)" }}>
                    <Label className="text-sm font-medium text-[#4A4A4A]">Size System</Label>
                    <Select
                      value={profile.measurements.sizeSystem}
                      onValueChange={(value) =>
                        updateProfile({
                          measurements: {
                            ...profile.measurements,
                            sizeSystem: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger className="w-full rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 bg-white/80 h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-[16px] bg-white z-50">
                        <SelectItem value="US">US</SelectItem>
                        <SelectItem value="EU">EU</SelectItem>
                        <SelectItem value="UK">UK</SelectItem>
                        <SelectItem value="AU">AU</SelectItem>
                        <SelectItem value="JP">JP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Clothing Sizes */}
                  <div className="grid grid-cols-2 gap-4" style={{ gap: "var(--spacing-md)" }}>
                    <div className="flex flex-col gap-2" style={{ gap: "var(--spacing-sm)" }}>
                      <Label className="text-sm font-medium text-[#4A4A4A]">Shirt</Label>
                      <Select
                        value={profile.measurements.clothingSizes.shirt}
                        onValueChange={(value) =>
                          updateProfile({
                            measurements: {
                              ...profile.measurements,
                              clothingSizes: {
                                ...profile.measurements.clothingSizes,
                                shirt: value,
                              },
                            },
                          })
                        }
                      >
                        <SelectTrigger className="w-full rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 bg-white/80 h-10">
                          <SelectValue />
                        </SelectTrigger>
                      <SelectContent className="rounded-[16px] bg-white z-50">
                        {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2" style={{ gap: "var(--spacing-sm)" }}>
                      <Label className="text-sm font-medium text-[#4A4A4A]">Pants</Label>
                      <Select
                        value={profile.measurements.clothingSizes.pants}
                        onValueChange={(value) =>
                          updateProfile({
                            measurements: {
                              ...profile.measurements,
                              clothingSizes: {
                                ...profile.measurements.clothingSizes,
                                pants: value,
                              },
                            },
                          })
                        }
                      >
                        <SelectTrigger className="w-full rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 bg-white/80 h-10">
                          <SelectValue />
                        </SelectTrigger>
                      <SelectContent className="rounded-[16px] bg-white z-50">
                        {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2" style={{ gap: "var(--spacing-sm)" }}>
                      <Label className="text-sm font-medium text-[#4A4A4A]">Shoes</Label>
                      <Select
                        value={profile.measurements.clothingSizes.shoes}
                        onValueChange={(value) =>
                          updateProfile({
                            measurements: {
                              ...profile.measurements,
                              clothingSizes: {
                                ...profile.measurements.clothingSizes,
                                shoes: value,
                              },
                            },
                          })
                        }
                      >
                        <SelectTrigger className="w-full rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 bg-white/80 h-10">
                          <SelectValue />
                        </SelectTrigger>
                      <SelectContent className="rounded-[16px] bg-white z-50">
                        {Array.from({ length: 15 }, (_, i) => i + 4).map((size) => (
                          <SelectItem key={size} value={size.toString()}>
                            {size}
                          </SelectItem>
                        ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2" style={{ gap: "var(--spacing-sm)" }}>
                      <Label className="text-sm font-medium text-[#4A4A4A]">Dress</Label>
                      <Select
                        value={profile.measurements.clothingSizes.dress}
                        onValueChange={(value) =>
                          updateProfile({
                            measurements: {
                              ...profile.measurements,
                              clothingSizes: {
                                ...profile.measurements.clothingSizes,
                                dress: value,
                              },
                            },
                          })
                        }
                      >
                        <SelectTrigger className="w-full rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 h-10">
                          <SelectValue />
                        </SelectTrigger>
                      <SelectContent>
                        {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* C. Location & Weather Integration */}
        <motion.div
          className="rounded-[24px] bg-white/60 backdrop-blur-md border border-white/40 shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SectionHeader
            title="Location & Weather Integration"
            icon={MapPin}
            section="location"
          />
          <AnimatePresence>
            {expandedSections.has("location") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-6 pb-6"
                style={{ paddingTop: "var(--spacing-lg)", paddingBottom: "var(--spacing-lg)" }}
              >
                <div className="flex flex-col gap-6" style={{ gap: "var(--spacing-lg)" }}>
                  {/* Location Input */}
                  <div className="flex flex-col gap-2" style={{ gap: "var(--spacing-sm)" }}>
                    <Label className="text-sm font-medium text-[#4A4A4A]">Primary Location</Label>
                    <div className="flex gap-2" style={{ gap: "var(--spacing-sm)" }}>
                      <Input
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleLocationSearch(locationInput);
                          }
                        }}
                        placeholder="City or Address"
                        className="flex-1 rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 h-10"
                      />
                      <Button
                        onClick={() => handleLocationSearch(locationInput)}
                        className="rounded-[16px] bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white h-10 px-4"
                      >
                        Search
                      </Button>
                    </div>
                    <Button
                      onClick={handleUseCurrentLocation}
                      variant="outline"
                      className="w-full rounded-[16px] border-[#C8A2C8]/30 h-10"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Use Current Location
                    </Button>
                  </div>

                  {/* Weather Display */}
                  {weatherLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="w-6 h-6 animate-spin text-[#C8A2C8]" />
                    </div>
                  ) : weatherData ? (
                    <div className="rounded-[16px] bg-gradient-to-br from-[#E3F0FF] to-[#F5DCE7] p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-[#4A4A4A]">
                            {profile.location.city}, {profile.location.country}
                          </p>
                          <p className="text-2xl font-bold text-[#4A4A4A] mt-1">
                            {weatherData.temperature}°{profile.weatherPreferences.unit === "celsius" ? "C" : "F"}
                          </p>
                          <p className="text-sm text-[#8A8A8A]">
                            {weatherData.description || weatherData.condition}
                          </p>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-white/40 flex items-center justify-center">
                          {weatherData.condition?.toLowerCase().includes("clear") ||
                          weatherData.condition?.toLowerCase().includes("sun") ? (
                            <Sun className="w-8 h-8 text-[#C8A2C8]" />
                          ) : (
                            <Cloud className="w-8 h-8 text-[#C8A2C8]" />
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Weather Preferences */}
                  <div className="flex flex-col gap-6 pt-4 border-t border-white/40" style={{ gap: "var(--spacing-lg)", paddingTop: "var(--spacing-md)" }}>
                    <div className="flex flex-col gap-2" style={{ gap: "var(--spacing-sm)" }}>
                      <Label className="text-sm font-medium text-[#4A4A4A]">Temperature Unit</Label>
                      <div className="flex gap-2" style={{ gap: "var(--spacing-sm)" }}>
                      <button
                        onClick={() =>
                          updateProfile({
                            weatherPreferences: {
                              ...profile.weatherPreferences,
                              unit: "celsius",
                            },
                          })
                        }
                        className={`px-4 py-2 rounded-[12px] text-sm ${
                          profile.weatherPreferences.unit === "celsius"
                            ? "bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white"
                            : "bg-white/60 text-[#8A8A8A]"
                        }`}
                      >
                        °C
                      </button>
                      <button
                        onClick={() =>
                          updateProfile({
                            weatherPreferences: {
                              ...profile.weatherPreferences,
                              unit: "fahrenheit",
                            },
                          })
                        }
                        className={`px-4 py-2 rounded-[12px] text-sm ${
                          profile.weatherPreferences.unit === "fahrenheit"
                            ? "bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white"
                            : "bg-white/60 text-[#8A8A8A]"
                        }`}
                      >
                        °F
                      </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1" style={{ gap: "4px" }}>
                        <Label className="text-sm font-medium text-[#4A4A4A]">Include weather-based recommendations</Label>
                        <p className="text-xs text-[#8A8A8A]">
                          Get outfit suggestions based on weather
                        </p>
                      </div>
                      <Switch
                        checked={profile.weatherPreferences.enabled}
                        onCheckedChange={(checked) =>
                          updateProfile({
                            weatherPreferences: {
                              ...profile.weatherPreferences,
                              enabled: checked,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1" style={{ gap: "4px" }}>
                        <Label className="text-sm font-medium text-[#4A4A4A]">Notify me about weather changes</Label>
                        <p className="text-xs text-[#8A8A8A]">
                          Receive alerts when weather changes
                        </p>
                      </div>
                      <Switch
                        checked={profile.weatherPreferences.notifications}
                        onCheckedChange={(checked) =>
                          updateProfile({
                            weatherPreferences: {
                              ...profile.weatherPreferences,
                              notifications: checked,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-2" style={{ gap: "var(--spacing-sm)" }}>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-[#4A4A4A]">Weather Sensitivity</Label>
                        <span className="text-sm font-medium text-[#C8A2C8]">
                          {profile.weatherPreferences.sensitivity}/10
                        </span>
                      </div>
                    <Slider
                      value={[profile.weatherPreferences.sensitivity]}
                      onValueChange={(value) =>
                        updateProfile({
                          weatherPreferences: {
                            ...profile.weatherPreferences,
                            sensitivity: value[0],
                          },
                        })
                      }
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                      <div className="flex justify-between text-xs text-[#8A8A8A]">
                        <span>Not sensitive</span>
                        <span>Very sensitive</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* D. Style Preferences */}
        <motion.div
          className="rounded-[24px] bg-white/60 backdrop-blur-md border border-white/40 shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SectionHeader
            title="Style Preferences"
            icon={Palette}
            section="stylePreferences"
          />
          <AnimatePresence>
            {expandedSections.has("stylePreferences") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-6 pb-6"
                style={{ paddingTop: "var(--spacing-lg)", paddingBottom: "var(--spacing-lg)" }}
              >
                <div className="flex flex-col gap-6" style={{ gap: "var(--spacing-lg)" }}>
                  {/* Style Tags */}
                  <div className="flex flex-col gap-2" style={{ gap: "var(--spacing-sm)" }}>
                    <Label className="text-sm font-medium text-[#4A4A4A]">Style Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableStyleTags.map((tag) => {
                      const isSelected = profile.stylePreferences.tags.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => {
                            const newTags = isSelected
                              ? profile.stylePreferences.tags.filter((t) => t !== tag)
                              : [...profile.stylePreferences.tags, tag];
                            updateProfile({
                              stylePreferences: {
                                ...profile.stylePreferences,
                                tags: newTags,
                              },
                            });
                          }}
                          className={`px-4 py-2 rounded-full text-sm transition-all ${
                            isSelected
                              ? "bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white shadow-md"
                              : "bg-white/60 text-[#4A4A4A] border border-white/40"
                          }`}
                        >
                          {tag}
                          {isSelected && <X className="w-3 h-3 inline ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                  </div>

                  {/* Color Palette */}
                  <div className="flex flex-col gap-2" style={{ gap: "var(--spacing-sm)" }}>
                    <Label className="text-sm font-medium text-[#4A4A4A]">Color Palette</Label>
                  <div className="flex flex-wrap gap-2">
                    {profile.stylePreferences.colorPalette.map((color, index) => (
                      <div key={index} className="relative">
                        <div
                          className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                          style={{ backgroundColor: color }}
                        />
                        <button
                          onClick={() => {
                            const newPalette = profile.stylePreferences.colorPalette.filter(
                              (_, i) => i !== index
                            );
                            updateProfile({
                              stylePreferences: {
                                ...profile.stylePreferences,
                                colorPalette: newPalette,
                              },
                            });
                          }}
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#d4183d] flex items-center justify-center"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
                        updateProfile({
                          stylePreferences: {
                            ...profile.stylePreferences,
                            colorPalette: [
                              ...profile.stylePreferences.colorPalette,
                              newColor,
                            ],
                          },
                        });
                      }}
                      className="w-12 h-12 rounded-full border-2 border-dashed border-[#C8A2C8]/30 flex items-center justify-center text-[#8A8A8A] hover:border-[#C8A2C8] transition-colors"
                    >
                      +
                    </button>
                  </div>
                  </div>

                  {/* Patterns */}
                  <div className="flex flex-col gap-2" style={{ gap: "var(--spacing-sm)" }}>
                    <Label className="text-sm font-medium text-[#4A4A4A]">Pattern Preferences</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {availablePatterns.map((pattern) => {
                      const isSelected = profile.stylePreferences.patterns.includes(pattern);
                      return (
                        <button
                          key={pattern}
                          onClick={() => {
                            const newPatterns = isSelected
                              ? profile.stylePreferences.patterns.filter((p) => p !== pattern)
                              : [...profile.stylePreferences.patterns, pattern];
                            updateProfile({
                              stylePreferences: {
                                ...profile.stylePreferences,
                                patterns: newPatterns,
                              },
                            });
                          }}
                          className={`px-4 py-2 rounded-[12px] text-sm text-left transition-all ${
                            isSelected
                              ? "bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white"
                              : "bg-white/60 text-[#4A4A4A] border border-white/40"
                          }`}
                        >
                          {pattern}
                        </button>
                      );
                    })}
                  </div>
                  </div>

                  {/* Formality Level */}
                  <div className="flex flex-col gap-2" style={{ gap: "var(--spacing-sm)" }}>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-[#4A4A4A]">Formality Level</Label>
                      <span className="text-sm font-medium text-[#C8A2C8]">
                        {profile.stylePreferences.formalityLevel}/10
                      </span>
                    </div>
                  <Slider
                    value={[profile.stylePreferences.formalityLevel]}
                    onValueChange={(value) =>
                      updateProfile({
                        stylePreferences: {
                          ...profile.stylePreferences,
                          formalityLevel: value[0],
                        },
                      })
                    }
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-[#8A8A8A]">
                    <span>Very Casual</span>
                    <span>Very Formal</span>
                  </div>
                </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* E. AI Model Settings */}
        <motion.div
          className="rounded-[24px] bg-white/60 backdrop-blur-md border border-white/40 shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <SectionHeader
            title="AI Model Settings"
            icon={Settings}
            section="aiSettings"
          />
          <AnimatePresence>
            {expandedSections.has("aiSettings") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-6 pb-6"
                style={{ paddingTop: "var(--spacing-lg)", paddingBottom: "var(--spacing-lg)" }}
              >
                <div className="flex flex-col gap-6" style={{ gap: "var(--spacing-lg)" }}>
                  <div className="flex flex-col gap-2" style={{ gap: "var(--spacing-sm)" }}>
                    <Label className="text-sm font-medium text-[#4A4A4A]">AI Assistant Name</Label>
                    <Input
                      value={profile.aiSettings.assistantName}
                      onChange={(e) =>
                        updateProfile({
                          aiSettings: {
                            ...profile.aiSettings,
                            assistantName: e.target.value,
                          },
                        })
                      }
                      className="w-full rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 h-10"
                      placeholder="Style Assistant"
                    />
                  </div>

                  <div className="flex flex-col gap-2" style={{ gap: "var(--spacing-sm)" }}>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-[#4A4A4A]">Recommendation Creativity</Label>
                      <span className="text-sm font-medium text-[#C8A2C8]">
                        {profile.aiSettings.creativity}/10
                      </span>
                    </div>
                  <Slider
                    value={[profile.aiSettings.creativity]}
                    onValueChange={(value) =>
                      updateProfile({
                        aiSettings: {
                          ...profile.aiSettings,
                          creativity: value[0],
                        },
                      })
                    }
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                    <div className="flex justify-between text-xs text-[#8A8A8A]">
                      <span>Conservative</span>
                      <span>Creative</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2" style={{ gap: "var(--spacing-sm)" }}>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-[#4A4A4A]">Verbosity Level</Label>
                      <span className="text-sm font-medium text-[#C8A2C8]">
                        {profile.aiSettings.verbosity}/10
                      </span>
                    </div>
                  <Slider
                    value={[profile.aiSettings.verbosity]}
                    onValueChange={(value) =>
                      updateProfile({
                        aiSettings: {
                          ...profile.aiSettings,
                          verbosity: value[0],
                        },
                      })
                    }
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                    <div className="flex justify-between text-xs text-[#8A8A8A]">
                      <span>Brief</span>
                      <span>Detailed</span>
                    </div>
                  </div>

                  {/* Learning Frequency - Dropdown Select */}
                  <div className="flex flex-col gap-2" style={{ gap: "var(--spacing-sm)" }}>
                    <Label className="text-sm font-medium text-[#4A4A4A]">AI Learning Frequency</Label>
                    <Select
                      value={profile.aiSettings.learningFrequency}
                      onValueChange={(value) =>
                        updateProfile({
                          aiSettings: {
                            ...profile.aiSettings,
                            learningFrequency: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger className="rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 bg-white/80">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent className="rounded-[16px] bg-white z-50">
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="After every outfit">After every outfit</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-[#8A8A8A]">
                      Choose how often the AI should learn from your style choices
                    </p>
                  </div>

                    {/* Reset AI Learning Toggle */}
                    <div className="pt-6 border-t border-[#e2e8f0] mt-2">
                      <div className="flex items-start gap-5 mb-4">
                        <div className="relative mt-1">
                          <input
                            type="checkbox"
                            id="reset-learning-toggle"
                            checked={resetLearningEnabled}
                            onChange={(e) => setResetLearningEnabled(e.target.checked)}
                            className="sr-only"
                          />
                          <label
                            htmlFor="reset-learning-toggle"
                            className={`block w-[60px] h-8 rounded-full cursor-pointer transition-all duration-400 ${
                              resetLearningEnabled ? 'bg-[#48bb78]' : 'bg-[#cbd5e0]'
                            }`}
                          >
                            <span
                              className={`block w-6 h-6 bg-white rounded-full mt-1 transition-all duration-400 shadow-md ${
                                resetLearningEnabled ? 'ml-[32px]' : 'ml-1'
                              }`}
                            />
                          </label>
                        </div>
                        <div className="flex-1">
                          <span className="block text-base font-medium text-[#2d3748] mb-1">
                            Reset AI Learning
                          </span>
                          <p className="text-sm text-[#718096] leading-relaxed">
                            Clear all learned preferences and start fresh
                          </p>
                        </div>
                      </div>

                      <AnimatePresence>
                        {resetLearningEnabled && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="bg-[#fff5f5] border border-[#fed7d7] rounded-lg p-4 flex items-start gap-3"
                          >
                            <span className="text-lg text-[#f56565] flex-shrink-0">⚠️</span>
                            <p className="text-sm text-[#c53030] leading-relaxed m-0">
                              This will delete all AI learning data. This action cannot be undone.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {resetLearningEnabled && (
                        <Button
                          onClick={() => {
                            handleResetAI();
                            setResetLearningEnabled(false);
                          }}
                          variant="destructive"
                          className="w-full mt-4 rounded-[16px] bg-[#f56565] text-white hover:bg-[#e53e3e] h-10"
                        >
                          Confirm Reset AI Learning
                        </Button>
                      )}
                    </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* F. Notifications */}
        <motion.div
          className="rounded-[24px] bg-white/60 backdrop-blur-md border border-white/40 shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <SectionHeader
            title="Notifications"
            icon={Bell}
            section="notifications"
          />
          <AnimatePresence>
            {expandedSections.has("notifications") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-6 pb-6"
                style={{ paddingTop: "var(--spacing-lg)", paddingBottom: "var(--spacing-lg)" }}
              >
                <div className="flex flex-col gap-6" style={{ gap: "var(--spacing-lg)" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1" style={{ gap: "4px" }}>
                      <Label className="text-sm font-medium text-[#4A4A4A]">Push Notifications</Label>
                      <p className="text-xs text-[#8A8A8A]">
                        Receive push notifications on your device
                      </p>
                    </div>
                  <Switch
                    checked={profile.notifications.enabled}
                    onCheckedChange={(checked) =>
                      updateProfile({
                        notifications: {
                          ...profile.notifications,
                          enabled: checked,
                        },
                      })
                    }
                  />
                </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1" style={{ gap: "4px" }}>
                      <Label className="text-sm font-medium text-[#4A4A4A]">Email Notifications</Label>
                      <p className="text-xs text-[#8A8A8A]">
                        Receive notifications via email
                      </p>
                    </div>
                  <Switch
                    checked={profile.notifications.emailEnabled}
                    onCheckedChange={(checked) =>
                      updateProfile({
                        notifications: {
                          ...profile.notifications,
                          emailEnabled: checked,
                        },
                      })
                    }
                  />
                </div>

                  <div className="flex flex-col gap-4 pt-2 border-t border-white/40" style={{ gap: "var(--spacing-md)", paddingTop: "var(--spacing-md)" }}>
                    <Label className="text-sm font-medium text-[#4A4A4A]">Notification Types</Label>
                    {[
                      { id: "outfit_suggestions", label: "New outfit suggestions" },
                      { id: "weather_alerts", label: "Weather alerts" },
                      { id: "wardrobe_reminders", label: "Wardrobe maintenance reminders" },
                      { id: "style_tips", label: "Style tips and trends" },
                    ].map((type) => (
                      <div key={type.id} className="flex items-center justify-between">
                        <Label className="text-sm font-normal text-[#4A4A4A]">{type.label}</Label>
                      <Switch
                        checked={profile.notifications.types.includes(type.id)}
                        onCheckedChange={(checked) => {
                          const newTypes = checked
                            ? [...profile.notifications.types, type.id]
                            : profile.notifications.types.filter((t) => t !== type.id);
                          updateProfile({
                            notifications: {
                              ...profile.notifications,
                              types: newTypes,
                            },
                          });
                        }}
                      />
                    </div>
                      ))}
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t border-white/40" style={{ gap: "var(--spacing-sm)", paddingTop: "var(--spacing-md)" }}>
                    <Label className="text-sm font-medium text-[#4A4A4A]">Quiet Hours</Label>
                    <div className="grid grid-cols-2 gap-2" style={{ gap: "var(--spacing-sm)" }}>
                      <div className="flex flex-col gap-2" style={{ gap: "var(--spacing-sm)" }}>
                        <Label className="text-xs text-[#8A8A8A]">Start</Label>
                        <Input
                          type="time"
                          value={profile.notifications.quietHours.start}
                          onChange={(e) =>
                            updateProfile({
                              notifications: {
                                ...profile.notifications,
                                quietHours: {
                                  ...profile.notifications.quietHours,
                                  start: e.target.value,
                                },
                              },
                            })
                          }
                          className="w-full rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 h-10"
                        />
                      </div>
                      <div className="flex flex-col gap-2" style={{ gap: "var(--spacing-sm)" }}>
                        <Label className="text-xs text-[#8A8A8A]">End</Label>
                        <Input
                          type="time"
                          value={profile.notifications.quietHours.end}
                          onChange={(e) =>
                            updateProfile({
                              notifications: {
                                ...profile.notifications,
                                quietHours: {
                                  ...profile.notifications.quietHours,
                                  end: e.target.value,
                                },
                              },
                            })
                          }
                          className="w-full rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 h-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* G. Privacy & Data */}
        <motion.div
          className="rounded-[24px] bg-white/60 backdrop-blur-md border border-white/40 shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <SectionHeader
            title="Privacy & Data"
            icon={Settings}
            section="privacy"
          />
          <AnimatePresence>
            {expandedSections.has("privacy") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-6 pb-6"
                style={{ paddingTop: "var(--spacing-lg)", paddingBottom: "var(--spacing-lg)" }}
              >
                <div className="flex flex-col gap-6" style={{ gap: "var(--spacing-lg)" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1" style={{ gap: "4px" }}>
                      <Label className="text-sm font-medium text-[#4A4A4A]">Share anonymized data for AI improvement</Label>
                      <p className="text-xs text-[#8A8A8A]">
                        Help improve AI recommendations (data is anonymized)
                      </p>
                    </div>
                  <Switch
                    checked={profile.privacy.shareData}
                    onCheckedChange={(checked) =>
                      updateProfile({
                        privacy: {
                          ...profile.privacy,
                          shareData: checked,
                        },
                      })
                    }
                  />
                </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1" style={{ gap: "4px" }}>
                      <Label className="text-sm font-medium text-[#4A4A4A]">Make my outfits public</Label>
                      <p className="text-xs text-[#8A8A8A]">
                        Allow others to see your outfit combinations
                      </p>
                    </div>
                  <Switch
                    checked={profile.privacy.publicOutfits}
                    onCheckedChange={(checked) =>
                      updateProfile({
                        privacy: {
                          ...profile.privacy,
                          publicOutfits: checked,
                        },
                      })
                    }
                  />
                </div>

                  <Button
                    onClick={handleExportData}
                    variant="outline"
                    className="w-full rounded-[16px] border-[#C8A2C8]/30 text-[#4A4A4A] h-10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export My Data
                  </Button>

                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    variant="destructive"
                    className="w-full rounded-[16px] bg-[#d4183d] text-white hover:bg-[#b81535] h-10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Reset AI Confirmation */}
      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent className="rounded-[24px]">
          <DialogHeader>
            <DialogTitle>Reset AI Learning</DialogTitle>
          </DialogHeader>
          <p className="text-[#8A8A8A]">
            This will reset all AI learning data. The AI will start learning from
            scratch. Continue?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResetConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetAI}
              className="bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white"
            >
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="rounded-[24px]">
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
          </DialogHeader>
          <p className="text-[#8A8A8A]">
            Are you sure you want to delete your account? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              className="bg-[#d4183d]"
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

