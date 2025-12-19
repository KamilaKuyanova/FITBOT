# Ngrok Setup Instructions

This guide explains how to set up ngrok to expose your backend server to the internet so your mobile app can connect to it.

## Prerequisites

1. Backend server running on port 3001
2. ngrok installed (download from https://ngrok.com/download)

## Setup Steps

### 1. Start Backend Server

Run your backend on port 3001:

```bash
# Option 1: If using server/ directory
cd server
npm start

# Option 2: If using backend/ directory
cd backend
npm start
```

Verify the server is running:
- Server should log: `Server running on http://0.0.0.0:3001`
- Test locally: Open `http://localhost:3001/health` in browser

### 2. Start ngrok Tunnel

In a **new terminal window**, run:

```bash
ngrok http 3001
```

You'll see output like:

```
ngrok

Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://xxxx-xx-xx-xxx-xxx.ngrok-free.app -> http://localhost:3001

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Important:** Copy the HTTPS forwarding URL (e.g., `https://xxxx-xx-xx-xxx-xxx.ngrok-free.app`)

### 3. Configure Expo Environment Variable

Create or update `.env` file in the `mobile/` directory:

```bash
cd mobile
```

Create `.env` file with:

```
EXPO_PUBLIC_API_URL=https://xxxx-xx-xx-xxx-xxx.ngrok-free.app
```

Replace `xxxx-xx-xx-xxx-xxx.ngrok-free.app` with your actual ngrok URL.

### 4. Restart Expo Dev Server

**IMPORTANT:** Environment variables are only loaded when Expo starts, so you must restart:

1. Stop the current Expo dev server (Ctrl+C)
2. Start it again:

```bash
npx expo start
```

### 5. Test Connection

#### Test 1: Health Check in Browser (on phone)

Open the ngrok HTTPS URL in your phone's browser:
```
https://xxxx-xx-xx-xxx-xxx.ngrok-free.app/health
```

Expected response:
```json
{"ok":true,"timestamp":"2024-..."}
```

If you see this, the backend is reachable! ✅

#### Test 2: Profile Screen in App

1. Open the app on your phone
2. Navigate to the **Profile** tab
3. Profile should load successfully

If it doesn't load:
- Check the Expo console for `[API] Base URL:` log - it should show your ngrok URL
- Check the ngrok web interface at `http://127.0.0.1:4040` to see incoming requests
- Verify your backend is still running

## Troubleshooting

### "Network request failed" error

1. **Check ngrok is running:** Make sure the ngrok terminal window is still open and shows "Session Status: online"
2. **Check backend is running:** Verify backend is running on port 3001
3. **Check .env file:** Ensure `.env` file exists in `mobile/` directory and has correct URL
4. **Restart Expo:** Stop and restart Expo dev server after changing `.env`
5. **Check ngrok URL:** Free ngrok URLs change on each restart. Update `.env` if you restarted ngrok

### "Can't connect to server" error

- Profile screen will show this error if backend is unreachable
- Click "Retry" button to attempt connection again
- Verify backend is accessible via browser first (step 5, Test 1)

### ngrok URL changed

If you restart ngrok, you'll get a new URL. Update `.env` file and restart Expo dev server.

## Notes

- Free ngrok URLs expire after 2 hours or when you restart ngrok
- For production, use a paid ngrok plan or deploy to a real server
- The `.env` file should be in `.gitignore` (don't commit it)
- API base URL is logged to console on app start (check Expo logs)

## File Structure

```
mobile/
  ├── .env              # Environment variables (create this)
  ├── .env.example      # Example file (if exists)
  ├── src/
  │   └── config/
  │       └── api.ts    # Uses EXPO_PUBLIC_API_URL
  └── ...
```

