import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Upload, Image as ImageIcon, Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useCloset, ClothingCategory, ClothingItem } from "../contexts/ClosetContext";

const AVAILABLE_TAGS = ["Casual", "Chic", "Workwear", "Formal", "Sporty", "Vintage", "Modern", "Bohemian", "Minimalist", "Streetwear"];
const SEASONS = ["Spring", "Summer", "Fall", "Winter"];
const COLORS = [
  "#FFFFFF", "#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF",
  "#FFA500", "#800080", "#FFC0CB", "#A52A2A", "#808080", "#FFD700", "#4B0082", "#FF1493"
];

interface AddClothingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: ClothingCategory;
  item?: ClothingItem | null; // For editing mode
}

export function AddClothingModal({
  open,
  onOpenChange,
  category: initialCategory,
  item: editItem,
}: AddClothingModalProps) {
  const { addItem, updateItem } = useCloset();
  const isEditMode = !!editItem;
  
  const [name, setName] = useState(editItem?.name || "");
  const [category, setCategory] = useState<ClothingCategory>(
    editItem?.category || initialCategory || "tops"
  );
  const [imageBase64, setImageBase64] = useState<string>(editItem?.imageBase64 || "");
  const [preview, setPreview] = useState<string>(
    editItem?.imageBase64
      ? `data:image/jpeg;base64,${editItem.imageBase64}`
      : editItem?.image || ""
  );
  const [tags, setTags] = useState<string[]>(editItem?.tags || []);
  const [color, setColor] = useState<string>(editItem?.color || "#F9F9F9");
  const [seasons, setSeasons] = useState<string[]>(editItem?.seasons || []);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Update form when editItem changes
  useEffect(() => {
    if (open && editItem) {
      setName(editItem.name);
      setCategory(editItem.category);
      setImageBase64(editItem.imageBase64 || "");
      setPreview(
        editItem.imageBase64
          ? `data:image/jpeg;base64,${editItem.imageBase64}`
          : editItem.image || ""
      );
      setTags(editItem.tags || []);
      setColor(editItem.color || "#F9F9F9");
      setSeasons(editItem.seasons || []);
    } else if (open && !editItem) {
      // Reset form for new item
      setName("");
      setCategory(initialCategory || "tops");
      setImageBase64("");
      setPreview("");
      setTags([]);
      setColor("#F9F9F9");
      setSeasons([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [open, editItem, initialCategory]);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (JPG, PNG, or WebP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data:image/...;base64, prefix if present
      const base64 = base64String.includes(",")
        ? base64String.split(",")[1]
        : base64String;
      setImageBase64(base64);
      setPreview(base64String);
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert("Failed to read image file");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const toggleTag = (tag: string) => {
    setTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const toggleSeason = (season: string) => {
    setSeasons(prev =>
      prev.includes(season)
        ? prev.filter(s => s !== season)
        : [...prev, season]
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert("Please enter a clothing name");
      return;
    }

    if (isEditMode && editItem) {
      // Update existing item
      const finalImageBase64 = imageBase64 || (preview.includes(",") ? preview.split(",")[1] : "");
      updateItem(editItem.id, {
        name: name.trim(),
        category,
        imageBase64: finalImageBase64 || editItem.imageBase64,
        tags,
        color,
        seasons,
      });
    } else {
      // Add new item
      const finalImageBase64 = imageBase64 || (preview.includes(",") ? preview.split(",")[1] : "");
      
      if (!finalImageBase64) {
        alert("Please upload an image");
        return;
      }

      addItem({
        name: name.trim(),
        category,
        imageBase64: finalImageBase64,
        tags,
        color,
        seasons,
      });
    }

    // Reset form
    handleCancel();
  };

  const handleCancel = () => {
    setName("");
    setCategory(initialCategory || "tops");
    setImageBase64("");
    setPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[24px] bg-white/95 backdrop-blur-md border border-white/40 shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-[#4A4A4A] mb-2">
            {isEditMode ? "Edit Clothing" : "Add New Clothing"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Image Upload with Drag & Drop */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-[#4A4A4A]">
              Clothing Photo
            </label>
            <div className="relative">
              {preview ? (
                <div className="relative rounded-[20px] overflow-hidden border-2 border-dashed border-[#C8A2C8]/30">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-64 object-cover"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setPreview("");
                      setImageBase64("");
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors z-10"
                  >
                    <X className="w-4 h-4 text-[#8A8A8A]" />
                  </button>
                </div>
              ) : (
                <div
                  ref={dropZoneRef}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center w-full h-64 rounded-[20px] border-2 border-dashed transition-all ${
                    isDragging
                      ? "border-[#C8A2C8] bg-gradient-to-br from-[#F5DCE7] to-[#E3F0FF] scale-105"
                      : "border-[#C8A2C8]/30 bg-gradient-to-br from-[#F5DCE7]/30 to-[#E3F0FF]/30 hover:border-[#C8A2C8]/50"
                  }`}
                >
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center cursor-pointer w-full h-full"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C8A2C8] to-[#E3B8E3] flex items-center justify-center mb-3">
                      {isUploading ? (
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      ) : (
                        <Upload className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <p className="text-[#8A8A8A] text-sm mb-1">
                      {isDragging ? "Drop image here" : "Click to upload or drag & drop"}
                    </p>
                    <p className="text-[#8A8A8A] text-xs">
                      PNG, JPG, WebP up to 5MB
                    </p>
                  </label>
                  <input
                    ref={fileInputRef}
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#4A4A4A]">
              Clothing Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Blue Denim Jacket"
              className="rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20"
            />
          </div>

          {/* Category Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#4A4A4A]">
              Category
            </label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as ClothingCategory)}
            >
              <SelectTrigger className="rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-[16px]">
                <SelectItem value="tops">Tops</SelectItem>
                <SelectItem value="bottoms">Bottoms</SelectItem>
                <SelectItem value="shoes">Shoes</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
                <SelectItem value="outfits">Outfits</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#4A4A4A]">
              Style Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      isSelected
                        ? "bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white shadow-md"
                        : "bg-white/60 border border-[#C8A2C8]/30 text-[#4A4A4A] hover:border-[#C8A2C8]/50"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#4A4A4A]">
              Primary Color
            </label>
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 rounded-[12px] border-2 border-white shadow-md"
                style={{ backgroundColor: color }}
              />
              <div className="flex-1 grid grid-cols-8 gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      color === c
                        ? "border-[#C8A2C8] scale-110 shadow-md"
                        : "border-white/60 hover:scale-105"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Season Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#4A4A4A]">
              Season
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SEASONS.map((season) => {
                const isSelected = seasons.includes(season);
                return (
                  <button
                    key={season}
                    type="button"
                    onClick={() => toggleSeason(season)}
                    className={`px-4 py-3 rounded-[12px] text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-gradient-to-r from-[#F5DCE7] to-[#E3F0FF] border-2 border-[#C8A2C8] text-[#4A4A4A]"
                        : "bg-white/60 border border-[#C8A2C8]/30 text-[#8A8A8A] hover:border-[#C8A2C8]/50"
                    }`}
                  >
                    {season}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1 rounded-[16px] border-[#C8A2C8]/30 text-[#4A4A4A] hover:bg-white/60"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 rounded-[16px] bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white shadow-lg hover:from-[#B892B8] hover:to-[#D3A8D3] transition-all"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

