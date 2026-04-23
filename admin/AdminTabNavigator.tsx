import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import type { AdminTabParamList } from '../../types';

import AdminDashboard from './AdminDashboard';
import DoctorManagement from './DoctorManagement';
import UserManagement from './UserManagement';
import NotificationControl from './NotificationControl';
import AdminSettings from './AdminSettings';

const AdminTab = createBottomTabNavigator<AdminTabParamList>();

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<
  keyof AdminTabParamList,
  { active: IoniconsName; inactive: IoniconsName }
> = {
  Dashboard:     { active: 'bar-chart',       inactive: 'bar-chart-outline' },
  Doctors:       { active: 'medical',         inactive: 'medical-outline' },
  Users:         { active: 'people',          inactive: 'people-outline' },
  Notifications: { active: 'notifications',   inactive: 'notifications-outline' },
  AdminSettings: { active: 'settings',        inactive: 'settings-outline' },
};

export default function AdminTabNavigator() {
  return (
    <AdminTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          const icons = TAB_ICONS[route.name as keyof AdminTabParamList] ?? TAB_ICONS.Dashboard;
          return (
            <Ionicons
              name={focused ? icons.active : icons.inactive}
              size={22}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.white,
        headerTitleStyle: styles.headerTitle,
      })}
    >
      <AdminTab.Screen
        name="Dashboard"
        component={AdminDashboard}
        options={{ title: 'Analytics' }}
      />
      <AdminTab.Screen
        name="Doctors"
        component={DoctorManagement}
        options={{ title: 'Doctors' }}
      />
      <AdminTab.Screen
        name="Users"
        component={UserManagement}
        options={{ title: 'Users' }}
      />
      <AdminTab.Screen
        name="Notifications"
        component={NotificationControl}
        options={{ title: 'Notify' }}
      />
      <AdminTab.Screen
        name="AdminSettings"
        component={AdminSettings}
        options={{ title: 'Settings' }}
      />
    </AdminTab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.primary,
    height: 60,
    paddingBottom: 8,
    paddingTop: 4,
    borderTopWidth: 0,
  },
  tabLabel: {
    fontSize: 11,
  },
  headerTitle: {
    fontWeight: '600' as const,
  },
});
