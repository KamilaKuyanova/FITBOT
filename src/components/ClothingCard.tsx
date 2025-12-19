import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Heart, Loader2, Edit, Trash2, Plus } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ClothingItem } from "../contexts/ClosetContext";

interface ClothingCardProps {
  item: ClothingItem;
  onClick: () => void;
  onDoubleClick?: () => void;
  onLongPress?: () => void;
  onContextMenu?: (e: React.MouseEvent, item: ClothingItem) => void;
  onFavoriteClick?: (id: string) => void;
  isFavorite?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  isLoading?: boolean;
}

export function ClothingCard({
  item,
  onClick,
  onDoubleClick,
  onLongPress,
  onContextMenu,
  onFavoriteClick,
  isFavorite = false,
  isSelected = false,
  onSelect,
  isLoading = false,
}: ClothingCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const imageSrc = item.imageBase64
    ? `data:image/jpeg;base64,${item.imageBase64}`
    : item.image || "";

  // Handle long press
  const handleMouseDown = (e: React.MouseEvent) => {
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        if (onLongPress) {
          onLongPress();
        }
        setShowContextMenu(true);
        setContextMenuPosition({ x: e.clientX, y: e.clientY });
      }, 500); // 500ms for long press
    }
  };

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (onLongPress) {
      const touch = e.touches[0];
      longPressTimer.current = setTimeout(() => {
        if (onLongPress) {
          onLongPress();
        }
        setShowContextMenu(true);
        setContextMenuPosition({ x: touch.clientX, y: touch.clientY });
      }, 500);
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Handle double click
  const handleClick = (e: React.MouseEvent) => {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      // Double click detected
      if (onDoubleClick) {
        onDoubleClick();
      }
    } else {
      clickTimer.current = setTimeout(() => {
        onClick();
        clickTimer.current = null;
      }, 250); // 250ms delay to detect double click
    }
  };

  // Handle context menu
  const handleContextMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onContextMenu) {
      onContextMenu(e, item);
    }
    setShowContextMenu(true);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setShowContextMenu(false);
      }
    };

    if (showContextMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showContextMenu]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavoriteClick) {
      onFavoriteClick(item.id);
    }
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(item.id, !isSelected);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      onContextMenu={handleContextMenuClick}
      className={`relative w-full rounded-[20px] bg-white/60 backdrop-blur-md border-2 overflow-visible group text-left cursor-pointer transition-all duration-200 ${
        isSelected
          ? "border-[#C8A2C8] shadow-xl shadow-[#C8A2C8]/20"
          : "border-white/40 shadow-lg hover:shadow-xl"
      }`}
    >
      {/* Selection Checkbox - Only show in multi-select mode */}
      {onSelect && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSelectClick}
          className={`absolute top-3 left-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isSelected
              ? "bg-[#C8A2C8] border-2 border-white shadow-md"
              : "bg-white/90 backdrop-blur-sm border-2 border-white/60"
          }`}
        >
          {isSelected ? (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          ) : (
            <div className="w-3 h-3 rounded-full border-2 border-[#8A8A8A]" />
          )}
        </motion.button>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-30 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#C8A2C8] animate-spin" />
        </div>
      )}

      <div
        className="aspect-square relative overflow-hidden"
        style={{ backgroundColor: item.color || "#F9F9F9" }}
      >
        {!imageError && imageSrc ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-[#F5DCE7] to-[#E3F0FF] animate-pulse" />
            )}
            <ImageWithFallback
              src={imageSrc}
              alt={item.name}
              className={`w-full h-full object-cover transition-all duration-300 ${
                imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-110"
              } group-hover:scale-110`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F5DCE7] to-[#E3F0FF]">
            <p className="text-[#8A8A8A] text-sm">No Image</p>
          </div>
        )}

        {/* Favorite Button */}
        {onFavoriteClick && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart
              className={`w-5 h-5 transition-all ${
                isFavorite
                  ? "fill-[#C8A2C8] text-[#C8A2C8] scale-110"
                  : "text-[#8A8A8A]"
              }`}
            />
          </motion.button>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200" />
      </div>

      <div className="p-4">
        <h4 className="font-medium text-[#4A4A4A] mb-2 line-clamp-1">
          {item.name}
        </h4>
        {item.tag && (
          <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-[#F5DCE7] to-[#E3F0FF]">
            <p className="text-sm text-[#4A4A4A]">{item.tag}</p>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute z-50 bg-white/95 backdrop-blur-md rounded-[16px] shadow-xl border border-white/40 p-2 min-w-[160px]"
          style={{
            top: `${contextMenuPosition.y}px`,
            left: `${contextMenuPosition.x}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
              setShowContextMenu(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-[#4A4A4A] hover:bg-white/60 rounded-[12px] flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            View Details
          </button>
          {onDoubleClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onDoubleClick) {
                  onDoubleClick();
                }
                setShowContextMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-[#4A4A4A] hover:bg-white/60 rounded-[12px] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add to Outfit
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

