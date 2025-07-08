import { AIMessage } from '../types/ai';
import { logger } from '../utils/logger';
import { localLLMService } from './local-llm';

// This is a placeholder for the actual implementation of the local LLM.
// You would need to integrate a library like llama.cpp or a similar solution.
export async function getLocalStream(messages: AIMessage[], onToken: (token: string) => void, signal: AbortSignal): Promise<void> {
    logger.info('Local', 'Début de la génération locale...');
    try {
        await localLLMService.streamResponse(messages, onToken, signal);
    } catch (error) {
        logger.error('Local', 'Erreur lors de la génération locale', error);
        throw error;
    }
}
