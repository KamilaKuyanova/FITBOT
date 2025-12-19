# Backend Server Setup

This is the backend server for the Fit Application weather feature.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Get OpenWeatherMap API Key:**
   - Go to https://openweathermap.org/api
   - Sign up for a free account
   - Get your API key from the dashboard

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` (if it exists) or create a `.env` file
   - Add your OpenWeatherMap API key:
     ```
     PORT=3001
     OPENWEATHER_API_KEY=your_api_key_here
     ```

4. **Run the server:**
   ```bash
   npm start
   ```

The server will run on `http://localhost:3001`

## API Endpoints

### GET /api/weather
Fetches weather data for a given location.

**Query Parameters:**
- `location` (required): City name (e.g., "New York", "London", "Tokyo")

**Response:**
```json
{
  "location": "New York",
  "country": "US",
  "temperature": 22,
  "condition": "Clear",
  "description": "clear sky",
  "icon": "01d",
  "feelsLike": 21,
  "humidity": 65,
  "windSpeed": 3.5,
  "recommendation": "Perfect for light clothing"
}
```

