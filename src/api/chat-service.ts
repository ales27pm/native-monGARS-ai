import { getOpenAIStream } from './openai';
import { getAnthropicStream } from './anthropic';
import { getGrokStream } from './grok';
import { getLocalStream } from './local';
import { AIMessage, AIProvider } from '../types/ai';
import { logger } from '../utils/logger';
import useAppStore from '../state/appStore';

class ChatService {
    private isGenerating = false;

    public async streamAIResponse(messages: AIMessage[], provider: AIProvider, onToken: (token: string) => void): Promise<void> {
        if (this.isGenerating) {
            logger.warn('ChatService', 'Une génération est déjà en cours.');
            return;
        }
        this.isGenerating = true;

        try {
            const { apiKeys } = useAppStore.getState();
            let streamer;

            switch (provider) {
                case 'openai':
                    streamer = (msgs: AIMessage[], onTkn: (tkn: string) => void) => getOpenAIStream(msgs, apiKeys.openai, onTkn);
                    break;
                case 'anthropic':
                    streamer = (msgs: AIMessage[], onTkn: (tkn: string) => void) => getAnthropicStream(msgs, apiKeys.anthropic, onTkn);
                    break;
                case 'grok':
                    streamer = (msgs: AIMessage[], onTkn: (tkn: string) => void) => getGrokStream(msgs, apiKeys.grok, onTkn);
                    break;
                case 'local':
                    streamer = getLocalStream;
                    break;
                default:
                    logger.error('ChatService', `Fournisseur non supporté: ${provider}`);
                    throw new Error(`Fournisseur non supporté: ${provider}`);
            }
            
            await streamer(messages, onToken);

        } catch (error) {
            logger.error('ChatService', 'Erreur lors du streaming de la réponse IA', error);
            throw error;
        } finally {
            this.isGenerating = false;
        }
    }

    public stopGeneration(): void {
        if (this.isGenerating) {
            this.isGenerating = false; // This is a simplified stop mechanism
            logger.info('ChatService', 'Arrêt de la génération demandé.');
        }
    }
}

export const chatService = new ChatService();
export const stopGeneration = () => chatService.stopGeneration();


