import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock user wardrobe data (in production, this would come from a database)
const mockWardrobeData = {
  totalItems: 128,
  totalOutfits: 42,
  categories: {
    tops: 45,
    bottoms: 32,
    shoes: 28,
    accessories: 23
  },
  stylePreferences: ["Casual", "Chic", "Minimalist"]
};

// AI Chat Endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate context-aware response
    const response = generateAIResponse(message, context || mockWardrobeData);

    res.json({
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// AI Response Generator (Context-aware)
function generateAIResponse(userMessage, wardrobeData) {
  const message = userMessage.toLowerCase();
  const { totalItems, totalOutfits, categories, stylePreferences } = wardrobeData;

  // Greeting responses
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return `Hello! I'm your AI style assistant. I can see you have ${totalItems} items in your wardrobe and ${totalOutfits} saved outfits. Your style preferences include ${stylePreferences.join(', ')}. How can I help you today?`;
  }

  // Inventory queries
  if (message.includes('inventory') || message.includes('items') || message.includes('wardrobe')) {
    return `Your wardrobe summary:\n• ${categories.tops} Tops\n• ${categories.bottoms} Bottoms\n• ${categories.shoes} Pairs of Shoes\n• ${categories.accessories} Accessories\n• Total: ${totalItems} Items\n• ${totalOutfits} Saved Outfits\n\nYour style: ${stylePreferences.join(', ')}\n\nWhat would you like to know about your wardrobe?`;
  }

  // Outfit creation requests
  if (message.includes('outfit') && (message.includes('create') || message.includes('make') || message.includes('suggest'))) {
    const eventType = message.includes('evening') ? 'evening' : 
                     message.includes('business') ? 'business' :
                     message.includes('casual') ? 'casual' : 'general';
    
    if (eventType === 'evening' && message.includes('chic')) {
      return `For a chic evening event, I recommend pairing one of your elegant pieces with accessories. Based on your ${totalItems} items, I suggest: a sophisticated top from your collection, paired with statement accessories. Would you like me to show you specific combinations?`;
    }
    return `I can help you create a ${eventType} outfit! You have ${categories.tops} tops, ${categories.bottoms} bottoms, and ${categories.shoes} pairs of shoes to work with. What's the occasion?`;
  }

  // Style recommendations
  if (message.includes('what should i wear') || message.includes('recommend')) {
    if (message.includes('business casual') || message.includes('meeting')) {
      return `For a business casual meeting, I recommend: a professional top (you have ${categories.tops} options), paired with tailored bottoms (${categories.bottoms} available), and comfortable yet polished shoes. Your minimalist style preference works perfectly for this!`;
    }
    return `Based on your ${totalItems} items and ${stylePreferences.join(', ')} style preferences, I can suggest several options. What's the occasion or weather like today?`;
  }

  // Matching requests
  if (message.includes('match') || message.includes('pair')) {
    return `I can help you match items! You have ${categories.tops} tops, ${categories.bottoms} bottoms, and ${categories.shoes} pairs of shoes. Which item would you like to match? For example, "Match my blue shirt" or "What goes with my white sneakers?"`;
  }

  // Style tips
  if (message.includes('style') && message.includes('tip')) {
    return `Here's a style tip based on your preferences:\n\nSince you love ${stylePreferences.join(' and ')}, try mixing textures and subtle patterns. With ${totalItems} items, you can create ${totalOutfits}+ unique combinations. Remember: less is more with minimalist style - focus on quality pieces that work together!`;
  }

  // Default responses
  const defaultResponses = [
    `I understand you're asking about "${userMessage}". Based on your wardrobe of ${totalItems} items and your ${stylePreferences.join(', ')} style, I can help you with outfit suggestions, item matching, or style advice. What specifically would you like help with?`,
    `Great question! With ${totalItems} items in your closet and ${totalOutfits} saved outfits, you have plenty of options. Would you like me to suggest a specific outfit combination or help you find items that match?`,
    `I'm here to help with your style! You have ${categories.tops} tops, ${categories.bottoms} bottoms, and ${categories.shoes} pairs of shoes. Try asking me to "create an outfit for [occasion]" or "show me my [color/style] items".`,
  ];

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Profile Endpoints
app.get('/api/profile', async (req, res) => {
  try {
    // In production, this would fetch from a database
    // For now, return mock data or empty profile
    res.json({
      userProfile: {
        personalInfo: {
          name: "Kamila Martinez",
          bio: "",
          gender: "Prefer not to say",
          avatarUrl: ""
        },
        measurements: {
          height: { value: 165, unit: "cm" },
          weight: { value: 60, unit: "kg" },
          bodyType: "Hourglass",
          sizeSystem: "US",
          clothingSizes: {
            shirt: "M",
            pants: "M",
            shoes: "8",
            dress: "M"
          }
        },
        location: {
          city: "New York",
          country: "United States",
          coordinates: { lat: 40.7128, lon: -74.0060 },
          timezone: "America/New_York"
        },
        weatherPreferences: {
          unit: "celsius",
          enabled: true,
          notifications: true,
          sensitivity: 5
        },
        stylePreferences: {
          tags: ["Casual", "Chic", "Minimalist"],
          colorPalette: ["#F5DCE7", "#E3F0FF", "#E8F5E9", "#C8A2C8"],
          patterns: ["Solids"],
          formalityLevel: 5
        },
        aiSettings: {
          assistantName: "Style Assistant",
          creativity: 6,
          verbosity: 5,
          learningFrequency: "Daily"
        },
        notifications: {
          enabled: true,
          emailEnabled: true,
          types: ["outfit_suggestions", "weather_alerts"],
          quietHours: { start: "22:00", end: "08:00" }
        },
        privacy: {
          shareData: false,
          publicOutfits: false
        }
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.post('/api/profile/update', async (req, res) => {
  try {
    const { userProfile } = req.body;
    
    if (!userProfile) {
      return res.status(400).json({ error: 'Profile data is required' });
    }

    // In production, this would save to a database
    // For now, just return success
    console.log('Profile updated:', userProfile);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      userProfile
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Location/Weather Endpoint
app.get('/api/weather/location', async (req, res) => {
  try {
    const { city } = req.query;
    
    if (!city) {
      return res.status(400).json({ error: 'City is required' });
    }

    // Using OpenWeatherMap Geocoding API
    const API_KEY = process.env.OPENWEATHER_API_KEY || process.env.VITE_WEATHER_API_KEY;
    
    if (!API_KEY || API_KEY === 'demo_key') {
      // Return mock data if API key not configured
      return res.json({
        city: city,
        country: "United States",
        coordinates: { lat: 40.7128, lon: -74.0060 },
        timezone: "America/New_York"
      });
    }

    const GEOCODE_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;
    
    const response = await fetch(GEOCODE_URL);
    
    if (!response.ok) {
      throw new Error('Geocoding API error');
    }

    const data = await response.json();
    
    if (data.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    const location = data[0];
    
    res.json({
      city: location.name,
      country: location.country,
      coordinates: {
        lat: location.lat,
        lon: location.lon
      },
      timezone: "UTC" // In production, use a timezone API
    });
  } catch (error) {
    console.error('Location search error:', error);
    res.status(500).json({ error: 'Failed to search location' });
  }
});

// AI Reset Endpoint
app.post('/api/ai/reset', async (req, res) => {
  try {
    // In production, this would reset AI learning data in the database
    console.log('AI learning reset requested');
    
    res.json({
      success: true,
      message: 'AI learning has been reset'
    });
  } catch (error) {
    console.error('AI reset error:', error);
    res.status(500).json({ error: 'Failed to reset AI learning' });
  }
});

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'FITBOT AI Backend' });
});

// ============================================
// WARDROBE API ENDPOINTS
// ============================================

// Mock wardrobe items storage (in production, this would be a database)
let wardrobeItems = [];

// GET /api/wardrobe/items - Get all items with filtering/pagination
app.get('/api/wardrobe/items', (req, res) => {
  try {
    const { category, tags, color, season, condition, search, page = 1, limit = 50 } = req.query;
    
    let filtered = [...wardrobeItems];
    
    // Apply filters
    if (category) {
      filtered = filtered.filter(item => item.category === category);
    }
    
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filtered = filtered.filter(item => {
        const itemTags = [...(item.tags || []), ...(item.tag ? [item.tag] : [])];
        return tagArray.some(tag => itemTags.includes(tag));
      });
    }
    
    if (color) {
      filtered = filtered.filter(item => item.color === color);
    }
    
    if (season) {
      const seasonArray = Array.isArray(season) ? season : [season];
      filtered = filtered.filter(item =>
        item.seasons?.some(s => seasonArray.includes(s))
      );
    }
    
    if (condition) {
      const conditionArray = Array.isArray(condition) ? condition : [condition];
      filtered = filtered.filter(item =>
        item.condition && conditionArray.includes(item.condition)
      );
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.brand?.toLowerCase().includes(searchLower) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // Pagination
    const start = (parseInt(page) - 1) * parseInt(limit);
    const end = start + parseInt(limit);
    const paginated = filtered.slice(start, end);
    
    res.json({
      items: paginated,
      total: filtered.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(filtered.length / parseInt(limit))
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// GET /api/wardrobe/items/:id - Get single item details
app.get('/api/wardrobe/items/:id', (req, res) => {
  try {
    const { id } = req.params;
    const item = wardrobeItems.find(i => i.id === id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ item });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// POST /api/wardrobe/items - Create new item
app.post('/api/wardrobe/items', (req, res) => {
  try {
    const itemData = req.body;
    
    // Validate required fields
    if (!itemData.name || !itemData.category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }
    
    const newItem = {
      ...itemData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      wearCount: itemData.wearCount || 0,
      isArchived: itemData.isArchived || false,
    };
    
    wardrobeItems.push(newItem);
    
    res.status(201).json({ success: true, item: newItem });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// PUT /api/wardrobe/items/:id - Update item
app.put('/api/wardrobe/items/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const itemIndex = wardrobeItems.findIndex(i => i.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    wardrobeItems[itemIndex] = {
      ...wardrobeItems[itemIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    res.json({ success: true, item: wardrobeItems[itemIndex] });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE /api/wardrobe/items/:id - Delete item
app.delete('/api/wardrobe/items/:id', (req, res) => {
  try {
    const { id } = req.params;
    const itemIndex = wardrobeItems.findIndex(i => i.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    wardrobeItems.splice(itemIndex, 1);
    
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// POST /api/wardrobe/upload - Image upload endpoint
app.post('/api/wardrobe/upload', (req, res) => {
  try {
    // In production, this would handle actual file upload using multer or similar
    // For now, return mock response
    const { imageBase64, itemId } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }
    
    // Simulate image processing
    const imageUrl = `https://api.example.com/images/${Date.now()}.jpg`;
    const thumbnailUrl = `https://api.example.com/thumbnails/${Date.now()}.jpg`;
    
    res.json({
      success: true,
      imageUrl,
      thumbnailUrl,
      itemId: itemId || null
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// GET /api/wardrobe/categories - Get all categories and subcategories
app.get('/api/wardrobe/categories', (req, res) => {
  try {
    const categories = {
      tops: ["T-shirt", "Blouse", "Shirt", "Sweater", "Tank Top", "Hoodie", "Cardigan", "Crop Top", "Polo", "Tunic"],
      bottoms: ["Jeans", "Pants", "Shorts", "Skirt", "Leggings", "Trousers", "Capris", "Joggers", "Sweatpants"],
      shoes: ["Sneakers", "Boots", "Heels", "Flats", "Sandals", "Loafers", "Oxfords", "Slippers", "Athletic"],
      accessories: ["Bag", "Belt", "Hat", "Scarf", "Jewelry", "Watch", "Sunglasses", "Gloves", "Tie"],
      outerwear: ["Jacket", "Coat", "Blazer", "Vest", "Parka", "Trench Coat", "Windbreaker", "Bomber"],
      dresses: ["Casual Dress", "Formal Dress", "Sundress", "Maxi Dress", "Midi Dress", "Mini Dress", "Wrap Dress"],
      activewear: ["Sports Bra", "Athletic Top", "Athletic Shorts", "Yoga Pants", "Gym Leggings", "Athletic Jacket"],
      swimwear: ["Swimsuit", "Bikini", "One-Piece", "Swim Trunks", "Cover-up", "Rash Guard"],
      underwear: ["Bra", "Underwear", "Undershirt", "Socks", "Tights", "Shapewear"],
      other: ["Other"],
      outfits: ["Outfit"],
    };
    
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/wardrobe/stats - Get wardrobe statistics
app.get('/api/wardrobe/stats', (req, res) => {
  try {
    const stats = {
      totalItems: wardrobeItems.length,
      totalOutfits: wardrobeItems.filter(i => i.category === 'outfits').length,
      byCategory: {
        tops: wardrobeItems.filter(i => i.category === 'tops').length,
        bottoms: wardrobeItems.filter(i => i.category === 'bottoms').length,
        shoes: wardrobeItems.filter(i => i.category === 'shoes').length,
        accessories: wardrobeItems.filter(i => i.category === 'accessories').length,
        outerwear: wardrobeItems.filter(i => i.category === 'outerwear').length,
        dresses: wardrobeItems.filter(i => i.category === 'dresses').length,
        activewear: wardrobeItems.filter(i => i.category === 'activewear').length,
        swimwear: wardrobeItems.filter(i => i.category === 'swimwear').length,
        underwear: wardrobeItems.filter(i => i.category === 'underwear').length,
        other: wardrobeItems.filter(i => i.category === 'other').length,
      },
      totalValue: wardrobeItems.reduce((sum, item) => sum + (item.price || 0), 0),
      mostWorn: wardrobeItems
        .filter(i => i.wearCount)
        .sort((a, b) => (b.wearCount || 0) - (a.wearCount || 0))
        .slice(0, 5)
        .map(i => ({ id: i.id, name: i.name, wearCount: i.wearCount })),
      favoriteItems: wardrobeItems.filter(i => i.isFavorite).length,
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Mock storage for user photos
const userPhotos = [];

// POST /api/upload/photo - Upload photo file
app.post('/api/upload/photo', async (req, res) => {
  try {
    const { imageBase64, userId } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Simulate file upload and storage
    const photoId = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const imageUrl = imageBase64; // In production, upload to S3/Cloudinary and get URL
    
    const photo = {
      id: photoId,
      userId: userId || 'default_user',
      imageUrl,
      createdAt: new Date().toISOString(),
      isPrimary: userPhotos.length === 0,
    };

    userPhotos.push(photo);

    res.json({
      success: true,
      photoId,
      imageUrl,
      message: 'Photo uploaded successfully'
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// POST /api/upload/process - Process photo for measurements
app.post('/api/upload/process', async (req, res) => {
  try {
    const { photoId } = req.body;
    
    if (!photoId) {
      return res.status(400).json({ error: 'Photo ID is required' });
    }

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate extracted measurements
    const measurements = {
      height: 170 + Math.floor(Math.random() * 20) - 10, // 160-180 cm
      shape: ['Hourglass', 'Pear', 'Apple', 'Rectangle', 'Athletic'][Math.floor(Math.random() * 5)],
      shoulders: 36 + Math.floor(Math.random() * 6) - 3, // 33-39"
      bust: 34 + Math.floor(Math.random() * 6) - 3, // 31-37"
      waist: 28 + Math.floor(Math.random() * 6) - 3, // 25-31"
      hips: 36 + Math.floor(Math.random() * 6) - 3, // 33-39"
      inseam: 30 + Math.floor(Math.random() * 6) - 3, // 27-33"
    };

    const photo = userPhotos.find(p => p.id === photoId);
    if (photo) {
      photo.processedUrl = photo.imageUrl; // In production, processed version URL
      photo.measurements = measurements;
      photo.poseType = 'standing';
      photo.backgroundType = 'plain';
    }

    res.json({
      success: true,
      measurements,
      processedUrl: photo?.processedUrl,
      message: 'Photo processed successfully'
    });
  } catch (error) {
    console.error('Photo processing error:', error);
    res.status(500).json({ error: 'Failed to process photo' });
  }
});

// GET /api/upload/history - Get user's uploaded photos
app.get('/api/upload/history', (req, res) => {
  try {
    const { userId } = req.query;
    const photos = userPhotos.filter(p => !userId || p.userId === userId);
    
    res.json({
      success: true,
      photos: photos.map(p => ({
        id: p.id,
        imageUrl: p.imageUrl,
        processedUrl: p.processedUrl,
        measurements: p.measurements,
        createdAt: p.createdAt,
        isPrimary: p.isPrimary,
      }))
    });
  } catch (error) {
    console.error('Get photo history error:', error);
    res.status(500).json({ error: 'Failed to fetch photo history' });
  }
});

// DELETE /api/upload/:photoId - Delete uploaded photo
app.delete('/api/upload/:photoId', (req, res) => {
  try {
    const { photoId } = req.params;
    const index = userPhotos.findIndex(p => p.id === photoId);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    userPhotos.splice(index, 1);

    res.json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// POST /api/ai/generate-avatar - Generate 3D avatar from photo
app.post('/api/ai/generate-avatar', async (req, res) => {
  try {
    const { photoId } = req.body;
    
    if (!photoId) {
      return res.status(400).json({ error: 'Photo ID is required' });
    }

    // Simulate avatar generation delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    const photo = userPhotos.find(p => p.id === photoId);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // In production, generate 3D avatar and return URL
    const avatarUrl = photo.imageUrl; // Placeholder

    if (photo) {
      photo.avatarUrl = avatarUrl;
    }

    res.json({
      success: true,
      avatarUrl,
      message: 'Avatar generated successfully'
    });
  } catch (error) {
    console.error('Avatar generation error:', error);
    res.status(500).json({ error: 'Failed to generate avatar' });
  }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 FITBOT AI Backend server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 Server accessible at http://192.168.0.23:${PORT} on local network`);
  console.log(`📡 API endpoints:`);
  console.log(`   GET  /health - Health check`);
  console.log(`   POST /api/ai/chat - Chat with AI assistant`);
  console.log(`   GET  /api/profile - Get user profile`);
  console.log(`   POST /api/profile/update - Update user profile`);
  console.log(`   GET  /api/weather/location - Search location by city`);
  console.log(`   POST /api/ai/reset - Reset AI learning`);
  console.log(`   GET  /api/wardrobe/items - Get all wardrobe items`);
  console.log(`   GET  /api/wardrobe/items/:id - Get single item`);
  console.log(`   POST /api/wardrobe/items - Create new item`);
  console.log(`   PUT  /api/wardrobe/items/:id - Update item`);
  console.log(`   DELETE /api/wardrobe/items/:id - Delete item`);
  console.log(`   POST /api/wardrobe/upload - Upload image`);
  console.log(`   GET  /api/wardrobe/categories - Get categories`);
  console.log(`   GET  /api/wardrobe/stats - Get wardrobe statistics`);
  console.log(`   POST /api/upload/photo - Upload photo for virtual try-on`);
  console.log(`   POST /api/upload/process - Process photo for measurements`);
  console.log(`   GET  /api/upload/history - Get user's uploaded photos`);
  console.log(`   DELETE /api/upload/:photoId - Delete uploaded photo`);
  console.log(`   POST /api/ai/generate-avatar - Generate 3D avatar from photo`);
});

