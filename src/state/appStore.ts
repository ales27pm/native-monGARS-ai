// ====================================================================================
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { AIProvider, ServiceStatus, ApiKeys, AppSettings, AppState } from '../types/ai';
import { checkOpenAIService } from '../api/openai';
import { checkAnthropicService } from '../api/anthropic';
import { checkGrokService } from '../api/grok';
import { logger } from '../utils/logger';

const initialApiKeys: ApiKeys = {
    openai: '',
    anthropic: '',
    grok: '',
};

const initialServiceStatus: ServiceStatus = { ok: false, error: 'unchecked' };

const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            settings: {
                theme: 'dark',
                defaultProvider: 'local',
                useMetal: false,
            },
            apiKeys: initialApiKeys,
            serviceStatus: {
                local: { ok: true, error: null },
                openai: initialServiceStatus,
                anthropic: initialServiceStatus,
                grok: initialServiceStatus,
            },
            setTheme: (theme) => set(state => ({ settings: { ...state.settings, theme } })),
            setDefaultProvider: (provider) => set(state => ({ settings: { ...state.settings, defaultProvider: provider } })),
            setUseMetal: (useMetal) => set(state => ({ settings: { ...state.settings, useMetal } })),
            setApiKey: async (provider, key) => {
                set(state => ({
                    apiKeys: { ...state.apiKeys, [provider]: key },
                }));
            },
            loadSettings: async () => {
                logger.info('appStore', 'Les paramètres et clés API ont été chargés depuis AsyncStorage.');
                get().checkAllServices();
            },
            checkService: async (provider) => {
                const { apiKeys } = get();
                let status: ServiceStatus = { ok: false, error: 'unknown' };
                const apiKey = apiKeys[provider as keyof ApiKeys];

                if (!apiKey) {
                    status = { ok: false, error: 'missing_key' };
                } else {
                    try {
                        switch (provider) {
                            case 'openai':
                                await checkOpenAIService(apiKey);
                                status = { ok: true, error: null };
                                break;
                            case 'anthropic':
                                await checkAnthropicService(apiKey);
                                status = { ok: true, error: null };
                                break;
                            case 'grok':
                                await checkGrokService(apiKey);
                                status = { ok: true, error: null };
                                break;
                            case 'local':
                                status = { ok: true, error: null };
                                break;
                        }
                    } catch (e) {
                         const err = e as Error;
                         logger.warn('appStore', `Échec de la vérification du service ${provider}`, err);
                         status = { ok: false, error: err.message };
                    }
                }
                set(state => ({
                    serviceStatus: { ...state.serviceStatus, [provider]: status },
                }));
            },
            checkAllServices: async () => {
                logger.info('appStore', 'Vérification de tous les services cloud...');
                const { checkService } = get();
                await Promise.all([
                    checkService('openai'),
                    checkService('anthropic'),
                    checkService('grok'),
                ]);
            },
        }),
        {
            name: 'app-storage',
            storage: createJSONStorage(() => ({ // Correction pour SecureStore
                setItem: SecureStore.setItemAsync,
                getItem: SecureStore.getItemAsync,
                removeItem: SecureStore.deleteItemAsync,
            })),
            partialize: (state) => ({
                settings: state.settings,
                apiKeys: state.apiKeys,
            }),
        }
    )
);

export default useAppStore;


// ====================================================================================
// ===== End of File: src/state/appStore.ts =====

