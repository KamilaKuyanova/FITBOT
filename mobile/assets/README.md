# Assets Directory

This directory should contain app icons, splash screens, and other static assets.

## Required Assets

You'll need to add the following assets for the app to build properly:

### Icons
- `icon.png` - App icon (1024x1024px recommended)
- `adaptive-icon.png` - Android adaptive icon foreground (1024x1024px)

### Splash Screen
- `splash.png` - Splash screen image (1242x2436px recommended)

### Web
- `favicon.png` - Web favicon (48x48px recommended)

## Generating Assets

You can use tools like:
- [Expo Asset Generator](https://www.npmjs.com/package/@expo/config-plugins)
- [App Icon Generator](https://www.appicon.co/)
- [Icon Kitchen](https://icon.kitchen/) for Android adaptive icons

Or use the Expo CLI to generate these automatically:
```bash
npx expo install @expo/image-utils
```

For now, the app will use default Expo assets, but you should replace them before production.
