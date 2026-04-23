import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Colors,
  FontSize,
  FontWeight,
  Radius,
  Shadow,
  Spacing,
} from '../../constants/theme';
import { getAppSettings, updateAppSetting } from '../../lib/admin';
import { useAuth } from '../../context/AuthContext';

interface SettingsState {
  notifications_enabled: boolean;
  max_bookings_per_day: string;
  default_consultation_fee: string;
  max_doctors_per_specialty: string;
}

const DEFAULTS: SettingsState = {
  notifications_enabled: true,
  max_bookings_per_day: '10',
  default_consultation_fee: '150',
  max_doctors_per_specialty: '5',
};

function SettingsRow({
  label,
  sub,
  icon,
  children,
}: {
  label: string;
  sub?: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>
        <Ionicons
          name={icon as React.ComponentProps<typeof Ionicons>['name']}
          size={18}
          color={Colors.primary}
        />
      </View>
      <View style={styles.settingText}>
        <Text style={styles.settingLabel}>{label}</Text>
        {!!sub && <Text style={styles.settingSub}>{sub}</Text>}
      </View>
      <View style={styles.settingControl}>{children}</View>
    </View>
  );
}

export default function AdminSettings() {
  const { signOut } = useAuth();
  const [settings, setSettings] = useState<SettingsState>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const raw = await getAppSettings();
      setSettings({
        notifications_enabled: raw.notifications_enabled !== 'false',
        max_bookings_per_day: raw.max_bookings_per_day ?? '10',
        default_consultation_fee: raw.default_consultation_fee ?? '150',
        max_doctors_per_specialty: raw.max_doctors_per_specialty ?? '5',
      });
      setDirty(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = useCallback(
    <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
      setSettings(prev => ({ ...prev, [key]: value }));
      setDirty(true);
    },
    []
  );

  const handleSave = async () => {
    const fee = parseInt(settings.default_consultation_fee, 10);
    const maxBookings = parseInt(settings.max_bookings_per_day, 10);
    const maxDocs = parseInt(settings.max_doctors_per_specialty, 10);

    if (isNaN(fee) || fee < 0) { Alert.alert('Invalid', 'Consultation fee must be a positive number.'); return; }
    if (isNaN(maxBookings) || maxBookings < 1) { Alert.alert('Invalid', 'Max bookings must be at least 1.'); return; }
    if (isNaN(maxDocs) || maxDocs < 1) { Alert.alert('Invalid', 'Max doctors must be at least 1.'); return; }

    setSaving(true);
    try {
      await Promise.all([
        updateAppSetting('notifications_enabled', String(settings.notifications_enabled)),
        updateAppSetting('max_bookings_per_day', String(maxBookings)),
        updateAppSetting('default_consultation_fee', String(fee)),
        updateAppSetting('max_doctors_per_specialty', String(maxDocs)),
      ]);
      setDirty(false);
      Alert.alert('Saved', 'Settings updated successfully.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Sign out of the admin panel?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color={Colors.errorText} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <SettingsRow
              label="Push Notifications"
              sub="Send alerts to patients"
              icon="notifications-outline"
            >
              <Switch
                value={settings.notifications_enabled}
                onValueChange={v => set('notifications_enabled', v)}
                trackColor={{ false: Colors.inputBorder, true: Colors.accent }}
                thumbColor={Colors.white}
              />
            </SettingsRow>
          </View>
        </View>

        {/* Booking Limits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Limits</Text>
          <View style={styles.card}>
            <SettingsRow
              label="Max Bookings / Day"
              sub="System-wide daily cap"
              icon="calendar-outline"
            >
              <TextInput
                style={styles.numericInput}
                value={settings.max_bookings_per_day}
                onChangeText={v => set('max_bookings_per_day', v.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                maxLength={4}
              />
            </SettingsRow>

            <View style={styles.divider} />

            <SettingsRow
              label="Max Doctors / Specialty"
              sub="Cap per medical specialty"
              icon="medical-outline"
            >
              <TextInput
                style={styles.numericInput}
                value={settings.max_doctors_per_specialty}
                onChangeText={v => set('max_doctors_per_specialty', v.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                maxLength={3}
              />
            </SettingsRow>
          </View>
        </View>

        {/* Financials */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financials</Text>
          <View style={styles.card}>
            <SettingsRow
              label="Default Consultation Fee"
              sub="Applied to new doctors ($)"
              icon="cash-outline"
            >
              <TextInput
                style={styles.numericInput}
                value={settings.default_consultation_fee}
                onChangeText={v => set('default_consultation_fee', v.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                maxLength={5}
              />
            </SettingsRow>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Info</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>App Name</Text>
              <Text style={styles.infoValue}>MedCare Mobile</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Admin Panel</Text>
              <Text style={styles.infoValue}>v2.0</Text>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, !dirty && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!dirty || saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Ionicons name="save-outline" size={18} color={Colors.white} />
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.errorBg,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.errorBorder,
  },
  errorText: {
    flex: 1,
    fontSize: FontSize.small,
    color: Colors.errorText,
  },
  section: {
    gap: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    ...Shadow.card,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  settingSub: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  settingControl: {
    flexShrink: 0,
  },
  numericInput: {
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    width: 72,
    textAlign: 'center',
    backgroundColor: Colors.surface,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginHorizontal: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  infoLabel: {
    fontSize: FontSize.small,
    color: Colors.textMuted,
  },
  infoValue: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
  saveBtnDisabled: {
    opacity: 0.45,
  },
  saveBtnText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: Colors.white,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.errorBg,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.errorBorder,
  },
  signOutText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: Colors.error,
  },
});
