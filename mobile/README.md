# AI Wardrobe - Mobile App

This is the React Native mobile version of the AI Wardrobe application, built with Expo and React Native.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- For iOS development: **Xcode** (Mac only)
- For Android development: **Android Studio** with Android SDK

## 🚀 Getting Started

### 1. Install Dependencies

Navigate to the mobile directory and install dependencies:

```bash
cd mobile
npm install
```

### 2. Start the Development Server

Run the Expo development server. For physical devices, use `--tunnel` mode:

```bash
npx expo start --tunnel
```

Or for emulator/simulator:

```bash
npx expo start
```

This will open the Expo DevTools in your browser and display a QR code.

## 📱 Running on Different Platforms

### Android Emulator

1. **Start Android Emulator**:
   - Open Android Studio
   - Go to Tools > Device Manager
   - Start an emulator device

2. **Run the app**:
   - In the Expo terminal, press `a` to open on Android
   - The app will connect to `http://127.0.0.1:8000` (default for emulator)

### iOS Simulator (Mac only)

1. **Start iOS Simulator**:
   - Open Xcode
   - Go to Xcode > Open Developer Tool > Simulator
   - Or run: `open -a Simulator`

2. **Run the app**:
   - In the Expo terminal, press `i` to open on iOS Simulator
   - The app will connect to `http://127.0.0.1:8000` (default for simulator)

### Physical Device (Important!)

#### Step 1: Install Expo Go

1. **Install Expo Go**:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

#### Step 2: Configure API Base URL

**⚠️ IMPORTANT: On a physical device, `localhost` and `127.0.0.1` will NOT work!**

You must set the `EXPO_PUBLIC_API_BASE_URL` environment variable to your computer's local IP address.

**Find your local IP address:**
- **Windows**: Run `ipconfig` and look for "IPv4 Address" (e.g., `192.168.0.15`)
- **Mac/Linux**: Run `ifconfig` and look for inet address (e.g., `192.168.0.15`)

**Set the environment variable:**

**Option A: Create a `.env` file** (recommended):
```bash
# Create .env file in the mobile folder
echo "EXPO_PUBLIC_API_BASE_URL=http://192.168.0.15:8000" > .env
```

Replace `192.168.0.15` with your actual local IP address.

**Option B: Set inline when starting Expo:**
```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.0.15:8000 npx expo start --tunnel
```

**Option C: Set in your shell profile** (persists across sessions):
- Windows (PowerShell): `$env:EXPO_PUBLIC_API_BASE_URL="http://192.168.0.15:8000"`
- Mac/Linux: `export EXPO_PUBLIC_API_BASE_URL=http://192.168.0.15:8000`

#### Step 3: Ensure Backend is Running

Make sure your backend server is running on port 8000 and accessible on your local network.

#### Step 4: Start Expo and Connect

1. Make sure your laptop and phone are on the **same Wi-Fi network**
2. Start Expo with tunnel mode (recommended for physical devices):
   ```bash
   npx expo start --tunnel
   ```
3. Open Expo Go app on your phone
4. Scan the QR code displayed in the terminal or browser
5. The app will load and connect to your backend using the configured API URL

## 🔧 Configuration

### API Base URL Configuration

The app uses a centralized API configuration in `src/config/api.ts`.

**Default behavior:**
- Emulator/Simulator: Uses `http://127.0.0.1:8000` (works automatically)
- Physical Device: Must set `EXPO_PUBLIC_API_BASE_URL` environment variable

**Example configuration:**
```typescript
// src/config/api.ts
export const API_BASE_URL = 
  process.env.EXPO_PUBLIC_API_BASE_URL || 
  "http://127.0.0.1:8000"; // Default for emulator/simulator
```

All API endpoints (weather, profile, AI chat) use this base URL:
- Weather: `${API_BASE_URL}/weather/current`
- Profile: `${API_BASE_URL}/api/profile`
- AI Chat: `${API_BASE_URL}/api/ai/chat`

## 🏗️ Project Structure

```
mobile/
├── App.tsx                 # Main app entry point with navigation
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── src/
│   ├── config/            # Configuration files
│   │   └── api.ts         # API base URL configuration
│   ├── contexts/          # React contexts (Closet, Profile, AI Chat)
│   ├── screens/           # Screen components
│   ├── components/        # Reusable components
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
└── assets/                # Images, fonts, etc.
```

## 🔧 Available Scripts

- `npm start` or `npx expo start` - Start the Expo development server
- `npx expo start --tunnel` - Start with tunnel mode (recommended for physical devices)
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator (Mac only)
- `npm run web` - Run in web browser (for testing)

## 📦 Key Dependencies

- **expo** - Expo SDK 54
- **react-native** - React Native framework
- **@react-navigation/native** - Navigation library
- **@react-native-async-storage/async-storage** - Local storage (replaces localStorage)
- **expo-location** - Location services
- **expo-image-picker** - Image selection
- **@expo/vector-icons** - Icon library
- **react-native-reanimated** - Animations

## 🔐 Backend Configuration

The mobile app connects to the backend server for:
- Weather data (`/weather/current`)
- User profile (`/api/profile`)
- AI chat (`/api/ai/chat`)

**Important Notes:**
- The backend server must be running before starting the app
- For physical devices, use your computer's local IP address (not localhost)
- Ensure your backend server accepts connections from your local network
- The default port is 8000 (configured in `src/config/api.ts`)

## 🐛 Troubleshooting

### Connection Issues

- **"Network request failed" on physical device**: 
  - Make sure you've set `EXPO_PUBLIC_API_BASE_URL` to your local IP (not localhost)
  - Ensure your laptop and phone are on the same Wi-Fi network
  - Verify your backend server is running and accessible
  - Try using `--tunnel` mode: `npx expo start --tunnel`

- **"Network request failed" on emulator/simulator**:
  - Make sure your backend server is running
  - Verify the server is listening on `127.0.0.1:8000`

- **CORS errors**: Ensure your backend allows requests from the Expo dev server

### Build Issues

- **"Metro bundler error"**: Try clearing the cache: `npx expo start -c`
- **"Module not found"**: Run `npm install` again
- **iOS build fails**: Make sure you have Xcode Command Line Tools installed: `xcode-select --install`

### Device/Emulator Issues

- **QR code not scanning**: Make sure Expo Go app is updated to the latest version
- **App not loading**: Check that your device and computer are on the same network
- **Android emulator slow**: Increase the emulator's RAM in Android Studio settings

### Icon/Splash Screen Warnings

- **"Unable to resolve asset ./assets/icon.png"**: This is normal - Expo will use default icons. You can add custom icons later to the `assets/` folder.

## 📝 Notes

- The app uses **AsyncStorage** instead of `localStorage` for data persistence
- Location permissions are required for weather features
- Camera permissions are required for virtual try-on features
- All API calls use `fetch` which works natively in React Native
- API configuration is centralized in `src/config/api.ts`

## 🎯 Next Steps

1. Set up your backend server to run on port 8000
2. For physical device testing, configure `EXPO_PUBLIC_API_BASE_URL` with your local IP
3. Test all features (weather, profile, closet, AI chat)
4. Add custom app icons and splash screens to the `assets/` folder
5. Build for production when ready: `npx expo build:android` or `npx expo build:ios`

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation Documentation](https://reactnavigation.org/)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)

## 🤝 Support

For issues or questions, refer to the main project repository or create an issue.