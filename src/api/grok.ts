// ====================================================================================
import OpenAI from 'openai';
import { logger } from '../utils/logger';

export async function checkGrokService(apiKey: string): Promise<void> {
    if (!apiKey) throw new Error('missing_key');
    try {
        const grok = new OpenAI({
            apiKey,
            baseURL: 'https://api.x.ai/v1',
            dangerouslyAllowBrowser: true,
        });
        await grok.models.list();
        logger.info('Grok', 'La clé API Grok est valide.');
    } catch (error) {
        logger.warn('Grok', 'La vérification de la clé API Grok a échoué.', error);
        throw new Error('Clé invalide ou problème réseau.');
    }
}

export async function getGrokChatCompletion(messages: AIMessage[], apiKey: string): Promise<string> { // <-- patched
    const grok = new OpenAI({
        apiKey,
        baseURL: 'https://api.x.ai/v1',
        dangerouslyAllowBrowser: true,
    });

    const completion = await grok.chat.completions.create({
        messages: messages.map((msg) => ({ role: msg.role, content: msg.content })), // <-- patched
        model: 'grok-1.5-flash',
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
        throw new Error('Réponse vide de l\'API Grok.');
    }
    return content;
}


// ====================================================================================
// ===== End of File: src/api/grok.ts =====

