export interface MockWeatherData {
  city: string;
  temp: number;
  feelsLike: number;
  desc: string;
  icon: string;
  condition: string;
}

export const MOCK_WEATHER_PRESETS: MockWeatherData[] = [
  { city: "Almaty", temp: 6, feelsLike: 4, desc: "Cloudy", icon: "☁️", condition: "cloudy" },
  { city: "Almaty", temp: 1, feelsLike: -2, desc: "Snow", icon: "❄️", condition: "snow" },
  { city: "Almaty", temp: 10, feelsLike: 9, desc: "Sunny", icon: "☀️", condition: "sunny" },
  { city: "Almaty", temp: 5, feelsLike: 3, desc: "Rain", icon: "🌧️", condition: "rain" },
  { city: "Almaty", temp: 8, feelsLike: 5, desc: "Windy", icon: "💨", condition: "windy" },
];

