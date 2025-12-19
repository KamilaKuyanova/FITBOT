# FITBOT AI Backend

Backend API server for the FITBOT AI Style Assistant.

## Features

- AI Chat API endpoint for style advice
- Context-aware responses based on user wardrobe data
- RESTful API design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (optional):
```
PORT=3001
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### POST `/api/ai/chat`

Send a message to the AI style assistant.

**Request Body:**
```json
{
  "message": "What should I wear for a business casual meeting?",
  "context": {
    "totalItems": 128,
    "totalOutfits": 42,
    "categories": {
      "tops": 45,
      "bottoms": 32,
      "shoes": 28,
      "accessories": 23
    },
    "stylePreferences": ["Casual", "Chic", "Minimalist"]
  }
}
```

**Response:**
```json
{
  "response": "For a business casual meeting, I recommend...",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### GET `/api/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "FITBOT AI Backend"
}
```

## Future Enhancements

- Integration with OpenAI/Anthropic API for real AI responses
- Database integration for user wardrobe data
- User authentication and session management
- Advanced outfit generation algorithms
- Image analysis for clothing items

