// ====================================================================================
import { NativeModules, Platform } from 'react-native';
import type { Spec } from '../types/MonGARSTurboModules';
import { logger } from '../utils/logger';

interface LocalLLMModuleSpec extends Spec {}

const createProxy = (): LocalLLMModuleSpec => {
    logger.warn('TurboModuleRegistry', 'Le TurboModule natif "LocalLLMModule" n\'est pas disponible. Utilisation d\'un proxy.');
    
    const unsupported = () => Promise.reject(new Error('Le module natif n\'est pas supporté sur cette plateforme ou dans cette build.'));
    
    return new Proxy({}, {
        get(_, prop) {
            if (prop === 'getAvailableModels') return () => Promise.resolve([]);
            if (prop === 'getAvailableSpace') return () => Promise.resolve('N/A');
            if (prop === 'generateText') return () => Promise.resolve('Mode local non disponible.');
            if (prop === 'stopGeneration') return () => Promise.resolve();
            if (prop === 'addListener' || prop === 'removeListeners') return () => {};
            return unsupported;
        }
    }) as LocalLLMModuleSpec;
};

const LocalLLMModule = NativeModules.LocalLLMModule
  ? (NativeModules.LocalLLMModule as LocalLLMModuleSpec)
  : createProxy();

export const TurboModuleRegistry = {
    LocalLLMModule,
};

export function initializeTurboModules(): Promise<void> {
    return new Promise((resolve) => {
        if (NativeModules.LocalLLMModule) {
            logger.info('TurboModuleRegistry', 'TurboModule "LocalLLMModule" chargé avec succès.');
        }
        resolve();
    });
}


// ====================================================================================
// ===== End of File: src/services/TurboModuleRegistry.ts =====

