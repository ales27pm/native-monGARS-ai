// ====================================================================================
import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger';
import { AIMessage } from '../types/ai';

export async function checkAnthropicService(apiKey: string): Promise<void> {
    if (!apiKey) throw new Error('missing_key');
    try {
        if (!apiKey.startsWith('sk-ant-')) {
            throw new Error('Format de clé invalide.');
        }
        logger.info('Anthropic', 'La clé API Anthropic a un format valide.');
    } catch (error) {
        logger.warn('Anthropic', 'La vérification de la clé API Anthropic a échoué.', error);
        throw new Error('Clé invalide ou problème réseau.');
    }
}

export async function getAnthropicChatCompletion(messages: AIMessage[], apiKey: string): Promise<string> { // <-- patched
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        messages: messages.map((msg) => ({ role: msg.role, content: msg.content })), // <-- patched
    });
    
    if (response.content[0]?.type === 'text') {
        return response.content[0].text;
    }
    throw new Error('Réponse inattendue de l\'API Anthropic.');
}

export async function getAnthropicStream(messages: AIMessage[], apiKey: string, onToken: (token: string) => void): Promise<void> {
    const anthropic = new Anthropic({ apiKey });
    const stream = await anthropic.messages.stream({
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        messages: messages.map((msg) => ({ role: msg.role, content: msg.content })),
    });

    for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            onToken(event.delta.text);
        }
    }
}


// ====================================================================================
// ===== End of File: src/api/anthropic.ts =====

