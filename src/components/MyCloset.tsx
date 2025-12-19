import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Filter, Search, X, CheckSquare, Square } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useCloset, ClothingCategory, ClothingItem } from "../contexts/ClosetContext";
import { ClothingCard } from "./ClothingCard";
import { ComprehensiveClothingForm } from "./ComprehensiveClothingForm";
import { DetailedClothingModal } from "./DetailedClothingModal";

export function MyCloset() {
  const [activeTab, setActiveTab] = useState<ClothingCategory>("tops");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const { getItemsByCategory, items, deleteItem, addItem } = useCloset();

  // Available tags from all items
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach((item) => {
      if (item.tags) {
        item.tags.forEach((tag) => tagSet.add(tag));
      }
      if (item.tag) {
        tagSet.add(item.tag);
      }
    });
    return Array.from(tagSet).sort();
  }, [items]);

  const categories: { id: ClothingCategory; label: string }[] = [
    { id: "tops", label: "Tops" },
    { id: "bottoms", label: "Bottoms" },
    { id: "shoes", label: "Shoes" },
    { id: "accessories", label: "Accessories" },
    { id: "outerwear", label: "Outerwear" },
    { id: "dresses", label: "Dresses" },
    { id: "activewear", label: "Activewear" },
    { id: "swimwear", label: "Swimwear" },
    { id: "underwear", label: "Underwear" },
    { id: "other", label: "Other" },
    { id: "outfits", label: "Outfits" },
  ];

  // Filter items based on search and tags (all items, not just active category)
  const filteredItems = useMemo(() => {
    let allItems = items.filter((item) => !item.isArchived);

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      allItems = allItems.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.brand?.toLowerCase().includes(query) ||
          item.tag?.toLowerCase().includes(query) ||
          item.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
          item.color?.toLowerCase().includes(query) ||
          item.material?.toLowerCase().includes(query) ||
          item.notes?.toLowerCase().includes(query) ||
          item.type?.toLowerCase().includes(query)
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      allItems = allItems.filter((item) => {
        const itemTags = [
          ...(item.tags || []),
          ...(item.tag ? [item.tag] : []),
        ];
        return selectedTags.some((tag) => itemTags.includes(tag));
      });
    }

    return allItems;
  }, [searchQuery, selectedTags, items]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleCardClick = (itemId: string) => {
    if (isMultiSelectMode) {
      handleItemSelect(itemId, !selectedItems.has(itemId));
    } else {
      setSelectedItem(itemId);
      setShowDetailsModal(true);
    }
  };

  const handleDoubleClick = (itemId: string) => {
    // Quick add to outfit (placeholder for now)
    const item = items.find((i) => i.id === itemId);
    if (item) {
      // TODO: Implement add to outfit functionality
      console.log("Add to outfit:", item.name);
    }
  };

  const handleLongPress = (itemId: string) => {
    // Enter multi-select mode with this item selected
    setIsMultiSelectMode(true);
    handleItemSelect(itemId, true);
  };

  const handleContextMenu = (e: React.MouseEvent, item: ClothingItem) => {
    e.preventDefault();
    // Context menu is handled by ClothingCard component
  };

  const handleItemSelect = (itemId: string, selected: boolean) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(itemId);
      } else {
        next.delete(itemId);
      }
      return next;
    });
  };

  const handleAddClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log("Add button clicked, opening modal");
    setShowAddModal(true);
    console.log("showAddModal state set to:", true);
    // Block body scroll when modal opens
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  };

  // Restore body scroll when modal closes
  useEffect(() => {
    if (!showAddModal && !showDetailsModal) {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'auto';
      }
    }
  }, [showAddModal, showDetailsModal]);

  const toggleTagFilter = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  const handleBulkDelete = () => {
    if (selectedItems.size === 0) return;
    if (confirm(`Delete ${selectedItems.size} item(s)? This action cannot be undone.`)) {
      selectedItems.forEach((id) => {
        deleteItem(id);
      });
      setSelectedItems(new Set());
      setIsMultiSelectMode(false);
    }
  };

  const exitMultiSelectMode = () => {
    setIsMultiSelectMode(false);
    setSelectedItems(new Set());
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N to add new item
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        handleAddClick();
      }
      
      // Delete key to delete selected items in multi-select mode
      if (e.key === "Delete" && isMultiSelectMode && selectedItems.size > 0) {
        e.preventDefault();
        handleBulkDelete();
      }
      
      // Escape to exit multi-select mode
      if (e.key === "Escape" && isMultiSelectMode) {
        e.preventDefault();
        exitMultiSelectMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMultiSelectMode, selectedItems.size]);

  return (
    <div className="min-h-screen pb-28 px-6 pt-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2>My Closet</h2>
              <p className="text-[#8A8A8A]">Your wardrobe collection</p>
            </div>
            <div className="flex gap-2">
              {isMultiSelectMode ? (
                <>
                  <Button
                    onClick={exitMultiSelectMode}
                    variant="outline"
                    className="rounded-[14px] border-[#C8A2C8]/30 text-[#4A4A4A]"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBulkDelete}
                    variant="destructive"
                    className="rounded-[14px] bg-[#d4183d] text-white"
                    disabled={selectedItems.size === 0}
                  >
                    Delete ({selectedItems.size})
                  </Button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsMultiSelectMode(true)}
                    className="w-12 h-12 rounded-[14px] bg-white/60 backdrop-blur-md border border-white/40 shadow-md flex items-center justify-center hover:bg-white transition-all"
                  >
                    <CheckSquare className="w-5 h-5 text-[#C8A2C8]" />
                  </button>
                  <button
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className="w-12 h-12 rounded-[14px] bg-white/60 backdrop-blur-md border border-white/40 shadow-md flex items-center justify-center hover:bg-white transition-all"
                  >
                    <Filter className="w-5 h-5 text-[#C8A2C8]" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8A8A] pointer-events-none z-10" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="pl-12 pr-10 rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 placeholder:text-[13px] placeholder:text-[#8A8A8A]"
              style={{
                paddingLeft: '52px',
                paddingRight: searchQuery ? '40px' : '16px',
                boxSizing: 'border-box',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8A8A] hover:text-[#4A4A4A] z-10"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filter Menu */}
          {showFilterMenu && availableTags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[16px] bg-white/60 backdrop-blur-md border border-white/40 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-[#4A4A4A]">Filter by Tags</p>
                <button
                  onClick={() => {
                    setSelectedTags([]);
                    setShowFilterMenu(false);
                  }}
                  className="text-xs text-[#C8A2C8] hover:text-[#B892B8]"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTagFilter(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        isSelected
                          ? "bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white"
                          : "bg-white/60 border border-[#C8A2C8]/30 text-[#4A4A4A] hover:border-[#C8A2C8]/50"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-auto p-1 bg-white/60 backdrop-blur-md border border-white/40 rounded-[16px] grid grid-cols-5 gap-1 overflow-x-auto">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="rounded-[12px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#C8A2C8] data-[state=active]:to-[#E3B8E3] data-[state=active]:text-white py-2"
              >
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            {categories.map((category) => {
              // Filter items for this specific category
              const categoryFilteredItems = filteredItems.filter(
                (item) => item.category === category.id
              );
              
              return (
                <TabsContent key={category.id} value={category.id} className="mt-6">
                  {categoryFilteredItems.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="grid gap-4 pb-20"
                      style={{
                        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                      }}
                    >
                      {categoryFilteredItems.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <ClothingCard
                            item={item}
                            onClick={() => handleCardClick(item.id)}
                            onDoubleClick={() => handleDoubleClick(item.id)}
                            onLongPress={() => handleLongPress(item.id)}
                            onContextMenu={handleContextMenu}
                            onFavoriteClick={toggleFavorite}
                            isFavorite={favorites.includes(item.id)}
                            isSelected={selectedItems.has(item.id)}
                            onSelect={handleItemSelect}
                          />
                        </motion.div>
                      ))}

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddClick}
                        className="rounded-[20px] bg-gradient-to-br from-[#C8A2C8]/20 to-[#E3B8E3]/20 backdrop-blur-md border-2 border-dashed border-[#C8A2C8]/50 shadow-lg hover:shadow-xl hover:border-[#C8A2C8] aspect-square flex flex-col items-center justify-center gap-3 transition-all duration-200 group"
                        aria-label="Add new clothing item"
                      >
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C8A2C8] to-[#E3B8E3] flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md">
                          <Plus className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-[#4A4A4A] font-medium group-hover:text-[#C8A2C8] transition-colors duration-200">Add New</p>
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-[24px] bg-white/40 backdrop-blur-md border-2 border-dashed border-[#C8A2C8]/30 p-12 flex flex-col items-center justify-center text-center"
                    >
                      {searchQuery || selectedTags.length > 0 ? (
                        <>
                          <h3 className="mb-2">No Items Found</h3>
                          <p className="text-[#8A8A8A] mb-6">
                            Try adjusting your search or filters
                          </p>
                          <button
                            onClick={() => {
                              setSearchQuery("");
                              setSelectedTags([]);
                            }}
                            className="h-12 px-8 rounded-[16px] bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white shadow-lg hover:from-[#B892B8] hover:to-[#D3A8D3] transition-all"
                          >
                            Clear Filters
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C8A2C8] to-[#E3B8E3] flex items-center justify-center mb-4">
                            <Plus className="w-10 h-10 text-white" />
                          </div>
                          <h3 className="mb-2">No Items Yet</h3>
                          <p className="text-[#8A8A8A] mb-6">
                            Start adding items to your {category.label.toLowerCase()}
                          </p>
                          <button
                            onClick={handleAddClick}
                            className="h-12 px-8 rounded-[16px] bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white shadow-lg hover:from-[#B892B8] hover:to-[#D3A8D3] transition-all"
                          >
                            Add First Item
                          </button>
                        </>
                      )}
                    </motion.div>
                  )}
                </TabsContent>
              );
            })}
          </AnimatePresence>
        </Tabs>
      </motion.div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log("FAB button clicked");
          handleAddClick(e);
        }}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white shadow-2xl flex items-center justify-center hover:from-[#B892B8] hover:to-[#D3A8D3] transition-all duration-200 cursor-pointer"
        style={{
          boxShadow: '0 8px 24px rgba(200, 162, 200, 0.4)'
        }}
        aria-label="Add new clothing item"
        type="button"
      >
        <Plus className="w-8 h-8" />
      </motion.button>

      {/* Modals */}
      <ComprehensiveClothingForm
        open={showAddModal}
        onOpenChange={(newOpen) => {
          console.log("Modal onOpenChange called with:", newOpen);
          setShowAddModal(newOpen);
          // Restore body scroll when modal closes
          if (!newOpen && typeof document !== 'undefined') {
            document.body.style.overflow = 'auto';
          }
        }}
        category={activeTab}
      />
      <DetailedClothingModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        item={
          selectedItem
            ? items.find((item) => item.id === selectedItem) || null
            : null
        }
      />
    </div>
  );
}
