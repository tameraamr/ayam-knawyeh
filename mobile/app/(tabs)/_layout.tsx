import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, TAB_BAR_HEIGHT } from '@/theme';

// RTL is forced once in app/_layout.tsx (with a reload), so it isn't repeated here.

type IconName = React.ComponentProps<typeof Ionicons>['name'];
const tabIcon = (active: IconName, inactive: IconName) =>
  ({ focused, color }: { focused: boolean; color: string }) =>
    <Ionicons name={focused ? active : inactive} size={23} color={color} />;

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        // Labels under the icons: easier for everyone, especially older readers.
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.soft,
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11.5, marginTop: 2 },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          borderTopWidth: 1,
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
        },
        headerStyle: { backgroundColor: colors.masthead },
        headerShadowVisible: false,
        headerTintColor: colors.onMasthead,
        headerTitleStyle: { fontFamily: fonts.bold, fontSize: 18 },
        headerTitleAlign: 'center',
        sceneStyle: { backgroundColor: colors.page },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'الرئيسية',
          headerShown: false,
          tabBarIcon: tabIcon('home', 'home-outline'),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'التصنيفات',
          tabBarIcon: tabIcon('grid', 'grid-outline'),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'الإعدادات',
          tabBarIcon: tabIcon('settings', 'settings-outline'),
        }}
      />
    </Tabs>
  );
}
