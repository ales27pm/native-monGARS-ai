// ====================================================================================
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { initializeTurboModules } from './src/services/TurboModuleRegistry';
import useAppStore from './src/state/appStore';
import { coreMLService } from './src/api/core-ml-service';
import { localLLMService } from './src/api/local-llm';
import { logger } from './src/utils/logger';

import './global.css';

function LoadingScreen() {
    return (
        <View className="flex-1 justify-center items-center bg-dark-bg">
            <Text className="text-4xl font-bold text-dark-text mb-4">🧠 monGARS</Text>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-lg text-dark-text-secondary mt-4 text-center px-8">
                Initialisation des services IA natifs...
            </Text>
            <View className="absolute bottom-12 items-center">
                <Text className="text-sm text-gray-500">🔒 100% On-Device & Privé</Text>
            </View>
        </View>
    );
}

function AppContent() {
    const { settings, loadSettings } = useAppStore();
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                logger.info('App', '🚀 Démarrage de l\'initialisation de l\'application...');
                
                await loadSettings();
                logger.info('App', '✅ Paramètres chargés.');

                await initializeTurboModules();
                logger.info('App', '✅ TurboModules initialisés.');

                await coreMLService.initialize();
                logger.info('App', '✅ Service Core ML initialisé.');

                await localLLMService.initialize();
                logger.info('App', '✅ Service LLM local initialisé.');

                await useAppStore.getState().checkAllServices();
                logger.info('App', '✅ Vérification des services cloud terminée.');

                setIsInitialized(true);
                logger.info('App', '🎉 Initialisation de l\'application terminée avec succès !');
            } catch (e) {
                const err = e as Error;
                logger.error('App', '❌ Échec de l\'initialisation de l\'application', err);
                setError(err.message || 'Une erreur inconnue est survenue.');
            }
        };

        initializeApp();
    }, [loadSettings]);

    if (error) {
        return (
            <View className="flex-1 justify-center items-center bg-red-900 p-5">
                <Text className="text-2xl font-bold text-red-100 mb-4">Erreur d'Initialisation</Text>
                <Text className="text-center text-red-200">{error}</Text>
            </View>
        );
    }

    if (!isInitialized) {
        return <LoadingScreen />;
    }

    return (
        <NavigationContainer>
            <StatusBar style={settings.theme === 'dark' ? 'light' : 'dark'} />
            <AppNavigator />
        </NavigationContainer>
    );
}

export default function App() {
  return (
    <ErrorBoundary>
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <AppContent />
            </SafeAreaProvider>
        </GestureHandlerRootView>
    </ErrorBoundary>
  );
}


// ====================================================================================
// ===== End of File: App.tsx =====

