/**
 * Type definitions for Global AI Outfit Generation
 */

export interface OutfitItem {
  category: 'outerwear' | 'tops' | 'bottoms' | 'shoes' | 'accessories' | 'dresses';
  type: string;
  color: string;
  details: string;
}

export interface GlobalOutfit {
  name: string;
  description: string;
  items: OutfitItem[];
}

export interface GlobalOutfitResponse {
  outfits: GlobalOutfit[];
}

export interface OutfitPreferences {
  gender?: 'male' | 'female' | 'non-binary' | 'other';
  age?: number;
  style?: 'casual' | 'streetwear' | 'classic' | 'sporty' | 'romantic' | 'business';
  occasion?: 'school' | 'university' | 'office' | 'date' | 'party' | 'travel' | 'home' | 'general';
  weather?: {
    temperature?: number;
    condition?: 'snow' | 'rain' | 'sun' | 'cloudy' | 'clear';
  };
  palette?: 'pastel' | 'neutral' | 'bright' | 'monochrome';
  budgetLevel?: 'low' | 'medium' | 'high';
  preferredColors?: string[];
  avoidItems?: string[];
}
