import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Trash2,
  Edit,
  X,
  Heart,
  Plus,
  Share2,
  Archive,
  Calendar,
  Star,
  Tag,
  Palette,
  Droplets,
  DollarSign,
} from "lucide-react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useCloset, ClothingItem } from "../contexts/ClosetContext";
import { ComprehensiveClothingForm } from "./ComprehensiveClothingForm";

interface DetailedClothingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ClothingItem | null;
}

export function DetailedClothingModal({
  open,
  onOpenChange,
  item,
}: DetailedClothingModalProps) {
  const { deleteItem, archiveItem, logWear, updateItem } = useCloset();
  const [activeTab, setActiveTab] = useState<"view" | "edit">("view");
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  if (!item) return null;

  const imageSrc = item.imageBase64
    ? `data:image/jpeg;base64,${item.imageBase64}`
    : item.image || "";

  const handleDelete = () => {
    deleteItem(item.id);
    setShowDeleteConfirm(false);
    onOpenChange(false);
  };

  const handleArchive = () => {
    archiveItem(item.id, true);
    setShowArchiveConfirm(false);
    onOpenChange(false);
  };

  const handleWearThis = () => {
    logWear(item.id);
    // Show success notification
    alert("Wear logged successfully!");
  };

  const handleShare = () => {
    // Generate shareable link
    const shareUrl = `${window.location.origin}/item/${item.id}`;
    if (navigator.share) {
      navigator.share({
        title: item.name,
        text: `Check out my ${item.name} from my wardrobe!`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    }
  };

  const toggleFavorite = () => {
    updateItem(item.id, { isFavorite: !item.isFavorite });
  };

  const categoryLabels: Record<string, string> = {
    tops: "Tops",
    bottoms: "Bottoms",
    shoes: "Shoes",
    accessories: "Accessories",
    outerwear: "Outerwear",
    dresses: "Dresses",
    activewear: "Activewear",
    swimwear: "Swimwear",
    underwear: "Underwear",
    other: "Other",
    outfits: "Outfits",
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden rounded-[24px] bg-white/95 backdrop-blur-md border border-white/40 shadow-xl p-0">
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-full"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/40">
                  <button
                    onClick={() => onOpenChange(false)}
                    className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center hover:bg-white/80 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-[#4A4A4A]" />
                  </button>
                  <h2 className="text-lg font-semibold text-[#4A4A4A]">
                    Item Details
                  </h2>
                  <button
                    onClick={() => onOpenChange(false)}
                    className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center hover:bg-white/80 transition-colors"
                  >
                    <X className="w-5 h-5 text-[#4A4A4A]" />
                  </button>
                </div>

                <Tabs
                  value={activeTab}
                  onValueChange={(v) => setActiveTab(v as "view" | "edit")}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <TabsList className="mx-4 mt-4 grid w-auto grid-cols-2">
                    <TabsTrigger value="view">View</TabsTrigger>
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                  </TabsList>

                  <div className="flex-1 overflow-y-auto">
                    <TabsContent value="view" className="mt-4 space-y-4 px-4 pb-4">
                      {/* Image */}
                      <div
                        className="w-full aspect-[3/4] relative overflow-hidden rounded-[20px]"
                        style={{ backgroundColor: item.color || "#F9F9F9" }}
                      >
                        <ImageWithFallback
                          src={imageSrc}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Basic Info */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-2xl font-semibold text-[#4A4A4A] mb-2">
                            {item.name}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-[#F5DCE7] to-[#E3F0FF]">
                              <p className="text-sm font-medium text-[#4A4A4A]">
                                {categoryLabels[item.category] || item.category}
                              </p>
                            </div>
                            {item.type && (
                              <div className="inline-block px-4 py-2 rounded-full bg-white/60 border border-[#C8A2C8]/30">
                                <p className="text-sm text-[#4A4A4A]">{item.type}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Tags */}
                        {(item.tags && item.tags.length > 0) || item.tag ? (
                          <div>
                            <Label className="text-sm text-[#8A8A8A] mb-2 flex items-center gap-2">
                              <Tag className="w-4 h-4" />
                              Style Tags
                            </Label>
                            <div className="flex flex-wrap gap-2">
                              {item.tags?.map((tag) => (
                                <div
                                  key={tag}
                                  className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-[#F5DCE7] to-[#E3F0FF]"
                                >
                                  <p className="text-sm text-[#4A4A4A]">{tag}</p>
                                </div>
                              ))}
                              {item.tag && !item.tags?.includes(item.tag) && (
                                <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-[#F5DCE7] to-[#E3F0FF]">
                                  <p className="text-sm text-[#4A4A4A]">{item.tag}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : null}

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          {item.brand && (
                            <div>
                              <p className="text-xs text-[#8A8A8A] mb-1">Brand</p>
                              <p className="text-sm font-medium text-[#4A4A4A]">
                                {item.brand}
                              </p>
                            </div>
                          )}
                          {item.size && (
                            <div>
                              <p className="text-xs text-[#8A8A8A] mb-1">Size</p>
                              <p className="text-sm font-medium text-[#4A4A4A]">
                                {item.size}
                              </p>
                            </div>
                          )}
                          {item.color && (
                            <div>
                              <p className="text-xs text-[#8A8A8A] mb-1 flex items-center gap-2">
                                <Palette className="w-3 h-3" />
                                Color
                              </p>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                  style={{ backgroundColor: item.color }}
                                />
                                <p className="text-sm font-medium text-[#4A4A4A]">
                                  {item.color}
                                </p>
                              </div>
                            </div>
                          )}
                          {item.material && (
                            <div>
                              <p className="text-xs text-[#8A8A8A] mb-1 flex items-center gap-2">
                                <Droplets className="w-3 h-3" />
                                Material
                              </p>
                              <p className="text-sm font-medium text-[#4A4A4A]">
                                {item.material}
                              </p>
                            </div>
                          )}
                          {item.condition && (
                            <div>
                              <p className="text-xs text-[#8A8A8A] mb-1">Condition</p>
                              <p className="text-sm font-medium text-[#4A4A4A]">
                                {item.condition}
                              </p>
                            </div>
                          )}
                          {item.price && (
                            <div>
                              <p className="text-xs text-[#8A8A8A] mb-1 flex items-center gap-2">
                                <DollarSign className="w-3 h-3" />
                                Price
                              </p>
                              <p className="text-sm font-medium text-[#4A4A4A]">
                                {item.currency || "USD"} {item.price.toFixed(2)}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Seasons */}
                        {item.seasons && item.seasons.length > 0 && (
                          <div>
                            <p className="text-xs text-[#8A8A8A] mb-2">Season</p>
                            <div className="flex flex-wrap gap-2">
                              {item.seasons.map((season) => (
                                <div
                                  key={season}
                                  className="inline-block px-3 py-1 rounded-full bg-white/60 border border-[#C8A2C8]/30"
                                >
                                  <p className="text-sm text-[#4A4A4A]">{season}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Usage Stats */}
                        {(item.wearCount !== undefined || item.lastWornDate) && (
                          <div className="p-4 rounded-[16px] bg-white/60 border border-[#C8A2C8]/30">
                            <p className="text-xs text-[#8A8A8A] mb-2 flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              Usage Statistics
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                              {item.wearCount !== undefined && (
                                <div>
                                  <p className="text-2xl font-bold text-[#C8A2C8]">
                                    {item.wearCount}
                                  </p>
                                  <p className="text-xs text-[#8A8A8A]">Times Worn</p>
                                </div>
                              )}
                              {item.lastWornDate && (
                                <div>
                                  <p className="text-sm font-medium text-[#4A4A4A]">
                                    {new Date(item.lastWornDate).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-[#8A8A8A]">Last Worn</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Comfort Rating */}
                        {item.comfortRating && (
                          <div>
                            <p className="text-xs text-[#8A8A8A] mb-2 flex items-center gap-2">
                              <Star className="w-3 h-3" />
                              Comfort Rating
                            </p>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <Star
                                  key={rating}
                                  className={`w-5 h-5 ${
                                    rating <= item.comfortRating!
                                      ? "fill-[#C8A2C8] text-[#C8A2C8]"
                                      : "text-[#E0E0E0]"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {item.notes && (
                          <div>
                            <p className="text-xs text-[#8A8A8A] mb-2">Notes</p>
                            <p className="text-sm text-[#4A4A4A] whitespace-pre-wrap">
                              {item.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="edit" className="mt-4 px-4 pb-4">
                      <div className="space-y-4">
                        <p className="text-sm text-[#8A8A8A]">
                          Click the button below to edit this item with the comprehensive form.
                        </p>
                        <Button
                          onClick={() => setShowEditForm(true)}
                          className="w-full rounded-[16px] bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white shadow-lg hover:from-[#B892B8] hover:to-[#D3A8D3] transition-all"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Open Edit Form
                        </Button>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>

                {/* Action Buttons */}
                <div className="p-6 pt-0 space-y-3 border-t border-white/40 bg-white/40">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={toggleFavorite}
                      variant="outline"
                      className={`rounded-[16px] border-[#C8A2C8]/30 transition-all ${
                        item.isFavorite
                          ? "bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white border-transparent"
                          : "text-[#4A4A4A] hover:bg-white/60"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 mr-2 ${
                          item.isFavorite ? "fill-white" : ""
                        }`}
                      />
                      Favorite
                    </Button>
                    <Button
                      onClick={handleWearThis}
                      variant="outline"
                      className="rounded-[16px] border-[#C8A2C8]/30 text-[#4A4A4A] hover:bg-white/60"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Wear This
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={handleShare}
                      variant="outline"
                      className="rounded-[16px] border-[#C8A2C8]/30 text-[#4A4A4A] hover:bg-white/60"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      onClick={() => setShowArchiveConfirm(true)}
                      variant="outline"
                      className="rounded-[16px] border-[#C8A2C8]/30 text-[#4A4A4A] hover:bg-white/60"
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </Button>
                  </div>
                  <Button
                    onClick={() => setShowEditForm(true)}
                    className="w-full rounded-[16px] bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white shadow-lg hover:from-[#B892B8] hover:to-[#D3A8D3] transition-all"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Item
                  </Button>
                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    variant="destructive"
                    className="w-full rounded-[16px] bg-[#d4183d] text-white shadow-lg hover:bg-[#b81535] transition-all"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Item
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Edit Form Modal */}
      <ComprehensiveClothingForm
        open={showEditForm}
        onOpenChange={(open) => {
          setShowEditForm(open);
          if (!open) {
            // Refresh the view when edit closes
            setActiveTab("view");
          }
        }}
        item={item}
        category={item.category}
      />

      {/* Delete Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md rounded-[24px] bg-white/95 backdrop-blur-md border border-white/40 shadow-xl p-6">
          <h3 className="text-xl font-semibold text-[#4A4A4A] mb-2">
            Delete Item?
          </h3>
          <p className="text-[#8A8A8A] mb-6">
            Are you sure you want to permanently delete "{item.name}"? This action
            cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowDeleteConfirm(false)}
              variant="outline"
              className="flex-1 rounded-[16px] border-[#C8A2C8]/30 text-[#4A4A4A] hover:bg-white/60"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="destructive"
              className="flex-1 rounded-[16px] bg-[#d4183d] text-white shadow-lg hover:bg-[#b81535]"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation */}
      <Dialog open={showArchiveConfirm} onOpenChange={setShowArchiveConfirm}>
        <DialogContent className="max-w-md rounded-[24px] bg-white/95 backdrop-blur-md border border-white/40 shadow-xl p-6">
          <h3 className="text-xl font-semibold text-[#4A4A4A] mb-2">
            Archive Item?
          </h3>
          <p className="text-[#8A8A8A] mb-6">
            This will hide "{item.name}" from your main wardrobe view. You can
            unarchive it later.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowArchiveConfirm(false)}
              variant="outline"
              className="flex-1 rounded-[16px] border-[#C8A2C8]/30 text-[#4A4A4A] hover:bg-white/60"
            >
              Cancel
            </Button>
            <Button
              onClick={handleArchive}
              className="flex-1 rounded-[16px] bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white shadow-lg hover:from-[#B892B8] hover:to-[#D3A8D3] transition-all"
            >
              Archive
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


