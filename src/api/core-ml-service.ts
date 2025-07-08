// ====================================================================================
import { TurboModuleRegistry } from '../services/TurboModuleRegistry';
import { CoreMLModel } from '../types/ai';
import { logger } from '../utils/logger';

class CoreMLService {
    private module = TurboModuleRegistry.LocalLLMModule;

    public async initialize(): Promise<void> {
        logger.info('CoreMLService', 'Initialisation du service CoreML.');
        return Promise.resolve();
    }

    public getAvailableModels(): Promise<CoreMLModel[]> {
        logger.info('CoreMLService', 'Récupération des modèles disponibles...');
        return this.module.getAvailableModels();
    }

    public downloadModel(modelId: string): Promise<void> {
        logger.info('CoreMLService', `Lancement du téléchargement pour le modèle: ${modelId}`);
        return this.module.downloadModel(modelId);
    }

    public activateModel(modelId: string): Promise<void> {
        logger.info('CoreMLService', `Activation du modèle: ${modelId}`);
        return this.module.loadModel(modelId);
    }

    public deleteModel(modelId: string): Promise<void> {
        logger.info('CoreMLService', `Suppression du modèle: ${modelId}`);
        return this.module.deleteModel(modelId);
    }
    
    public cancelDownload(modelId: string): Promise<void> {
        logger.info('CoreMLService', `Annulation du téléchargement pour: ${modelId}`);
        return this.module.cancelDownload(modelId);
    }

    public generateStream(messages: AIMessage[]): Promise<void> {
        logger.info('CoreMLService', 'Génération de texte en streaming avec le modèle local actif...');
        const nativeMessages = messages.map(({ role, content }) => ({ role, content }));
        return this.module.generateStream(nativeMessages);
    }

    public stopGeneration(): Promise<void> {
        logger.info('CoreMLService', 'Arrêt de la génération de texte...');
        return this.module.stopGeneration();
    }
    
    public getAvailableSpace(): Promise<string> {
        logger.info('CoreMLService', 'Récupération de l\'espace disque disponible...');
        return this.module.getAvailableSpace();
    }
}

export const coreMLService = new CoreMLService();


// ====================================================================================
// ===== End of File: src/api/core-ml-service.ts =====

