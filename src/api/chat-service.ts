import { AIMessage, AIProvider } from '../types/ai';
import { localLLMService } from './local-llm';
import { getOpenAIStream } from './openai';
import { getAnthropicStream } from './anthropic';
import { getGrokStream } from './grok';
import useAppStore from '../state/appStore';
import { logger } from '../utils/logger';

class ChatService {
    public async streamAIResponse(messages: AIMessage[], provider: AIProvider, onToken: (token: string) => void): Promise<void> {
        logger.info('ChatService', `Demande de stream IA au fournisseur: ${provider}`);
        const { apiKeys } = useAppStore.getState();
        try {
            switch (provider) {
                case 'local': return await localLLMService.streamResponse(messages, onToken);
                case 'openai':
                    if (!apiKeys.openai) throw new Error('Clé API OpenAI manquante.');
                    return await getOpenAIStream(messages, apiKeys.openai, onToken);
                case 'anthropic':
                    if (!apiKeys.anthropic) throw new Error('Clé API Anthropic manquante.');
                    return await getAnthropicStream(messages, apiKeys.anthropic, onToken);
                case 'grok':
                    if (!apiKeys.grok) throw new Error('Clé API Grok manquante.');
                    return await getGrokStream(messages, apiKeys.grok, onToken);
                default: throw new Error(`Fournisseur inconnu: ${provider}`);
            }
        } catch (error) {
            logger.error('ChatService', `Erreur de streaming avec le fournisseur ${provider}`, error);
            throw error;
        }
    }
}
export const chatService = new ChatService();


