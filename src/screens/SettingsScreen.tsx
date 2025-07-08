// ====================================================================================
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Switch } from 'react-native';
import useAppStore from '../state/appStore';
import { AIProvider, ServiceStatus } from '../types/ai';

const providers: AIProvider[] = ['local', 'openai', 'anthropic', 'grok'];

const ProviderStatusIndicator = ({ status }: { status: ServiceStatus }) => {
    const color = status.ok ? 'bg-green-500' : 'bg-red-500';
    const text = status.ok ? 'Opérationnel' : status.error === 'missing_key' ? 'Clé manquante' : 'Erreur';
    return (
        <View className="flex-row items-center">
            <View className={`w-2.5 h-2.5 rounded-full mr-2 ${color}`} />
            <Text className="text-sm text-dark-text-secondary">{text}</Text>
        </View>
    );
};

export default function SettingsScreen() {
    const {
        settings,
        serviceStatus,
        setApiKey,
        setDefaultProvider,
        checkAllServices,
        setTheme,
        apiKeys,
        loadSettings,
        setUseMetal
    } = useAppStore();
    
    const [localApiKeys, setLocalApiKeys] = useState(apiKeys);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    useEffect(() => {
        setLocalApiKeys(apiKeys);
    }, [apiKeys]);

    const handleSave = async () => {
        setIsChecking(true);
        await setApiKey('openai', localApiKeys.openai);
        await setApiKey('anthropic', localApiKeys.anthropic);
        await setApiKey('grok', localApiKeys.grok);
        await checkAllServices();
        setIsChecking(false);
    };

    const handleKeyChange = (provider: 'openai' | 'anthropic' | 'grok', value: string) => {
        setLocalApiKeys(prev => ({ ...prev, [provider]: value }));
    };

    return (
        <ScrollView className="flex-1 bg-dark-bg p-4">
            <View className="mb-6 p-4 bg-dark-surface rounded-lg">
                <Text className="text-xl font-bold text-dark-text mb-4">Fournisseur IA par défaut</Text>
                <View className="flex-row flex-wrap">
                    {providers.map(p => (
                        <TouchableOpacity
                            key={p}
                            onPress={() => setDefaultProvider(p)}
                            className={`px-4 py-2 rounded-full mr-2 mb-2 border-2 ${
                                settings.defaultProvider === p ? 'bg-brand-blue border-brand-blue' : 'border-dark-border'
                            }`}
                        >
                            <Text className={`capitalize font-semibold ${settings.defaultProvider === p ? 'text-white' : 'text-dark-text'}`}>{p}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View className="mb-6 p-4 bg-dark-surface rounded-lg">
                <Text className="text-xl font-bold text-dark-text mb-4">Clés API des services Cloud</Text>
                
                <View className="mb-4">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-lg text-dark-text">OpenAI</Text>
                        <ProviderStatusIndicator status={serviceStatus.openai} />
                    </View>
                    <TextInput
                        value={localApiKeys.openai}
                        onChangeText={text => handleKeyChange('openai', text)}
                        placeholder="sk-..."
                        secureTextEntry
                        className="bg-dark-bg border border-dark-border rounded-md p-3 text-dark-text"
                        placeholderTextColor="#6b7280"
                    />
                </View>

                <View className="mb-4">
                     <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-lg text-dark-text">Anthropic</Text>
                        <ProviderStatusIndicator status={serviceStatus.anthropic} />
                    </View>
                    <TextInput
                        value={localApiKeys.anthropic}
                        onChangeText={text => handleKeyChange('anthropic', text)}
                        placeholder="sk-ant-..."
                        secureTextEntry
                        className="bg-dark-bg border border-dark-border rounded-md p-3 text-dark-text"
                        placeholderTextColor="#6b7280"
                    />
                </View>
                
                <View className="mb-4">
                     <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-lg text-dark-text">Grok (xAI)</Text>
                        <ProviderStatusIndicator status={serviceStatus.grok} />
                    </View>
                    <TextInput
                        value={localApiKeys.grok}
                        onChangeText={text => handleKeyChange('grok', text)}
                        placeholder="xai-..."
                        secureTextEntry
                        className="bg-dark-bg border border-dark-border rounded-md p-3 text-dark-text"
                        placeholderTextColor="#6b7280"
                    />
                </View>

                <TouchableOpacity onPress={handleSave} disabled={isChecking} className="bg-brand-blue rounded-md p-4 flex-row justify-center items-center mt-2">
                    {isChecking ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">Enregistrer et Vérifier</Text>}
                </TouchableOpacity>
            </View>

            <View className="p-4 bg-dark-surface rounded-lg">
                <Text className="text-xl font-bold text-dark-text mb-4">Apparence</Text>
                <View className="flex-row justify-between items-center">
                    <Text className="text-lg text-dark-text">Thème sombre</Text>
                    <Switch
                        value={settings.theme === 'dark'}
                        onValueChange={(value) => setTheme(value ? 'dark' : 'light')}
                        trackColor={{ false: "#767577", true: "#3b82f6" }}
                        thumbColor={settings.theme === 'dark' ? "#f4f3f4" : "#f4f3f4"}
                    />
                </View>
            </View>

            <View className="p-4 bg-dark-surface rounded-lg">
                <Text className="text-xl font-bold text-dark-text mb-4">Paramètres du LLM local</Text>
                <View className="flex-row justify-between items-center">
                    <Text className="text-lg text-dark-text">Utiliser Metal</Text>
                    <Switch
                        value={settings.useMetal}
                        onValueChange={(value) => setUseMetal(value)}
                        trackColor={{ false: "#767577", true: "#3b82f6" }}
                        thumbColor={settings.useMetal ? "#f4f3f4" : "#f4f3f4"}
                    />
                </View>
            </View>
        </ScrollView>
    );
}


// ====================================================================================
// ===== End of File: src/screens/SettingsScreen.tsx =====

