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

    public streamResponse(messages: AIMessage[], onToken: (token: string) => void): Promise<void> {
        if (!this.isReady) {
            throw new Error('Le service LLM local n\'est pas prêt.');
        }

        return new Promise((resolve, reject) => {
            const eventEmitter = new NativeEventEmitter(TurboModuleRegistry.LocalLLMModule);
            const tokenListener = eventEmitter.addListener('onGeneratedToken', (event: { token: string }) => onToken(event.token));
            const endListener = eventEmitter.addListener('onGenerationEnd', (event?: { error?: string }) => {
                tokenListener.remove(); endListener.remove();
                event?.error ? reject(new Error(event.error)) : resolve();
            });

            coreMLService.generateStream(messages).catch(err => {
                tokenListener.remove(); endListener.remove(); reject(err);
            });
        });
    }
}

export const localLLMService = new LocalLLMService();


