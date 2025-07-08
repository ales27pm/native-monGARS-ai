// ====================================================================================
import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AIMessage } from '../types/ai';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MessageBubbleProps {
    message: AIMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === 'user';
    
    const bubbleStyle = isUser
        ? 'bg-brand-blue self-end'
        : message.isError ? 'bg-red-500 self-start' : 'bg-dark-surface self-start';
    
    const textStyle = isUser ? 'text-white' : 'text-dark-text';

    return (
        <View className={`my-2 max-w-[85%] rounded-2xl p-3 ${bubbleStyle}`}>
            {message.isError && (
                 <View className="flex-row items-center mb-1">
                    <Feather name="alert-triangle" size={16} color="#fecaca" />
                    <Text className="ml-2 font-bold text-red-100">Erreur</Text>
                </View>
            )}
            <Text className={`text-base ${textStyle}`}>{message.content}</Text>
            <Text className={`text-xs mt-2 self-end ${isUser ? 'text-blue-200' : 'text-dark-text-secondary'}`}>
                {format(new Date(message.timestamp), 'HH:mm', { locale: fr })}
            </Text>
        </View>
    );
}


// ====================================================================================
// ===== End of File: src/components/MessageBubble.tsx =====

