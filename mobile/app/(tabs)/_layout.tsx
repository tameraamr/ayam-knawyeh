import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const C = {
  bg: '#0c0101', card: '#1e0808', cardBorder: '#3a1010',
  red: '#c8102e', redDark: '#8b0000', gold: '#d4af37',
  goldLight: '#f0d060', textPrimary: '#f5ede0',
  textSecondary: '#a08878', textMuted: '#5a3a3a',
};

import * as Updates from 'expo-updates';
import { I18nManager } from 'react-native';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  // Ensure RTL is enforced in tabs
  if (!I18nManager.isRTL && !__DEV__) {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
    Updates.reloadAsync();
  }

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: [
          styles.tabBar,
          {
            bottom: Platform.OS === 'ios' ? 24 : 16 + insets.bottom,
          }
        ],
        tabBarItemStyle: { justifyContent: 'center', alignItems: 'center', paddingTop: Platform.OS === 'android' ? 10 : 14 },
        headerStyle: { backgroundColor: C.bg, borderBottomWidth: 1, borderBottomColor: C.cardBorder, shadowOpacity: 0, elevation: 0 },
        headerTintColor: C.gold,
        headerTitleStyle: { fontWeight: '800', fontSize: 18 },
        headerTitleAlign: 'center',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'أيام كناوية',
          headerShown: false,
          tabBarIcon: ({ focused }) => <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={focused ? C.gold : C.textSecondary} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'التصنيفات',
          tabBarIcon: ({ focused }) => <Ionicons name={focused ? 'grid' : 'grid-outline'} size={24} color={focused ? C.gold : C.textSecondary} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'الإعدادات',
          tabBarIcon: ({ focused }) => <Ionicons name={focused ? 'settings' : 'settings-outline'} size={24} color={focused ? C.gold : C.textSecondary} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 24,
    right: 24,
    height: 64,
    paddingBottom: 0, // Overrides safe area insets that push icons up
    paddingTop: 0,
    backgroundColor: '#1a0505',
    borderWidth: 1,
    borderColor: '#3a1010',
    borderRadius: 32,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  }
});
