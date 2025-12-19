import React, { useState } from "react";
import { motion } from "motion/react";
import { MapPin, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

interface LocationPickerModalProps {
  onClose: () => void;
  onSelect: (lat: number, lon: number) => void;
}

export function LocationPickerModal({ onClose, onSelect }: LocationPickerModalProps) {
  const [cityName, setCityName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useCoordinates, setUseCoordinates] = useState(false);

  const handleApply = async () => {
    setError(null);
    setIsLoading(true);

    try {
      let lat: number;
      let lon: number;

      if (useCoordinates) {
        // Use manual coordinates
        if (!latitude || !longitude) {
          throw new Error("Please provide both latitude and longitude");
        }
        lat = parseFloat(latitude);
        lon = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lon)) {
          throw new Error("Invalid coordinates. Please enter valid numbers.");
        }

        if (lat < -90 || lat > 90) {
          throw new Error("Latitude must be between -90 and 90");
        }

        if (lon < -180 || lon > 180) {
          throw new Error("Longitude must be between -180 and 180");
        }
      } else {
        // Use city name and geocoding API
        if (!cityName.trim()) {
          throw new Error("Please enter a city name");
        }

        const apiKey = import.meta.env.VITE_WEATHER_API_KEY || import.meta.env.VITE_WEATHER_API;
        
        if (!apiKey) {
          throw new Error("Weather API key not configured. Please set VITE_WEATHER_API_KEY in your .env file.");
        }

        const geoResponse = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName.trim())}&limit=1&appid=${apiKey}`
        );

        if (!geoResponse.ok) {
          throw new Error(`Geocoding failed: ${geoResponse.statusText}`);
        }

        const geoData = await geoResponse.json();

        if (!geoData || geoData.length === 0) {
          throw new Error(`City "${cityName}" not found. Please try a different city name.`);
        }

        lat = geoData[0].lat;
        lon = geoData[0].lon;
      }

      onSelect(lat, lon);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get location");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Location</DialogTitle>
          <DialogDescription>
            Choose a location by city name or coordinates
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex gap-2 mb-2">
            <Button
              variant={!useCoordinates ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setUseCoordinates(false);
                setError(null);
              }}
              className="flex-1"
            >
              City Name
            </Button>
            <Button
              variant={useCoordinates ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setUseCoordinates(true);
                setError(null);
              }}
              className="flex-1"
            >
              Coordinates
            </Button>
          </div>

          {!useCoordinates ? (
            <div className="grid gap-2">
              <Label htmlFor="city">City Name</Label>
              <Input
                id="city"
                placeholder="e.g., New York, London, Tokyo"
                value={cityName}
                onChange={(e) => {
                  setCityName(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isLoading) {
                    handleApply();
                  }
                }}
                disabled={isLoading}
              />
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="e.g., 40.7128"
                  value={latitude}
                  onChange={(e) => {
                    setLatitude(e.target.value);
                    setError(null);
                  }}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="e.g., -74.0060"
                  value={longitude}
                  onChange={(e) => {
                    setLongitude(e.target.value);
                    setError(null);
                  }}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm"
            >
              {error}
            </motion.div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={isLoading || (!useCoordinates && !cityName.trim()) || (useCoordinates && (!latitude || !longitude))}
            className="bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white hover:opacity-90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-2" />
                Apply
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

