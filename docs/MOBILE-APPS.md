# Idellicious — Android & iPhone app files

This project ships **installable mobile app assets** for both platforms.

## 1. Progressive Web App (recommended on Base44)

Works immediately on the live site without App Store / Play Store.

| Platform | How to install |
|----------|----------------|
| **Android (Chrome)** | Open the site → menu **Install app** / **Add to Home screen** |
| **iPhone / iPad (Safari)** | Share → **Add to Home Screen** |

### Files generated

| Path | Purpose |
|------|---------|
| `public/manifest.webmanifest` | Android/Chrome install metadata |
| `public/icons/*` | App icons (16–512px + maskable) |
| `public/icons/apple-touch-icon.png` | iOS home-screen icon |
| `public/splash/*` | Launch splash images (iOS / Android) |
| `public/sw.js` | Service worker (offline shell) |
| `public/browserconfig.xml` | Windows tile config |
| `index.html` | Apple + Android meta tags |

Regenerate icons from logo:

```bash
python scripts/generate-mobile-icons.py
```

## 2. Native shells (Capacitor)

For real **.apk / .aab** (Android) and **Xcode / .ipa** (iPhone):

```bash
npm install
npm run build
npx cap sync
```

| Platform | Requirements | Commands |
|----------|--------------|----------|
| **Android** | Android Studio, JDK 17, Android SDK | `npx cap open android` → Build APK/AAB |
| **iOS** | **macOS** + Xcode + Apple Developer account | `npx cap open ios` → Archive → TestFlight/App Store |

Config: `capacitor.config.json`  
After each web release: `npm run build && npx cap sync`

> iOS native builds **cannot** be produced on Windows. Use a Mac or CI (e.g. GitHub Actions macOS runner).

## 3. Live app URL

https://nourishcare-e81ee6f6.base44.app

Use this URL when testing “Add to Home Screen” / “Install app”.
