// ====================================================================================
import OpenAI from 'openai';
import { logger } from '../utils/logger';
import { AIMessage } from '../types/ai';

export async function checkOpenAIService(apiKey: string): Promise<void> {
    if (!apiKey) throw new Error('missing_key');
    try {
        const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
        await openai.models.list();
        logger.info('OpenAI', 'La clé API OpenAI est valide.');
    } catch (error) {
        logger.warn('OpenAI', 'La vérification de la clé API OpenAI a échoué.', error);
        throw new Error('Clé invalide ou problème réseau.');
    }
}

export async function getOpenAIChatCompletion(messages: AIMessage[], apiKey: string): Promise<string> { // <-- patched
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    const completion = await openai.chat.completions.create({
        messages: messages.map((msg) => ({ role: msg.role, content: msg.content })), // <-- patched
        model: 'gpt-4o-mini',
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
        throw new Error('Réponse vide de l\'API OpenAI.');
    }
    return content;
}

export async function getOpenAIStream(messages: AIMessage[], apiKey: string, onToken: (token: string) => void, signal: AbortSignal): Promise<void> {
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    const stream = await openai.chat.completions.create({
        messages: messages.map((msg) => ({ role: msg.role, content: msg.content })),
        model: 'gpt-4o-mini',
        stream: true,
    }, { signal });

    for await (const chunk of stream) {
        if (signal.aborted) {
            throw new Error('AbortError');
        }
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
            onToken(content);
        }
    }
}


// ====================================================================================
// ===== End of File: src/api/openai.ts =====

