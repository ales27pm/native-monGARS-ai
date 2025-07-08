import type { TurboModule } from 'react-native';
import { Int32, Float } from 'react-native/Libraries/Types/CodegenTypes';
import { CoreMLModel, AIMessage } from './ai';

type NativeAIMessage = Omit<AIMessage, 'id' | 'timestamp' | 'isError'>;

export interface Spec extends TurboModule {
    getAvailableModels(): Promise<CoreMLModel[]>;
    downloadModel(modelId: string): Promise<void>;
    loadModel(modelId: string): Promise<void>;
    deleteModel(modelId: string): Promise<void>;
    cancelDownload(modelId: string): Promise<void>;
    generateText(prompt: string, maxTokens: Int32, temperature: Float, seed: Int32): Promise<string>;
    generateStream(messages: NativeAIMessage[]): Promise<void>;
    stopGeneration(): Promise<void>;
    getAvailableSpace(): Promise<string>;
    addListener(eventName: string): void;
    removeListeners(count: Int32): void;
}


