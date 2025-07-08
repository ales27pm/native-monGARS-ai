import { getOpenAIStream } from './openai';
import { getAnthropicStream } from './anthropic';
import { getGrokStream } from './grok';
import { getLocalStream } from './local';
import { AIMessage, AIProvider } from '../types/ai';
import { logger } from '../utils/logger';
import useAppStore from '../state/appStore';

class ChatService {
    private abortController: AbortController | null = null;

    public async streamAIResponse(messages: AIMessage[], provider: AIProvider, onToken: (token: string) => void): Promise<void> {
        if (this.abortController) {
            logger.warn('ChatService', 'Une génération est déjà en cours.');
            return;
        }
        this.abortController = new AbortController();
        const signal = this.abortController.signal;

        try {
            const { apiKeys } = useAppStore.getState();
            let streamer;

            switch (provider) {
                case 'openai':
                    streamer = (msgs: AIMessage[], onTkn: (tkn: string) => void) => getOpenAIStream(msgs, apiKeys.openai, onTkn, signal);
                    break;
                case 'anthropic':
                    streamer = (msgs: AIMessage[], onTkn: (tkn: string) => void) => getAnthropicStream(msgs, apiKeys.anthropic, onTkn, signal);
                    break;
                case 'grok':
                    streamer = (msgs: AIMessage[], onTkn: (tkn: string) => void) => getGrokStream(msgs, apiKeys.grok, onTkn, signal);
                    break;
                case 'local':
                    streamer = (msgs: AIMessage[], onTkn: (tkn: string) => void) => getLocalStream(msgs, onTkn, signal);
                    break;
                default:
                    logger.error('ChatService', `Fournisseur non supporté: ${provider}`);
                    throw new Error(`Fournisseur non supporté: ${provider}`);
            }
            
            await streamer(messages, onToken);

        } catch (error) {
            if (error.name === 'AbortError') {
                logger.info('ChatService', 'La génération a été annulée.');
            } else {
                logger.error('ChatService', 'Erreur lors du streaming de la réponse IA', error);
                throw error;
            }
        } finally {
            this.abortController = null;
        }
    }

    public stopGeneration(): void {
        if (this.abortController) {
            this.abortController.abort();
            logger.info('ChatService', 'Arrêt de la génération demandé.');
        }
    }
}

export const chatService = new ChatService();
export const stopGeneration = () => chatService.stopGeneration();


