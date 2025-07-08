// ====================================================================================
import { chatService } from '../src/api/chat-service';
import { AIMessage } from '../src/types/ai';

describe('ChatService', () => {
  it('handles local provider response', async () => {
    const messages: AIMessage[] = [{
      id: '1',
      role: 'user',
      content: 'Hello',
      timestamp: new Date().toISOString()
    }];
    const response = await chatService.getAIResponse(messages, 'local');
    expect(response.role).toBe('assistant');
    expect(typeof response.content).toBe('string');
  });
});

// ==== FIN DU FICHIER DE CODEBASE COMPLET

// ===== End of File: {label} =====

