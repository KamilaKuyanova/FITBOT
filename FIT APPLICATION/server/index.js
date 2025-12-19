const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// GET /health endpoint - Health check
app.get('/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Helper function to get clothing recommendations based on weather
function getWeatherRecommendation(temp, condition) {
  if (temp < 10) {
    return 'Bundle up with warm layers';
  } else if (temp < 15) {
    return 'Perfect for layers';
  } else if (temp < 20) {
    return 'Light jacket recommended';
  } else if (temp < 25) {
    return 'Perfect for light clothing';
  } else {
    return 'Keep it cool and breezy';
  }
}

// Helper function to transform weather data
function transformWeatherData(data) {
  return {
    location: data.name,
    country: data.sys.country,
    temperature: Math.round(data.main.temp),
    condition: data.weather[0].main,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    recommendation: getWeatherRecommendation(data.main.temp, data.weather[0].main)
  };
}

// POST /weather/current endpoint - accepts lat/lon
app.post('/weather/current', async (req, res) => {
  try {
    const { lat, lon } = req.body;
    
    if (lat === undefined || lon === undefined) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    if (typeof lat !== 'number' || typeof lon !== 'number') {
      return res.status(400).json({ error: 'Latitude and longitude must be numbers' });
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    // Using OpenWeatherMap API
    const API_KEY = process.env.OPENWEATHER_API_KEY || process.env.VITE_WEATHER_API_KEY;
    
    if (!API_KEY || API_KEY === 'demo_key') {
      return res.status(500).json({ error: 'Weather API key not configured' });
    }

    const API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    const response = await fetch(API_URL);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Weather API error:', response.status, errorText);
      
      if (response.status === 401) {
        return res.status(401).json({ error: 'Invalid API key' });
      }
      if (response.status === 404) {
        return res.status(404).json({ error: 'Location not found' });
      }
      
      // Try to parse as JSON, otherwise return text
      try {
        const errorData = JSON.parse(errorText);
        return res.status(response.status).json({ error: errorData.message || 'Weather API error' });
      } catch {
        return res.status(response.status).json({ error: errorText || 'Weather API error' });
      }
    }

    const data = await response.json();
    const weatherData = transformWeatherData(data);

    res.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch weather data' });
  }
});

// GET /api/weather endpoint - legacy support (city name)
app.get('/api/weather', async (req, res) => {
  try {
    const { location } = req.query;
    
    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    // Using OpenWeatherMap API
    const API_KEY = process.env.OPENWEATHER_API_KEY || process.env.VITE_WEATHER_API_KEY;
    const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${API_KEY}&units=metric`;

    const response = await fetch(API_URL);
    
    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: 'Location not found' });
      }
      throw new Error('Weather API error');
    }

    const data = await response.json();
    const weatherData = transformWeatherData(data);

    res.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// GET /api/profile endpoint - returns user profile
app.get('/api/profile', (req, res) => {
  try {
    // Return default profile structure matching mobile app expectations
    // In a real app, this would fetch from database
    const defaultProfile = {
      personalInfo: {
        name: "Kamila Martinez",
        bio: "",
        gender: "Prefer not to say",
        avatarUrl: "https://images.unsplash.com/photo-1763971922545-2e5ed772ae43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwd29tYW4lMjBwYXN0ZWx8ZW58MXx8fHwxNzY0ODU2MTA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
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
          dress: "M",
        },
      },
      location: {
        city: "New York",
        country: "United States",
        coordinates: { lat: 40.7128, lon: -74.0060 },
        timezone: "America/New_York",
      },
      weatherPreferences: {
        unit: "celsius",
        enabled: true,
        notifications: true,
        sensitivity: 5,
      },
      stylePreferences: {
        tags: ["Casual", "Chic", "Minimalist"],
        colorPalette: ["#F5DCE7", "#E3F0FF", "#E8F5E9", "#C8A2C8"],
        patterns: ["Solids"],
        formalityLevel: 5,
      },
      aiSettings: {
        assistantName: "Style Assistant",
        creativity: 6,
        verbosity: 5,
        learningFrequency: "Daily",
      },
      notifications: {
        enabled: true,
        emailEnabled: true,
        types: ["outfit_suggestions", "weather_alerts"],
        quietHours: { start: "22:00", end: "08:00" },
      },
      privacy: {
        shareData: false,
        publicOutfits: false,
      },
    };

    res.json({ userProfile: defaultProfile });
  } catch (error) {
    console.error('Profile API error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// POST /api/profile/update endpoint - updates user profile
app.post('/api/profile/update', (req, res) => {
  try {
    const { userProfile } = req.body;
    
    if (!userProfile) {
      return res.status(400).json({ error: 'userProfile is required' });
    }

    // In a real app, this would save to database
    // For now, just return success
    console.log('Profile update received:', JSON.stringify(userProfile, null, 2));
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      userProfile: userProfile 
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/ai/chat endpoint - AI chat responses
app.post('/api/ai/chat', (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    // In a real app, this would use an AI service (OpenAI, etc.)
    // For now, return a simple response
    const response = `I understand you're asking about "${message}". Based on your closet with ${context?.totalItems || 0} items, I can help you create the perfect outfit!`;
    
    res.json({ 
      response: response,
      context: context 
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

// In-memory storage for closet items (in production, use a database)
let closetStore = {};

// GET /api/closet endpoint - Get user's closet items
app.get('/api/closet', (req, res) => {
  try {
    const userId = req.query.userId || 'default'; // In production, get from auth token
    const items = closetStore[userId] || [];
    res.json({ items });
  } catch (error) {
    console.error('Get closet error:', error);
    res.status(500).json({ error: 'Failed to get closet items' });
  }
});

// POST /api/closet endpoint - Save/update closet items
app.post('/api/closet', (req, res) => {
  try {
    const { userId = 'default', items } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'items array is required' });
    }
    closetStore[userId] = items;
    res.json({ success: true, itemCount: items.length });
  } catch (error) {
    console.error('Save closet error:', error);
    res.status(500).json({ error: 'Failed to save closet items' });
  }
});

// POST /api/ai/outfit-global endpoint - Generate outfits using AI without user's wardrobe (renamed for consistency)
app.post('/api/ai/outfit-global', async (req, res) => {
  try {
    const {
      gender = 'female',
      age,
      style = 'casual',
      occasion = 'general',
      weather = {},
      palette = 'neutral',
      budgetLevel = 'medium',
      preferredColors = [],
      avoidItems = [],
    } = req.body;

    // Get OpenAI API key from environment
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'demo_key') {
      // Fallback: return mock outfit if API key is not configured
      console.warn('OpenAI API key not configured, returning mock outfit');
      const mockOutfit = {
        outfits: [
          {
            id: 'global-1',
            name: `${style.charAt(0).toUpperCase() + style.slice(1)} ${occasion} Look`,
            description: `A stylish ${style} outfit perfect for ${occasion}. ${weather.temperature ? `Designed for ${weather.temperature}°C weather.` : ''}`,
            items: [
              {
                category: 'outerwear',
                type: weather.temperature < 10 ? 'puffer jacket' : weather.temperature < 20 ? 'light jacket' : 'cardigan',
                color: palette === 'pastel' ? 'light beige' : palette === 'bright' ? 'vibrant blue' : 'neutral gray',
                details: 'comfortable fit',
              },
              {
                category: 'tops',
                type: style === 'casual' ? 'knitted sweater' : style === 'business' ? 'blouse' : 't-shirt',
                color: preferredColors[0] || 'white',
                details: style === 'casual' ? 'chunky knit' : 'classic cut',
              },
              {
                category: 'bottoms',
                type: style === 'sporty' ? 'athletic leggings' : style === 'business' ? 'trousers' : 'jeans',
                color: palette === 'monochrome' ? 'black' : 'light blue',
                details: 'comfortable fit',
              },
              {
                category: 'shoes',
                type: avoidItems.includes('heels') ? 'sneakers' : style === 'business' ? 'loafers' : 'sneakers',
                color: 'white',
                details: 'versatile style',
              },
            ],
          },
        ],
      };
      return res.json(mockOutfit);
    }

    // Build the prompt for OpenAI
    const weatherText = weather.temperature
      ? `Current weather: ${weather.temperature}°C, ${weather.condition || 'clear'}`
      : 'Weather conditions not specified';
    
    const colorsText = preferredColors.length > 0
      ? `Preferred colors: ${preferredColors.join(', ')}.`
      : '';
    
    const avoidText = avoidItems.length > 0
      ? `Avoid: ${avoidItems.join(', ')}.`
      : '';

    const prompt = `You are a professional fashion stylist. Generate a complete outfit recommendation in JSON format.

User preferences:
- Gender: ${gender}
${age ? `- Age: ${age}` : ''}
- Style: ${style}
- Occasion: ${occasion}
- ${weatherText}
- Color palette: ${palette}
- Budget level: ${budgetLevel}
${colorsText}
${avoidText}

Generate 1-3 complete outfits as JSON objects matching this exact schema:
{
  "outfits": [
    {
      "id": "global-1",
      "name": "Outfit name (e.g., 'Cozy Winter Pastel Look')",
      "description": "A brief description of the outfit and when to wear it (2-3 sentences)",
      "items": [
        {
          "category": "outerwear|tops|bottoms|shoes|accessories|dresses",
          "type": "Specific item type (e.g., 'puffer jacket', 'knitted sweater')",
          "color": "Color name (e.g., 'light beige', 'navy blue')",
          "details": "Additional details about fit, style, or material (e.g., 'cropped, oversized fit', 'chunky knit')"
        }
      ]
    }
  ]
}

The outfit should:
- Be appropriate for the occasion and weather
- Match the specified style and color palette
- Include 4-6 items (outerwear, top, bottom, shoes, and optionally accessories)
- Avoid any items in the avoidItems list
- Use preferred colors when specified
- Be suitable for the budget level

Return ONLY the JSON object, no additional text.`;

    // Call OpenAI API
    const { OpenAI } = require('openai');
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using gpt-4o-mini for cost efficiency, can be changed to gpt-4
      messages: [
        {
          role: 'system',
          content: 'You are a professional fashion stylist. Always respond with valid JSON only, no additional text or explanations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const aiResponse = completion.choices[0]?.message?.content?.trim() || '';
    
    // Parse and validate the response
    let parsedResponse;
    try {
      // Sometimes the response might be wrapped in markdown code blocks
      const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResponse = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('AI returned invalid JSON format');
    }

    // Validate structure
    if (!parsedResponse.outfits || !Array.isArray(parsedResponse.outfits) || parsedResponse.outfits.length === 0) {
      throw new Error('AI response missing outfits array');
    }

    // Validate each outfit structure
    for (const outfit of parsedResponse.outfits) {
      if (!outfit.name || !outfit.description || !outfit.items || !Array.isArray(outfit.items)) {
        throw new Error('Invalid outfit structure in AI response');
      }
      
      for (const item of outfit.items) {
        if (!item.category || !item.type || !item.color) {
          throw new Error('Invalid item structure in AI response');
        }
      }
    }

    res.json(parsedResponse);
  } catch (error) {
    console.error('Global outfit generation error:', error);
    
    // Return a user-friendly error
    const errorMessage = error.message?.includes('API key')
      ? 'AI service configuration error'
      : error.message?.includes('JSON')
      ? 'Failed to process AI response'
      : 'Failed to generate outfit';
    
    res.status(500).json({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Keep old endpoint for backward compatibility
app.post('/api/ai/global-outfit', async (req, res) => {
  // Redirect to new endpoint
  req.url = '/api/ai/outfit-global';
  app._router.handle(req, res);
});

// POST /api/ai/outfit-from-closet endpoint - Generate outfits using user's wardrobe
app.post('/api/ai/outfit-from-closet', async (req, res) => {
  try {
    const {
      userId = 'default',
      filters = {},
    } = req.body;

    // Get user's closet items
    const closetItems = closetStore[userId] || [];
    
    // Filter out archived items
    const activeItems = closetItems.filter(item => !item.isArchived);
    
    if (activeItems.length < 3) {
      return res.status(400).json({
        error: 'not_enough_items',
        message: 'Add more items to your closet to generate full outfits. You need at least 3 items.',
      });
    }

    // Group items by category
    const itemsByCategory = {};
    activeItems.forEach(item => {
      const category = item.category || 'other';
      if (!itemsByCategory[category]) {
        itemsByCategory[category] = [];
      }
      itemsByCategory[category].push({
        id: item.id,
        name: item.name,
        category: item.category,
        type: item.type || 'item',
        color: item.color || 'unknown',
        tags: item.tags || (item.tag ? [item.tag] : []),
        occasion: item.occasion || [],
        weatherCompatibility: item.weatherCompatibility || [],
        fit: item.fit,
        pattern: item.pattern,
      });
    });

    // Get OpenAI API key from environment
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'demo_key') {
      // Fallback: return mock outfit using real closet items
      console.warn('OpenAI API key not configured, returning mock outfit from closet');
      
      const selectedItems = [];
      // Try to pick items from different categories
      const categories = ['tops', 'bottoms', 'shoes', 'outerwear', 'accessories'];
      categories.forEach(category => {
        if (itemsByCategory[category] && itemsByCategory[category].length > 0) {
          selectedItems.push(itemsByCategory[category][0]);
        }
      });
      
      if (selectedItems.length === 0) {
        // Fallback: just pick first 4 items
        selectedItems.push(...activeItems.slice(0, 4));
      }

      return res.json({
        outfits: [
          {
            id: 'closet-1',
            name: 'Outfit from Your Wardrobe',
            description: `A stylish combination using ${selectedItems.length} items from your closet.`,
            items: selectedItems.map(item => ({
              source: 'closet',
              itemId: item.id,
            })),
          },
        ],
      });
    }

    // Build closet items description for AI
    const closetDescription = Object.keys(itemsByCategory).map(category => {
      const items = itemsByCategory[category];
      return `${category}: ${items.map(item => 
        `${item.name} (${item.type || 'item'}, ${item.color || 'unknown color'}${item.tags.length > 0 ? ', tags: ' + item.tags.join(', ') : ''})`
      ).join('; ')}`;
    }).join('\n');

    const weatherText = filters.weather?.temperature
      ? `Current weather: ${filters.weather.temperature}°C, ${filters.weather.condition || 'clear'}. `
      : '';
    
    const prompt = `You are a professional fashion stylist. Generate outfit recommendations using ONLY the items from the user's wardrobe listed below.

USER'S WARDROBE ITEMS:
${closetDescription}

User preferences:
- Occasion: ${filters.occasion || 'general'}
- Style: ${filters.style || 'casual'}
${weatherText}
- Color palette: ${filters.palette || 'any'}
${filters.avoidCategories && filters.avoidCategories.length > 0 ? `- Avoid categories: ${filters.avoidCategories.join(', ')}` : ''}
- Maximum items per outfit: ${filters.maxItems || 6}

Generate 1-2 complete outfits as JSON objects matching this exact schema:
{
  "outfits": [
    {
      "id": "closet-1",
      "name": "Outfit name (e.g., 'Casual Weekend Look')",
      "description": "Description of how these items work together (2-3 sentences)",
      "items": [
        {
          "source": "closet",
          "itemId": "EXACT_ID_FROM_WARDROBE_LIST"
        }
      ]
    }
  ]
}

CRITICAL REQUIREMENTS:
- You MUST only use item IDs that exist in the wardrobe list above
- Each outfit should include 3-6 items
- Items should complement each other in style and color
- Consider the occasion and weather preferences
- Items should come from different categories when possible (tops, bottoms, shoes, etc.)
- Each item ID in the response must exactly match an ID from the wardrobe list

Return ONLY the JSON object, no additional text.`;

    // Call OpenAI API
    const { OpenAI } = require('openai');
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional fashion stylist. Always respond with valid JSON only, no additional text or explanations. You must only use item IDs that exist in the user\'s wardrobe.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const aiResponse = completion.choices[0]?.message?.content?.trim() || '';
    
    // Parse and validate the response
    let parsedResponse;
    try {
      const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResponse = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('AI returned invalid JSON format');
    }

    // Validate structure
    if (!parsedResponse.outfits || !Array.isArray(parsedResponse.outfits) || parsedResponse.outfits.length === 0) {
      throw new Error('AI response missing outfits array');
    }

    // Validate each outfit and ensure itemIds exist
    const validItemIds = new Set(activeItems.map(item => item.id));
    for (const outfit of parsedResponse.outfits) {
      if (!outfit.name || !outfit.description || !outfit.items || !Array.isArray(outfit.items)) {
        throw new Error('Invalid outfit structure in AI response');
      }
      
      // Validate itemIds exist in wardrobe
      for (const item of outfit.items) {
        if (!item.source || item.source !== 'closet' || !item.itemId) {
          throw new Error('Invalid item structure: must have source="closet" and itemId');
        }
        if (!validItemIds.has(item.itemId)) {
          console.warn(`AI suggested itemId ${item.itemId} that doesn't exist in wardrobe, skipping`);
          // Remove invalid itemId
          outfit.items = outfit.items.filter(i => i.itemId !== item.itemId);
        }
      }
      
      // Remove outfits with too few items
      if (outfit.items.length < 2) {
        console.warn(`Outfit ${outfit.id} has too few items, skipping`);
        parsedResponse.outfits = parsedResponse.outfits.filter(o => o.id !== outfit.id);
      }
    }

    if (parsedResponse.outfits.length === 0) {
      throw new Error('No valid outfits could be generated from wardrobe');
    }

    res.json(parsedResponse);
  } catch (error) {
    console.error('Closet-based outfit generation error:', error);
    
    const errorMessage = error.message?.includes('not_enough_items')
      ? error.message
      : error.message?.includes('API key')
      ? 'AI service configuration error'
      : error.message?.includes('JSON')
      ? 'Failed to process AI response'
      : 'Failed to generate outfit from closet';
    
    res.status(500).json({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Keep old endpoint /api/ai/global-outfit for backward compatibility
app.post('/api/ai/global-outfit', async (req, res) => {
  // Forward request to new endpoint by calling it directly
  // We'll reuse the same logic by extracting it, but for simplicity, just copy the key parts
  try {
    const {
      gender = 'female',
      age,
      style = 'casual',
      occasion = 'general',
      weather = {},
      palette = 'neutral',
      budgetLevel = 'medium',
      preferredColors = [],
      avoidItems = [],
    } = req.body;

    // Get OpenAI API key from environment
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'demo_key') {
      // Fallback: return mock outfit if API key is not configured
      console.warn('OpenAI API key not configured, returning mock outfit');
      const mockOutfit = {
        outfits: [
          {
            name: `${style.charAt(0).toUpperCase() + style.slice(1)} ${occasion} Look`,
            description: `A stylish ${style} outfit perfect for ${occasion}. ${weather.temperature ? `Designed for ${weather.temperature}°C weather.` : ''}`,
            items: [
              {
                category: 'outerwear',
                type: weather.temperature < 10 ? 'puffer jacket' : weather.temperature < 20 ? 'light jacket' : 'cardigan',
                color: palette === 'pastel' ? 'light beige' : palette === 'bright' ? 'vibrant blue' : 'neutral gray',
                details: 'comfortable fit',
              },
              {
                category: 'tops',
                type: style === 'casual' ? 'knitted sweater' : style === 'business' ? 'blouse' : 't-shirt',
                color: preferredColors[0] || 'white',
                details: style === 'casual' ? 'chunky knit' : 'classic cut',
              },
              {
                category: 'bottoms',
                type: style === 'sporty' ? 'athletic leggings' : style === 'business' ? 'trousers' : 'jeans',
                color: palette === 'monochrome' ? 'black' : 'light blue',
                details: 'comfortable fit',
              },
              {
                category: 'shoes',
                type: avoidItems.includes('heels') ? 'sneakers' : style === 'business' ? 'loafers' : 'sneakers',
                color: 'white',
                details: 'versatile style',
              },
            ],
          },
        ],
      };
      return res.json(mockOutfit);
    }

    // Build the prompt for OpenAI
    const weatherText = weather.temperature
      ? `Current weather: ${weather.temperature}°C, ${weather.condition || 'clear'}`
      : 'Weather conditions not specified';
    
    const colorsText = preferredColors.length > 0
      ? `Preferred colors: ${preferredColors.join(', ')}.`
      : '';
    
    const avoidText = avoidItems.length > 0
      ? `Avoid: ${avoidItems.join(', ')}.`
      : '';

    const prompt = `You are a professional fashion stylist. Generate a complete outfit recommendation in JSON format.

User preferences:
- Gender: ${gender}
${age ? `- Age: ${age}` : ''}
- Style: ${style}
- Occasion: ${occasion}
- ${weatherText}
- Color palette: ${palette}
- Budget level: ${budgetLevel}
${colorsText}
${avoidText}

Generate ONE complete outfit as a JSON object matching this exact schema:
{
  "outfits": [
    {
      "name": "Outfit name (e.g., 'Cozy Winter Pastel Look')",
      "description": "A brief description of the outfit and when to wear it (2-3 sentences)",
      "items": [
        {
          "category": "outerwear|tops|bottoms|shoes|accessories|dresses",
          "type": "Specific item type (e.g., 'puffer jacket', 'knitted sweater')",
          "color": "Color name (e.g., 'light beige', 'navy blue')",
          "details": "Additional details about fit, style, or material (e.g., 'cropped, oversized fit', 'chunky knit')"
        }
      ]
    }
  ]
}

The outfit should:
- Be appropriate for the occasion and weather
- Match the specified style and color palette
- Include 4-6 items (outerwear, top, bottom, shoes, and optionally accessories)
- Avoid any items in the avoidItems list
- Use preferred colors when specified
- Be suitable for the budget level

Return ONLY the JSON object, no additional text.`;

    // Call OpenAI API
    const { OpenAI } = require('openai');
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using gpt-4o-mini for cost efficiency, can be changed to gpt-4
      messages: [
        {
          role: 'system',
          content: 'You are a professional fashion stylist. Always respond with valid JSON only, no additional text or explanations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const aiResponse = completion.choices[0]?.message?.content?.trim() || '';
    
    // Parse and validate the response
    let parsedResponse;
    try {
      // Sometimes the response might be wrapped in markdown code blocks
      const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResponse = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('AI returned invalid JSON format');
    }

    // Validate structure
    if (!parsedResponse.outfits || !Array.isArray(parsedResponse.outfits) || parsedResponse.outfits.length === 0) {
      throw new Error('AI response missing outfits array');
    }

    // Validate each outfit structure
    for (const outfit of parsedResponse.outfits) {
      if (!outfit.name || !outfit.description || !outfit.items || !Array.isArray(outfit.items)) {
        throw new Error('Invalid outfit structure in AI response');
      }
      
      for (const item of outfit.items) {
        if (!item.category || !item.type || !item.color) {
          throw new Error('Invalid item structure in AI response');
        }
      }
    }

    res.json(parsedResponse);
  } catch (error) {
    console.error('Global outfit generation error:', error);
    
    // Return a user-friendly error
    const errorMessage = error.message?.includes('API key')
      ? 'AI service configuration error'
      : error.message?.includes('JSON')
      ? 'Failed to process AI response'
      : 'Failed to generate outfit';
    
    res.status(500).json({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// POST /api/ai/outfit-from-photo endpoint - Generate outfits from uploaded photo
app.post('/api/ai/outfit-from-photo', async (req, res) => {
  try {
    const {
      imageBase64,
      gender = 'female',
      style = 'casual',
      occasion = 'daily',
      weather = {},
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Get OpenAI API key from environment
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'demo_key') {
      // Fallback: return mock outfit if API key is not configured
      console.warn('OpenAI API key not configured, returning mock outfit');
      const mockResponse = {
        analysis: 'Soft pastel aesthetic, oversized hoodie, relaxed vibe.',
        outfits: [
          {
            name: 'Soft pastel streetwear',
            description: 'Keeps your current hoodie vibe, adds structured jeans and chunky sneakers.',
            items: [
              { category: 'tops', type: 'oversized hoodie', color: 'beige', details: 'relaxed fit' },
              { category: 'bottoms', type: 'straight jeans', color: 'light blue', details: 'comfortable fit' },
              { category: 'shoes', type: 'chunky sneakers', color: 'white', details: 'versatile style' },
              { category: 'accessories', type: 'simple tote bag', color: 'cream', details: 'minimalist design' },
            ],
          },
        ],
      };
      return res.json(mockResponse);
    }

    // Build the prompt for OpenAI with image analysis
    const weatherText = weather.temperature
      ? `Current weather: ${weather.temperature}°C, ${weather.condition || 'clear'}. `
      : '';
    
    const prompt = `You are a professional fashion stylist. Analyze the uploaded photo and suggest matching outfits.

The photo shows: [USER WILL PROVIDE IMAGE]
User preferences:
- Gender: ${gender}
- Style: ${style}
- Occasion: ${occasion}
${weatherText}
Based on the photo, analyze:
1. The current clothing/style/aesthetic shown
2. Body shape and fit preferences (if visible)
3. Color palette and vibe
4. Any visible patterns or textures

Generate outfit recommendations in JSON format matching this exact schema:
{
  "analysis": "Brief analysis of the photo (e.g., 'Soft pastel aesthetic, oversized hoodie, relaxed vibe')",
  "outfits": [
    {
      "name": "Outfit name (e.g., 'Soft Pastel Streetwear')",
      "description": "How this outfit relates to or improves upon the photo (2-3 sentences)",
      "items": [
        {
          "category": "tops|bottoms|shoes|accessories|outerwear|dresses",
          "type": "Specific item type (e.g., 'oversized hoodie')",
          "color": "Color name (e.g., 'beige', 'light blue')",
          "details": "Additional details (e.g., 'relaxed fit', 'cropped')"
        }
      ]
    }
  ]
}

The outfit should:
- Match or complement the style shown in the photo
- Include 4-6 items (top, bottom, shoes, and optionally outerwear/accessories)
- Be appropriate for the occasion and weather
- Match the specified style preference
- Suggest improvements or variations on what's shown in the photo

Return ONLY the JSON object, no additional text.`;

    // Note: For GPT-4 Vision, we would need to send the image.
    // For now, we'll use text-only prompt since base64 image handling requires vision model
    // In production, you'd use OpenAI Vision API or similar image analysis service
    
    const { OpenAI } = require('openai');
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    // Use text-only model (in production, use gpt-4-vision-preview or similar for image analysis)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional fashion stylist. Always respond with valid JSON only, no additional text or explanations.',
        },
        {
          role: 'user',
          content: prompt + '\n\nNote: The image was uploaded but analyzed separately. Provide recommendations based on typical casual streetwear aesthetic.',
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const aiResponse = completion.choices[0]?.message?.content?.trim() || '';
    
    // Parse and validate the response
    let parsedResponse;
    try {
      const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResponse = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('AI returned invalid JSON format');
    }

    // Validate structure
    if (!parsedResponse.analysis || !parsedResponse.outfits || !Array.isArray(parsedResponse.outfits) || parsedResponse.outfits.length === 0) {
      throw new Error('AI response missing required fields');
    }

    // Validate each outfit structure
    for (const outfit of parsedResponse.outfits) {
      if (!outfit.name || !outfit.description || !outfit.items || !Array.isArray(outfit.items)) {
        throw new Error('Invalid outfit structure in AI response');
      }
      
      for (const item of outfit.items) {
        if (!item.category || !item.type || !item.color) {
          throw new Error('Invalid item structure in AI response');
        }
      }
    }

    res.json(parsedResponse);
  } catch (error) {
    console.error('Photo-based outfit generation error:', error);
    
    const errorMessage = error.message?.includes('API key')
      ? 'AI service configuration error'
      : error.message?.includes('JSON')
      ? 'Failed to process AI response'
      : 'Failed to generate outfit from photo';
    
    res.status(500).json({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// POST /api/ai/outfit-weather endpoint - Generate weather-based outfit
app.post('/api/ai/outfit-weather', async (req, res) => {
  try {
    const {
      temperature,
      condition = 'clear',
      preferredStyle = 'casual',
      palette = 'neutral',
    } = req.body;

    if (temperature === undefined) {
      return res.status(400).json({ error: 'Temperature is required' });
    }

    // Get OpenAI API key from environment
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'demo_key') {
      // Fallback: return mock outfit if API key is not configured
      console.warn('OpenAI API key not configured, returning mock outfit');
      let mockItems;
      
      if (temperature < 5) {
        mockItems = [
          { category: 'outerwear', type: 'winter coat', color: 'navy', details: 'warm, insulated' },
          { category: 'tops', type: 'sweater', color: 'cream', details: 'thick knit' },
          { category: 'bottoms', type: 'warm trousers', color: 'gray', details: 'lined' },
          { category: 'shoes', type: 'boots', color: 'brown', details: 'waterproof' },
          { category: 'accessories', type: 'scarf and gloves', color: 'wool gray', details: 'warm' },
        ];
      } else if (temperature < 15) {
        mockItems = [
          { category: 'outerwear', type: 'light jacket', color: 'beige', details: 'layered' },
          { category: 'tops', type: 'long-sleeve shirt', color: 'white', details: 'comfortable' },
          { category: 'bottoms', type: 'jeans', color: 'blue', details: 'classic fit' },
          { category: 'shoes', type: 'sneakers', color: 'white', details: 'versatile' },
        ];
      } else {
        mockItems = [
          { category: 'tops', type: 't-shirt', color: 'white', details: 'lightweight' },
          { category: 'bottoms', type: 'shorts', color: 'beige', details: 'comfortable' },
          { category: 'shoes', type: 'sandals', color: 'brown', details: 'breathable' },
          { category: 'accessories', type: 'sunglasses', color: 'black', details: 'UV protection' },
        ];
      }

      const mockResponse = {
        outfits: [
          {
            name: `Perfect ${condition} Day Outfit`,
            description: `Ideal outfit for ${temperature}°C weather with ${condition} conditions. ${temperature < 10 ? 'Stay warm and cozy!' : temperature < 20 ? 'Perfect for layering.' : 'Light and comfortable.'}`,
            items: mockItems,
          },
        ],
      };
      return res.json(mockResponse);
    }

    // Build the prompt for OpenAI
    const prompt = `You are a professional fashion stylist. Generate a complete outfit recommendation based on weather conditions.

Weather conditions:
- Temperature: ${temperature}°C
- Condition: ${condition}
- Preferred style: ${preferredStyle}
- Color palette: ${palette}

Generate ONE complete outfit as a JSON object matching this exact schema:
{
  "outfits": [
    {
      "name": "Outfit name (e.g., 'Cozy Winter Day Look' or 'Sunny Summer Outfit')",
      "description": "Why this outfit is perfect for the weather conditions (2-3 sentences)",
      "items": [
        {
          "category": "outerwear|tops|bottoms|shoes|accessories|dresses",
          "type": "Specific item type",
          "color": "Color name",
          "details": "Additional details about fit, material, or style"
        }
      ]
    }
  ]
}

The outfit should:
- Be appropriate for ${temperature}°C weather (${temperature < 5 ? 'very cold - warm layers, coat, boots' : temperature < 10 ? 'cold - warm layers, jacket' : temperature < 15 ? 'cool - light jacket' : temperature < 20 ? 'mild - light layers' : temperature < 25 ? 'warm - light clothing' : 'hot - very light clothing, shorts, sandals'})
- Match the ${condition} condition
- Include appropriate outerwear/accessories for the temperature
- Match the ${preferredStyle} style preference
- Use colors from the ${palette} palette
- Include 4-6 items total

Return ONLY the JSON object, no additional text.`;

    const { OpenAI } = require('openai');
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional fashion stylist. Always respond with valid JSON only, no additional text or explanations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const aiResponse = completion.choices[0]?.message?.content?.trim() || '';
    
    // Parse and validate the response
    let parsedResponse;
    try {
      const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResponse = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('AI returned invalid JSON format');
    }

    // Validate structure
    if (!parsedResponse.outfits || !Array.isArray(parsedResponse.outfits) || parsedResponse.outfits.length === 0) {
      throw new Error('AI response missing outfits array');
    }

    // Validate each outfit structure
    for (const outfit of parsedResponse.outfits) {
      if (!outfit.name || !outfit.description || !outfit.items || !Array.isArray(outfit.items)) {
        throw new Error('Invalid outfit structure in AI response');
      }
      
      for (const item of outfit.items) {
        if (!item.category || !item.type || !item.color) {
          throw new Error('Invalid item structure in AI response');
        }
      }
    }

    res.json(parsedResponse);
  } catch (error) {
    console.error('Weather-based outfit generation error:', error);
    
    const errorMessage = error.message?.includes('API key')
      ? 'AI service configuration error'
      : error.message?.includes('JSON')
      ? 'Failed to process AI response'
      : 'Failed to generate weather-based outfit';
    
    res.status(500).json({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Server accessible at http://192.168.0.23:${PORT} on local network`);
});

