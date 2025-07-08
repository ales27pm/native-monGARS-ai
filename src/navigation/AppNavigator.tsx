// ====================================================================================
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

import ChatScreen from '../screens/ChatScreen';
import ModelManagerScreen from '../screens/ModelManagerScreen';
import SettingsScreen from '../screens/SettingsScreen';
import useAppStore from '../state/appStore';

const Tab = createBottomTabNavigator();

export function AppNavigator() {
    const theme = useAppStore((s) => s.settings.theme);
    const isDark = theme === 'dark';

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: React.ComponentProps<typeof Feather>['name'];

                    if (route.name === 'Chat') {
                        iconName = 'message-circle';
                    } else if (route.name === 'Modèles') {
                        iconName = 'cpu';
                    } else if (route.name === 'Réglages') {
                        iconName = 'settings';
                    } else {
                        iconName = 'alert-circle'; // Fallback icon
                    }

                    return <Feather name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: isDark ? '#3b82f6' : '#2563eb',
                tabBarInactiveTintColor: isDark ? '#6b7280' : '#4b5563',
                tabBarStyle: {
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    borderTopColor: isDark ? '#374151' : '#e5e7eb',
                },
                headerStyle: {
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                },
                headerTitleStyle: {
                    color: isDark ? '#f9fafb' : '#111827',
                },
                headerTitleAlign: 'center',
            })}
        >
            <Tab.Screen name="Chat" component={ChatScreen} />
            <Tab.Screen name="Modèles" component={ModelManagerScreen} />
            <Tab.Screen name="Réglages" component={SettingsScreen} />
        </Tab.Navigator>
    );
}


// ====================================================================================
// ===== End of File: src/navigation/AppNavigator.tsx =====

