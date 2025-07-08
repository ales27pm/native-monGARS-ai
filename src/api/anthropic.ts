// ====================================================================================
import Anthropic from '@anthropic-ai/sdk';
import { logger } from '@/utils/logger';
import { AIMessage } from '@/types/ai';

export async function checkAnthropicService(apiKey: string): Promise<void> {
    if (!apiKey) throw new Error('missing_key');
    try {
        const anthropic = new Anthropic({ apiKey });
        await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'ping' }],
        });
        logger.info('Anthropic', 'La clé API Anthropic est valide.');
    } catch (error) {
        logger.warn('Anthropic', "La vérification de la clé API Anthropic a échoué.", error);
        throw new Error('Clé invalide ou problème réseau.');
    }
}

export async function getAnthropicChatCompletion(messages: AIMessage[], apiKey: string): Promise<string> {
    const anthropic = new Anthropic({ apiKey });

    const userMessages = messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
    }));

    const completion = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 4096,
        messages: userMessages,
    });

    const content = completion.content[0];
    if (content?.type === 'text') {
        return content.text;
    }

    throw new Error('No content in response');
}

export async function getAnthropicStream(messages: AIMessage[], apiKey: string, onToken: (token: string) => void, signal: AbortSignal): Promise<void> {
    const anthropic = new Anthropic({ apiKey });

    const userMessages = messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
    }));

    const stream = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 4096,
        messages: userMessages,
        stream: true,
    }, { signal });

    for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            onToken(chunk.delta.text);
        }
    }
}


// ====================================================================================
// ===== End of File: src/api/anthropic.ts =====

