// ====================================================================================
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import * as Updates from 'expo-updates';
import { logger } from '../utils/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary', 'Uncaught error:', { error: error.toString(), stack: errorInfo.componentStack });
  }
  
  private handleReload = () => {
      Updates.reloadAsync();
  }

  public render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 justify-center items-center bg-red-900 p-5">
            <Text className="text-2xl font-bold text-red-100 mb-4">Oops! Une erreur est survenue.</Text>
            <Text className="text-center text-red-200 mb-6">L'application a rencontré un problème inattendu. Vous pouvez essayer de la recharger.</Text>
            <TouchableOpacity onPress={this.handleReload} className="bg-red-500 px-6 py-3 rounded-lg">
                <Text className="text-white font-bold text-lg">Recharger l'application</Text>
            </TouchableOpacity>
             <ScrollView className="mt-6 bg-red-800 p-3 rounded-md w-full max-h-60">
                <Text className="text-red-200 font-mono">{this.state.error?.toString()}</Text>
            </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}


// ====================================================================================
// ===== End of File: src/components/ErrorBoundary.tsx =====

