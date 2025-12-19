import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Upload, Loader2, Star, Calendar, DollarSign, Tag, Palette, Droplets, Heart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { useCloset, ClothingCategory, ClothingItem, CATEGORY_TYPES } from "../contexts/ClosetContext";

const STYLE_TAGS = [
  "Casual", "Formal", "Workwear", "Sport", "Chic", "Minimalist", 
  "Bohemian", "Streetwear", "Vintage", "Modern", "Classic", "Edgy"
];

const PATTERNS = [
  "Solid", "Striped", "Checked", "Floral", "Abstract", 
  "Animal Print", "Polka Dots", "Plaid", "Geometric", "Paisley"
];

const OCCASIONS = [
  "Everyday", "Work", "Party", "Wedding", "Vacation", 
  "Workout", "Date", "Formal Event", "Casual Outing"
];

const WEATHER_TYPES = ["Hot", "Warm", "Cool", "Cold", "Rainy", "Windy", "Snowy"];

const SEASONS = ["Spring", "Summer", "Fall", "Winter", "All-season"];

const CONDITIONS = ["New", "Excellent", "Good", "Fair", "Poor"];

const FITS = ["Slim", "Regular", "Loose", "Oversized"];

const FREQUENCY = ["Daily", "Weekly", "Monthly", "Rarely", "Never"];

const MATERIALS = [
  "Cotton", "Polyester", "Wool", "Silk", "Denim", "Leather", 
  "Linen", "Rayon", "Spandex", "Cashmere", "Bamboo", "Other"
];

const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const COLORS = [
  "#FFFFFF", "#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", 
  "#FF00FF", "#00FFFF", "#FFA500", "#800080", "#FFC0CB", "#A52A2A", 
  "#808080", "#FFD700", "#4B0082", "#FF1493", "#00CED1", "#FF6347"
];

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD"];

interface ComprehensiveClothingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: ClothingItem | null;
  category?: ClothingCategory;
}

export function ComprehensiveClothingForm({
  open,
  onOpenChange,
  item: editItem,
  category: initialCategory,
}: ComprehensiveClothingFormProps) {
  const { addItem, updateItem } = useCloset();
  const isEditMode = !!editItem;

  // Form state
  const [activeTab, setActiveTab] = useState("basic");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ClothingCategory>(initialCategory || "tops");
  const [type, setType] = useState("");
  const [brand, setBrand] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("#F9F9F9");
  const [material, setMaterial] = useState("");
  const [condition, setCondition] = useState<"New" | "Excellent" | "Good" | "Fair" | "Poor">("Good");
  const [pattern, setPattern] = useState("");
  const [fit, setFit] = useState<"Slim" | "Regular" | "Loose" | "Oversized">("Regular");
  const [tags, setTags] = useState<string[]>([]);
  const [occasion, setOccasion] = useState<string[]>([]);
  const [weatherCompatibility, setWeatherCompatibility] = useState<string[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [frequencyOfWear, setFrequencyOfWear] = useState<"Daily" | "Weekly" | "Monthly" | "Rarely" | "Never">("Weekly");
  const [comfortRating, setComfortRating] = useState([3]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [notes, setNotes] = useState("");

  // Image state
  const [imageBase64, setImageBase64] = useState<string>("");
  const [preview, setPreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [formError, setFormError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Brand suggestions
  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);
  const { items } = useCloset();

  // Load existing brands from items
  useEffect(() => {
    const brands = new Set<string>();
    items.forEach((item) => {
      if (item.brand) brands.add(item.brand);
    });
    setBrandSuggestions(Array.from(brands));
  }, [items]);

  // Initialize form from editItem
  useEffect(() => {
    if (open && editItem) {
      setName(editItem.name || "");
      setCategory(editItem.category);
      setType(editItem.type || "");
      setBrand(editItem.brand || "");
      setPurchaseDate(editItem.purchaseDate || "");
      setPrice(editItem.price?.toString() || "");
      setCurrency(editItem.currency || "USD");
      setSize(editItem.size || "");
      setColor(editItem.color || "#F9F9F9");
      setMaterial(editItem.material || "");
      setCondition(editItem.condition || "Good");
      setPattern(editItem.pattern || "");
      setFit(editItem.fit || "Regular");
      setTags(editItem.tags || []);
      setOccasion(editItem.occasion || []);
      setWeatherCompatibility(editItem.weatherCompatibility || []);
      setSeasons(editItem.seasons || []);
      setFrequencyOfWear(editItem.frequencyOfWear || "Weekly");
      setComfortRating([editItem.comfortRating || 3]);
      setIsFavorite(editItem.isFavorite || false);
      setNotes(editItem.notes || "");
      setImageBase64(editItem.imageBase64 || "");
      setPreview(
        editItem.imageBase64
          ? `data:image/jpeg;base64,${editItem.imageBase64}`
          : editItem.image || ""
      );
    } else if (open && !editItem) {
      // Reset form
      setName("");
      setCategory(initialCategory || "tops");
      setType("");
      setBrand("");
      setPurchaseDate("");
      setPrice("");
      setCurrency("USD");
      setSize("");
      setColor("#F9F9F9");
      setMaterial("");
      setCondition("Good");
      setPattern("");
      setFit("Regular");
      setTags([]);
      setOccasion([]);
      setWeatherCompatibility([]);
      setSeasons([]);
      setFrequencyOfWear("Weekly");
      setComfortRating([3]);
      setIsFavorite(false);
      setNotes("");
      setImageBase64("");
      setPreview("");
      setActiveTab("basic");
      setUploadError("");
      setFormError("");
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

  const validateImageFile = (file: File): string | null => {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      return 'Please upload JPG, PNG, WebP, or GIF images only';
    }
    
    if (file.size > MAX_SIZE) {
      return 'Image size must be less than 10MB';
    }
    
    return null;
  };

  const handleFile = (file: File) => {
    setUploadError("");
    setFormError("");
    
    const validationError = validateImageFile(file);
    if (validationError) {
      setUploadError(validationError);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setIsUploading(true);
    setUploadError("");
    
    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        const base64String = reader.result as string;
        if (!base64String) {
          throw new Error("Failed to read image file");
        }
        const base64 = base64String.includes(",")
          ? base64String.split(",")[1]
          : base64String;
        setImageBase64(base64);
        setPreview(base64String);
        setUploadError("");
      } catch (error) {
        setUploadError("Failed to process image file. Please try again.");
        setPreview("");
        setImageBase64("");
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      setUploadError("Failed to read image file. Please try a different image.");
      setIsUploading(false);
      setPreview("");
      setImageBase64("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleOccasion = (occ: string) => {
    setOccasion((prev) =>
      prev.includes(occ) ? prev.filter((o) => o !== occ) : [...prev, occ]
    );
  };

  const toggleWeather = (weather: string) => {
    setWeatherCompatibility((prev) =>
      prev.includes(weather)
        ? prev.filter((w) => w !== weather)
        : [...prev, weather]
    );
  };

  const toggleSeason = (season: string) => {
    setSeasons((prev) =>
      prev.includes(season)
        ? prev.filter((s) => s !== season)
        : [...prev, season]
    );
  };

  const handleSave = () => {
    console.log("handleSave called", { name, imageBase64: !!imageBase64, preview: !!preview, editItem: !!editItem });
    
    setFormError("");
    setUploadError("");
    
    // Validation: name is required
    if (!name.trim()) {
      setFormError("Please enter a clothing name");
      return;
    }
    
    // Validation: category is required
    if (!category) {
      setFormError("Please select a category");
      return;
    }

    // Make image optional for now - allow saving without image
    // if (!imageBase64 && !preview && !editItem?.image) {
    //   setFormError("Please upload an image");
    //   return;
    // }

    const finalImageBase64 =
      imageBase64 || (preview && preview.includes(",") ? preview.split(",")[1] : "");

    const itemData: Omit<ClothingItem, "id" | "createdAt" | "updatedAt"> = {
      name: name.trim(),
      category,
      type: type || undefined,
      brand: brand || undefined,
      purchaseDate: purchaseDate || undefined,
      price: price ? parseFloat(price) : undefined,
      currency: currency || undefined,
      size: size || undefined,
      color: color || undefined,
      material: material || undefined,
      condition: condition || undefined,
      pattern: pattern || undefined,
      fit: fit || undefined,
      tags: tags.length > 0 ? tags : undefined,
      occasion: occasion.length > 0 ? occasion : undefined,
      weatherCompatibility:
        weatherCompatibility.length > 0 ? weatherCompatibility : undefined,
      seasons: seasons.length > 0 ? seasons : undefined,
      frequencyOfWear: frequencyOfWear || undefined,
      comfortRating: comfortRating[0] || undefined,
      isFavorite: isFavorite || undefined,
      notes: notes || undefined,
      imageBase64: finalImageBase64 || editItem?.imageBase64 || undefined,
      image: !finalImageBase64 && !editItem?.imageBase64 ? preview : undefined,
    };

    try {
      if (isEditMode && editItem) {
        console.log("Updating item:", editItem.id, itemData);
        updateItem(editItem.id, itemData);
      } else {
        console.log("Adding new item:", itemData);
        addItem(itemData);
        console.log("Item added successfully");
      }
      handleCancel();
    } catch (error) {
      console.error("Error saving item:", error);
      setFormError("Failed to save item. Please try again.");
    }
  };

  const handleCancel = () => {
    setFormError("");
    setUploadError("");
    setName("");
    setCategory(initialCategory || "tops");
    setType("");
    setBrand("");
    setPurchaseDate("");
    setPrice("");
    setCurrency("USD");
    setSize("");
    setColor("#F9F9F9");
    setMaterial("");
    setCondition("Good");
    setPattern("");
    setFit("Regular");
    setTags([]);
    setOccasion([]);
    setWeatherCompatibility([]);
    setSeasons([]);
    setFrequencyOfWear("Weekly");
    setComfortRating([3]);
    setIsFavorite(false);
    setNotes("");
    setImageBase64("");
    setPreview("");
    setActiveTab("basic");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onOpenChange(false);
  };

  const availableTypes = CATEGORY_TYPES[category] || [];

  // Debug logging
  useEffect(() => {
    console.log("ComprehensiveClothingForm render", { open, isEditMode });
  }, [open, isEditMode]);

  // Reset form when opening for new item
  useEffect(() => {
    if (open && !isEditMode) {
      // Reset all form fields when opening for a new item
      setName("");
      setCategory(initialCategory || "tops");
      setType("");
      setBrand("");
      setPurchaseDate("");
      setPrice("");
      setCurrency("USD");
      setSize("");
      setColor("#F9F9F9");
      setMaterial("");
      setCondition("Good");
      setPattern("");
      setFit("Regular");
      setTags([]);
      setOccasion([]);
      setWeatherCompatibility([]);
      setSeasons([]);
      setFrequencyOfWear("Weekly");
      setComfortRating([3]);
      setIsFavorite(false);
      setNotes("");
      setImageBase64("");
      setPreview("");
      setActiveTab("basic");
      setFormError("");
      setUploadError("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [open, isEditMode, initialCategory]);

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      console.log("Dialog onOpenChange called", newOpen);
      onOpenChange(newOpen);
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden rounded-[24px] bg-white/95 backdrop-blur-md border border-white/40 shadow-xl p-0">
        <DialogHeader className="p-6 border-b border-white/40">
          <DialogTitle className="text-2xl font-semibold text-[#4A4A4A]">
            {isEditMode ? "Edit Clothing Item" : "Add New Clothing Item"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[calc(90vh-80px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-6 mt-4 grid w-auto grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="attributes">Attributes</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <TabsContent value="basic" className="space-y-6 mt-4">
                {/* Image Upload */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-[#4A4A4A]">
                    Clothing Photo <span className="text-red-500">*</span>
                  </Label>
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
                            setUploadError("");
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
                          uploadError
                            ? "border-red-300 bg-red-50/50"
                            : isDragging
                            ? "border-[#C8A2C8] bg-gradient-to-br from-[#F5DCE7] to-[#E3F0FF] scale-105"
                            : "border-[#C8A2C8]/30 bg-gradient-to-br from-[#F5DCE7]/30 to-[#E3F0FF]/30 hover:border-[#C8A2C8]/50"
                        }`}
                      >
                        <label
                          htmlFor="image-upload"
                          className="flex flex-col items-center justify-center cursor-pointer w-full h-full"
                        >
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                            uploadError
                              ? "bg-red-200"
                              : "bg-gradient-to-br from-[#C8A2C8] to-[#E3B8E3]"
                          }`}>
                            {isUploading ? (
                              <Loader2 className="w-8 h-8 text-white animate-spin" />
                            ) : uploadError ? (
                              <X className="w-8 h-8 text-red-600" />
                            ) : (
                              <Upload className="w-8 h-8 text-white" />
                            )}
                          </div>
                          <p className={`text-sm mb-1 ${
                            uploadError ? "text-red-600" : "text-[#8A8A8A]"
                          }`}>
                            {uploadError
                              ? "Upload failed - try again"
                              : isDragging
                              ? "Drop image here"
                              : "Click to upload or drag & drop"}
                          </p>
                          <p className="text-[#8A8A8A] text-xs">
                            PNG, JPG, WebP up to 10MB
                          </p>
                        </label>
                        <input
                          ref={fileInputRef}
                          id="image-upload"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                  {uploadError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2"
                    >
                      <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">Upload Error</p>
                        <p className="text-sm text-red-600 mt-0.5">{uploadError}</p>
                      </div>
                      <button
                        onClick={() => setUploadError("")}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        aria-label="Dismiss error"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#4A4A4A]">
                    Item Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Blue Denim Jacket"
                    className="w-full rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 h-10"
                  />
                </div>

                {/* Category and Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#4A4A4A]">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={category}
                      onValueChange={(value) => {
                        setCategory(value as ClothingCategory);
                        setType(""); // Reset type when category changes
                      }}
                    >
                      <SelectTrigger className="w-full rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-[16px]">
                        <SelectItem value="tops">Tops</SelectItem>
                        <SelectItem value="bottoms">Bottoms</SelectItem>
                        <SelectItem value="shoes">Shoes</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                        <SelectItem value="outerwear">Outerwear</SelectItem>
                        <SelectItem value="dresses">Dresses</SelectItem>
                        <SelectItem value="activewear">Activewear</SelectItem>
                        <SelectItem value="swimwear">Swimwear</SelectItem>
                        <SelectItem value="underwear">Underwear</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#4A4A4A]">Type</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger className="w-full rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 h-10">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-[16px]">
                        {availableTypes.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Brand */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#4A4A4A]">Brand</Label>
                  <div className="relative">
                    <Input
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g., Nike, Zara"
                      className="w-full rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 h-10"
                      list="brand-suggestions"
                    />
                    {brandSuggestions.length > 0 && (
                      <datalist id="brand-suggestions">
                        {brandSuggestions.map((b) => (
                          <option key={b} value={b} />
                        ))}
                      </datalist>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-6 mt-4">
                {/* Purchase Date and Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#4A4A4A] flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Purchase Date
                    </Label>
                    <Input
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="w-full rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#4A4A4A] flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Price
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        className="flex-1 rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 h-10"
                      />
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="w-20 rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-[16px]">
                          {CURRENCIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Size and Color */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#4A4A4A]">Size</Label>
                    <div className="relative">
                      <Input
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        placeholder="e.g., M, 8, 38"
                        className="w-full rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 h-10"
                        list="size-suggestions"
                      />
                      <datalist id="size-suggestions">
                        {COMMON_SIZES.map((s) => (
                          <option key={s} value={s} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#4A4A4A] flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Color
                    </Label>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-[12px] border-2 border-white shadow-md"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex-1 grid grid-cols-9 gap-2">
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
                </div>

                {/* Material and Condition */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#4A4A4A] flex items-center gap-2">
                      <Droplets className="w-4 h-4" />
                      Material
                    </Label>
                    <div className="relative">
                      <Input
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                        placeholder="e.g., Cotton, Polyester"
                        className="w-full rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 h-10"
                        list="material-suggestions"
                      />
                      <datalist id="material-suggestions">
                        {MATERIALS.map((m) => (
                          <option key={m} value={m} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#4A4A4A]">Condition</Label>
                    <Select value={condition} onValueChange={(v) => setCondition(v as typeof condition)}>
                      <SelectTrigger className="w-full rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-[16px]">
                        {CONDITIONS.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="attributes" className="space-y-6 mt-4">
                {/* Style Tags */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#4A4A4A] flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Style Tags
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {STYLE_TAGS.map((tag) => {
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

                {/* Pattern and Fit */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#4A4A4A]">Pattern</Label>
                    <Select value={pattern} onValueChange={setPattern}>
                      <SelectTrigger className="w-full rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 h-10">
                        <SelectValue placeholder="Select pattern" />
                      </SelectTrigger>
                      <SelectContent className="rounded-[16px]">
                        {PATTERNS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#4A4A4A]">Fit</Label>
                    <Select value={fit} onValueChange={(v) => setFit(v as typeof fit)}>
                      <SelectTrigger className="w-full rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-[16px]">
                        {FITS.map((f) => (
                          <SelectItem key={f} value={f}>
                            {f}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Occasion */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#4A4A4A]">Occasion</Label>
                  <div className="flex flex-wrap gap-2">
                    {OCCASIONS.map((occ) => {
                      const isSelected = occasion.includes(occ);
                      return (
                        <button
                          key={occ}
                          type="button"
                          onClick={() => toggleOccasion(occ)}
                          className={`px-4 py-2 rounded-full text-sm transition-all ${
                            isSelected
                              ? "bg-gradient-to-r from-[#F5DCE7] to-[#E3F0FF] border-2 border-[#C8A2C8] text-[#4A4A4A]"
                              : "bg-white/60 border border-[#C8A2C8]/30 text-[#8A8A8A] hover:border-[#C8A2C8]/50"
                          }`}
                        >
                          {occ}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Weather Compatibility */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#4A4A4A]">Weather Compatibility</Label>
                  <div className="flex flex-wrap gap-2">
                    {WEATHER_TYPES.map((weather) => {
                      const isSelected = weatherCompatibility.includes(weather);
                      return (
                        <button
                          key={weather}
                          type="button"
                          onClick={() => toggleWeather(weather)}
                          className={`px-4 py-2 rounded-full text-sm transition-all ${
                            isSelected
                              ? "bg-gradient-to-r from-[#E3F0FF] to-[#E8F5E9] border-2 border-[#C8A2C8] text-[#4A4A4A]"
                              : "bg-white/60 border border-[#C8A2C8]/30 text-[#8A8A8A] hover:border-[#C8A2C8]/50"
                          }`}
                        >
                          {weather}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Seasons */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#4A4A4A]">Season</Label>
                  <div className="grid grid-cols-3 gap-2">
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
              </TabsContent>

              <TabsContent value="usage" className="space-y-6 mt-4">
                {/* Frequency of Wear */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#4A4A4A]">Frequency of Wear</Label>
                  <Select
                    value={frequencyOfWear}
                    onValueChange={(v) => setFrequencyOfWear(v as typeof frequencyOfWear)}
                  >
                    <SelectTrigger className="w-full rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-[16px]">
                      {FREQUENCY.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Comfort Rating */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#4A4A4A] flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Comfort Rating: {comfortRating[0]}/5
                  </Label>
                  <div className="px-2">
                    <Slider
                      value={comfortRating}
                      onValueChange={setComfortRating}
                      min={1}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-[#8A8A8A] mt-1">
                      <span>Uncomfortable</span>
                      <span>Very Comfortable</span>
                    </div>
                  </div>
                </div>

                {/* Favorite Toggle */}
                <div className="flex items-center justify-between p-4 rounded-[16px] bg-white/60 border border-[#C8A2C8]/30">
                  <Label className="text-sm font-medium text-[#4A4A4A] flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Mark as Favorite
                  </Label>
                  <button
                    type="button"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`w-12 h-6 rounded-full transition-all ${
                      isFavorite
                        ? "bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3]"
                        : "bg-[#8A8A8A]/30"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                        isFavorite ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#4A4A4A]">Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional comments, care instructions, etc."
                    className="w-full rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 min-h-[100px] resize-none"
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>

          {/* Action Buttons */}
          <div className="p-6 border-t border-white/40 bg-white/40 space-y-3">
            {formError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2"
              >
                <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Validation Error</p>
                  <p className="text-sm text-red-600 mt-0.5">{formError}</p>
                </div>
                <button
                  onClick={() => setFormError("")}
                  className="text-red-600 hover:text-red-800 transition-colors"
                  aria-label="Dismiss error"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
            <div className="flex gap-3">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 rounded-[16px] border-[#C8A2C8]/30 text-[#4A4A4A] hover:bg-white/60 h-12"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 rounded-[16px] bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white shadow-lg hover:from-[#B892B8] hover:to-[#D3A8D3] transition-all h-12"
              >
                {isEditMode ? "Update Item" : "Save Item"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

