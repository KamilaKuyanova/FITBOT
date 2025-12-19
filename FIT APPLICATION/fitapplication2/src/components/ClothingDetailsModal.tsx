import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Trash2, Edit, X, Heart, Plus } from "lucide-react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useCloset, ClothingItem } from "../contexts/ClosetContext";
import { AddClothingModal } from "./AddClothingModal";

interface ClothingDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ClothingItem | null;
}

export function ClothingDetailsModal({
  open,
  onOpenChange,
  item,
}: ClothingDetailsModalProps) {
  const { deleteItem } = useCloset();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!item) return null;

  const imageSrc = item.imageBase64
    ? `data:image/jpeg;base64,${item.imageBase64}`
    : item.image || "";

  const handleDelete = () => {
    deleteItem(item.id);
    setShowDeleteConfirm(false);
    onOpenChange(false);
  };

  const categoryLabels: Record<string, string> = {
    tops: "Tops",
    bottoms: "Bottoms",
    shoes: "Shoes",
    accessories: "Accessories",
    outfits: "Outfits",
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md rounded-[24px] bg-white/95 backdrop-blur-md border border-white/40 shadow-xl p-0 max-h-[90vh] overflow-hidden">
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

                {/* Image */}
                <div
                  className="w-full aspect-[3/4] relative overflow-hidden"
                  style={{ backgroundColor: item.color || "#F9F9F9" }}
                >
                  <ImageWithFallback
                    src={imageSrc}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                  <div>
                    <h3 className="text-2xl font-semibold text-[#4A4A4A] mb-2">
                      {item.name}
                    </h3>
                    <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-[#F5DCE7] to-[#E3F0FF]">
                      <p className="text-sm font-medium text-[#4A4A4A]">
                        {categoryLabels[item.category] || item.category}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  {(item.tags && item.tags.length > 0) || item.tag ? (
                    <div>
                      <p className="text-sm text-[#8A8A8A] mb-2">Style Tags</p>
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

                  {/* Seasons */}
                  {item.seasons && item.seasons.length > 0 && (
                    <div>
                      <p className="text-sm text-[#8A8A8A] mb-2">Season</p>
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

                  {/* Color */}
                  {item.color && (
                    <div>
                      <p className="text-sm text-[#8A8A8A] mb-2">Color</p>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-[12px] border-2 border-white shadow-md"
                          style={{ backgroundColor: item.color }}
                        />
                        <p className="text-base text-[#4A4A4A]">{item.color}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="p-6 pt-0 space-y-3 border-t border-white/40">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => setIsFavorite(!isFavorite)}
                      variant="outline"
                      className={`rounded-[16px] border-[#C8A2C8]/30 transition-all ${
                        isFavorite
                          ? "bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white border-transparent"
                          : "text-[#4A4A4A] hover:bg-white/60"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 mr-2 ${
                          isFavorite ? "fill-white" : ""
                        }`}
                      />
                      Favorite
                    </Button>
                    <Button
                      onClick={() => {
                        // TODO: Implement add to outfit functionality
                        alert("Add to Outfit functionality coming soon!");
                      }}
                      variant="outline"
                      className="rounded-[16px] border-[#C8A2C8]/30 text-[#4A4A4A] hover:bg-white/60"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Outfit
                    </Button>
                  </div>
                  <Button
                    onClick={() => setShowEditModal(true)}
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

      {/* Delete Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md rounded-[24px] bg-white/95 backdrop-blur-md border border-white/40 shadow-xl p-6">
          <h3 className="text-xl font-semibold text-[#4A4A4A] mb-2">
            Delete Item?
          </h3>
          <p className="text-[#8A8A8A] mb-6">
            Are you sure you want to delete "{item.name}"? This action cannot be
            undone.
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

      {/* Edit Modal */}
      <AddClothingModal
        open={showEditModal}
        onOpenChange={(open) => {
          setShowEditModal(open);
          if (!open) {
            // Refresh the details modal when edit closes
            onOpenChange(false);
            setTimeout(() => onOpenChange(true), 100);
          }
        }}
        category={item.category}
        item={item}
      />
    </>
  );
}

