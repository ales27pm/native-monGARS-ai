
import 'dotenv/config';

export default {
  expo: {
    name: process.env.APP_NAME || "monGARS",
    slug: process.env.APP_SLUG || "monGARS",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#111827"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.mongars.ai",
      buildNumber: "1.0.0",
      infoPlist: {
        NSMicrophoneUsageDescription: "L'application a besoin d'accéder au microphone pour la reconnaissance vocale.",
        NSSpeechRecognitionUsageDescription: "L'application utilise la reconnaissance vocale pour convertir votre voix en texte.",
        NSCameraUsageDescription: "L'application a besoin de la caméra pour la reconnaissance optique de caractères (OCR)."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#111827"
      },
      package: "com.mongars.ai"
    },
    plugins: [
      ["expo-build-properties", {
        ios: { useFrameworks: "static", newArchEnabled: true },
        android: { newArchEnabled: true }
      }]
    ]
  }
};

// ===== End of File: {label} =====

