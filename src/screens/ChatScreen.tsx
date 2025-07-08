import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageBubble } from '../components/MessageBubble';
import { AIMessage } from '../types/ai';
import { chatService, stopGeneration } from '../api/chat-service';
import useAppStore from '../state/appStore';
import { logger } from '../utils/logger';

export default function ChatScreen() {
    const [messages, setMessages] = useState<AIMessage[]>([]);
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const { settings } = useAppStore();

    const handleSend = useCallback(async () => {
        if (!input.trim() || isGenerating) return;
        const userInput: AIMessage = { id: `user-${Date.now()}`, role: 'user', content: input.trim(), timestamp: new Date().toISOString() };
        const conversationHistory = [...messages, userInput];
        const assistantMessageId = `assistant-${Date.now()}`;
        const assistantPlaceholder: AIMessage = { id: assistantMessageId, role: 'assistant', content: '', timestamp: new Date().toISOString() };

        setMessages([...conversationHistory, assistantPlaceholder]);
        setInput('');
        setIsGenerating(true);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

        try {
            await chatService.streamAIResponse(conversationHistory, settings.defaultProvider, (token) => {
                setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId ? { ...msg, content: msg.content + token } : msg
                ));
            });
        } catch (error) {
            logger.error('ChatScreen', 'Erreur lors de la génération de la réponse IA', error);
            setMessages(prev => prev.map(msg => 
                msg.id === assistantMessageId ? { ...msg, content: 'Erreur de connexion.' } : msg
            ));
        } finally {
            setIsGenerating(false);
        }
    }, [input, isGenerating, settings.defaultProvider, messages]);

    const handleStop = () => {
        stopGeneration();
        setIsGenerating(false);
    };

    return (
        <SafeAreaView edges={['bottom']} style={{ flex: 1 }} className="bg-dark-bg">
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }} keyboardVerticalOffset={100}>
                <View className="flex-1 p-4">
                    {messages.length === 0 ? (
                        <View className="flex-1 justify-center items-center">
                            <Text className="text-2xl font-bold text-dark-text">monGARS</Text>
                            <Text className="text-dark-text-secondary mt-2">Commencez la conversation</Text>
                        </View>
                    ) : (
                        <FlatList ref={flatListRef} data={messages} renderItem={({ item }) => <MessageBubble message={item} />} keyExtractor={(item) => item.id} contentContainerStyle={{ paddingVertical: 10 }} onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })} />
                    )}
                </View>
                <View className="flex-row items-center p-4 border-t border-dark-border bg-dark-surface">
                    <TextInput value={input} onChangeText={setInput} placeholder="Écrivez votre message..." placeholderTextColor="#9ca3af" className="flex-1 bg-dark-bg border border-dark-border rounded-full py-3 px-4 text-dark-text" editable={!isGenerating} multiline />
                    {isGenerating ? (
                        <TouchableOpacity onPress={handleStop} className="ml-3 bg-red-500 p-3 rounded-full">
                            <Feather name="stop-circle" size={24} color="white" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={handleSend} disabled={!input.trim()} className="ml-3 bg-brand-blue p-3 rounded-full">
                            <Feather name="send" size={24} color="white" />
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
