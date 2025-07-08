// ====================================================================================
export type AIProvider = 'local' | 'openai' | 'anthropic' | 'grok';

export interface AIMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    isError?: boolean;
}

export interface ApiKeys {
    openai: string;
    anthropic: string;
    grok: string;
}

export interface ServiceStatus {
    ok: boolean;
    error: string | null;
}

export interface CoreMLModel {
    id: string;
    name: string;
    description: string;
    sizeMB: number;
    contextLength: number;
    isDownloaded: boolean;
    isActive: boolean;
    url: string;
}

export interface DownloadProgressEvent {
    modelId: string;
    progress: number; // 0.0 to 1.0
    status: 'downloading' | 'decompressing' | 'compiling' | 'finished' | 'activated' | 'error' | 'cancelled';
    error?: string;
}

export interface AppSettings {
    theme: 'light' | 'dark';
    defaultProvider: AIProvider;
    useMetal: boolean;
}

export interface AppState {
    settings: AppSettings;
    apiKeys: ApiKeys;
    serviceStatus: Record<AIProvider, ServiceStatus>;
    setTheme: (theme: 'light' | 'dark') => void;
    setDefaultProvider: (provider: AIProvider) => void;
    setUseMetal: (useMetal: boolean) => void;
    setApiKey: (provider: keyof ApiKeys, key: string) => Promise<void>;
    loadSettings: () => Promise<void>;
    checkService: (provider: AIProvider) => Promise<void>;
    checkAllServices: () => Promise<void>;
}

// ====================================================================================
// ===== End of File: src/types/ai.ts =====

