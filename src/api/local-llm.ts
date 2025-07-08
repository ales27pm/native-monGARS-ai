import { coreMLService } from './core-ml-service';
import { logger } from '../utils/logger';
import { AIMessage } from '../types/ai';
import { NativeEventEmitter } from 'react-native';
import { TurboModuleRegistry } from '../services/TurboModuleRegistry';

class LocalLLMService {
    private isReady = false;

    public async initialize(): Promise<void> {
        this.isReady = true;
    }

    public streamResponse(messages: AIMessage[], onToken: (token: string) => void, signal: AbortSignal): Promise<void> {
        if (!this.isReady) {
            throw new Error('Le service LLM local n\'est pas prêt.');
        }

        return new Promise((resolve, reject) => {
            const eventEmitter = new NativeEventEmitter(TurboModuleRegistry.LocalLLMModule);

            const tokenListener = eventEmitter.addListener('onGeneratedToken', (event: { token: string }) => onToken(event.token));
            
            const endListener = eventEmitter.addListener('onGenerationEnd', (event?: { error?: string }) => {
                cleanup();
                if (event?.error) {
                    reject(new Error(event.error));
                } else {
                    resolve();
                }
            });

            const abortHandler = () => {
                cleanup();
                coreMLService.stopGeneration();
                const error = new Error('La génération a été annulée par l\'utilisateur.');
                error.name = 'AbortError';
                reject(error);
            };

            const cleanup = () => {
                tokenListener.remove();
                endListener.remove();
                signal.removeEventListener('abort', abortHandler);
            };

            signal.addEventListener('abort', abortHandler);

            coreMLService.generateStream(messages).catch(err => {
                cleanup();
                reject(err);
            });
        });
    }
}

export const localLLMService = new LocalLLMService();


