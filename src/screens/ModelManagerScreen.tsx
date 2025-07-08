// ====================================================================================
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { coreMLService } from '../api/core-ml-service';
import { CoreMLModel, DownloadProgressEvent } from '../types/ai';
import { logger } from '../utils/logger';
import { NativeEventEmitter } from 'react-native';
import { TurboModuleRegistry } from '../services/TurboModuleRegistry';

const ModelStatus = ({ model, progressInfo }: { model: CoreMLModel, progressInfo: DownloadProgressEvent | null }) => {
    if (progressInfo && progressInfo.modelId === model.id) {
        const { status, progress, error } = progressInfo;
        let message = '';
        switch (status) {
            case 'downloading':
                message = `Téléchargement... ${Math.round(progress * 100)}%`;
                break;
            case 'decompressing':
                message = 'Décompression...';
                break;
            case 'compiling':
                message = 'Compilation du modèle...';
                break;
            case 'error':
                return <Text className="text-center text-red-400 mt-2">Erreur: {error || 'Inconnue'}</Text>;
            default:
                return null;
        }

        return (
            <View className="mt-4">
                <Text className="text-center text-brand-blue mb-2">{message}</Text>
                <View className="w-full bg-gray-600 rounded-full h-2.5">
                    <View className="bg-brand-blue h-2.5 rounded-full" style={{ width: `${progress * 100}%` }}></View>
                </View>
            </View>
        );
    }
    return null;
};


const ModelItem = ({ model, onAction, isBusy }: { model: CoreMLModel, onAction: (action: 'download' | 'activate' | 'delete', modelId: string) => void, isBusy: boolean }) => {
    return (
        <View className="bg-dark-surface p-4 rounded-lg mb-4">
            <Text className="text-lg font-bold text-dark-text">{model.name}</Text>
            <Text className="text-sm text-dark-text-secondary mt-1">{model.description}</Text>
            <View className="flex-row justify-between mt-3">
                <Text className="text-xs text-gray-400">Taille: {model.sizeMB} Mo</Text>
                <Text className="text-xs text-gray-400">Contexte: {model.contextLength} tokens</Text>
            </View>

            <View className="flex-row justify-end mt-4">
                {!model.isDownloaded ? (
                    <TouchableOpacity onPress={() => onAction('download', model.id)} disabled={isBusy} className="bg-blue-600 px-4 py-2 rounded-md flex-row items-center">
                        <Feather name="download" size={16} color="white" />
                        <Text className="text-white ml-2">Télécharger</Text>
                    </TouchableOpacity>
                ) : (
                    <>
                        <TouchableOpacity onPress={() => onAction('delete', model.id)} disabled={isBusy} className="bg-red-600 px-4 py-2 rounded-md flex-row items-center mr-2">
                            <Feather name="trash-2" size={16} color="white" />
                            <Text className="text-white ml-2">Supprimer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onAction('activate', model.id)} disabled={isBusy || model.isActive} className={`${model.isActive ? 'bg-green-700' : 'bg-green-500'} px-4 py-2 rounded-md flex-row items-center`}>
                            <Feather name={model.isActive ? "check-circle" : "zap"} size={16} color="white" />
                            <Text className="text-white ml-2">{model.isActive ? 'Actif' : 'Activer'}</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
};

export default function ModelManagerScreen() {
    const [models, setModels] = useState<CoreMLModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [progressInfo, setProgressInfo] = useState<DownloadProgressEvent | null>(null);
    const [availableSpace, setAvailableSpace] = useState<string>('...');

    const isBusy = progressInfo?.status === 'downloading' || progressInfo?.status === 'decompressing' || progressInfo?.status === 'compiling';

    const fetchModels = useCallback(async () => {
        try {
            const availableModels = await coreMLService.getAvailableModels();
            const space = await coreMLService.getAvailableSpace();
            setModels(availableModels);
            setAvailableSpace(space);
        } catch (error) {
            logger.error('ModelManagerScreen', 'Erreur de récupération des modèles', error);
            Alert.alert('Erreur', `Impossible de charger les modèles: ${(error as Error).message}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchModels();

        const eventEmitter = new NativeEventEmitter(TurboModuleRegistry.LocalLLMModule);
        const subscription = eventEmitter.addListener('onDownloadProgress', (event: DownloadProgressEvent) => {
            setProgressInfo(event);
            if (event.status === 'finished' || event.status === 'activated' || event.status === 'error') {
                fetchModels(); // Rafraîchir la liste
                if (event.status !== 'error') {
                    setTimeout(() => setProgressInfo(null), 2000);
                }
            }
        });

        return () => subscription.remove();
    }, [fetchModels]);

    const handleAction = async (action: 'download' | 'activate' | 'delete', modelId: string) => {
        try {
            switch (action) {
                case 'download':
                    await coreMLService.downloadModel(modelId);
                    break;
                case 'activate':
                    await coreMLService.activateModel(modelId);
                    Alert.alert('Succès', 'Modèle activé.');
                    break;
                case 'delete':
                    await coreMLService.deleteModel(modelId);
                    Alert.alert('Succès', 'Modèle supprimé.');
                    break;
            }
        } catch (error) {
            logger.error('ModelManagerScreen', `Erreur lors de l'action ${action}`, error);
            Alert.alert('Erreur', `L'action a échoué: ${(error as Error).message}`);
        }
    };

    if (isLoading) {
        return <View className="flex-1 justify-center items-center bg-dark-bg"><ActivityIndicator size="large" color="#3b82f6" /></View>;
    }

    return (
        <ScrollView className="flex-1 bg-dark-bg p-4">
             <View className="bg-dark-surface p-4 rounded-lg mb-6">
                <Text className="text-lg font-bold text-dark-text">Stockage de l'appareil</Text>
                <Text className="text-dark-text-secondary mt-1">Espace disponible : {availableSpace}</Text>
            </View>
            <FlatList
                data={models}
                renderItem={({ item }) => (
                    <View>
                        <ModelItem 
                            model={item} 
                            onAction={handleAction} 
                            isBusy={isBusy && progressInfo?.modelId === item.id}
                        />
                         <ModelStatus model={item} progressInfo={progressInfo} />
                    </View>
                )}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={() => (
                    <View className="items-center mt-10">
                        <Text className="text-dark-text-secondary">Aucun modèle disponible.</Text>
                        <Text className="text-dark-text-secondary text-center mt-2">Vérifiez votre connexion et le catalogue de modèles.</Text>
                    </View>
                )}
                scrollEnabled={false}
            />
        </ScrollView>
    );
}


// ====================================================================================
// ===== End of File: src/screens/ModelManagerScreen.tsx =====

