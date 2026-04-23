import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
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
import { getNotificationLogs, logNotification } from '../../lib/admin';
import { sendInstantNotification } from '../../lib/notificationService';
import { useAuth } from '../../context/AuthContext';
import type { NotificationLog } from '../../types';

const TEMPLATES = [
  { label: '🎉 Discount', title: 'Special Offer — 50% Off!', body: 'Book your appointment today and save 50% on consultation fees. Limited slots available.' },
  { label: '📅 Reminder', title: 'Appointment Reminder', body: "Don't forget your upcoming appointment. We look forward to seeing you." },
  { label: '👨‍⚕️ New Doctor', title: 'New Specialist Available!', body: 'A new specialist has joined our team. Book your appointment today.' },
  { label: '🏥 Checkup', title: 'Annual Checkup Due', body: 'Stay ahead of your health. Schedule your annual checkup with our specialists.' },
];

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationControl() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      setLogs(await getNotificationLogs());
    } catch {
      /* silent */
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const applyTemplate = (t: typeof TEMPLATES[number]) => {
    setTitle(t.title);
    setBody(t.body);
  };

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Missing Fields', 'Both title and message are required.');
      return;
    }
    setSending(true);
    try {
      await sendInstantNotification(title.trim(), body.trim());
      await logNotification({
        title: title.trim(),
        body: body.trim(),
        target: 'all',
        sentBy: user?.id ?? '',
      });
      setTitle('');
      setBody('');
      Alert.alert('Sent!', 'Notification dispatched successfully.');
      loadLogs();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const renderLog = useCallback(({ item }: { item: NotificationLog }) => (
    <View style={styles.logCard}>
      <View style={styles.logIcon}>
        <Ionicons name="notifications" size={18} color={Colors.accent} />
      </View>
      <View style={styles.logBody}>
        <View style={styles.logRow}>
          <Text style={styles.logTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.logTime}>{timeAgo(item.sent_at)}</Text>
        </View>
        <Text style={styles.logMsg} numberOfLines={2}>{item.body}</Text>
        <View style={styles.logMeta}>
          <Ionicons name="people-outline" size={11} color={Colors.textMuted} />
          <Text style={styles.logTarget}>{item.target === 'all' ? 'All Users' : 'Specific User'}</Text>
        </View>
      </View>
    </View>
  ), []);

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <FlatList
        data={logs}
        keyExtractor={l => l.id}
        renderItem={renderLog}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Compose Card */}
            <View style={styles.composeCard}>
              <Text style={styles.sectionTitle}>Compose Notification</Text>

              <Text style={styles.fieldLabel}>Quick Templates</Text>
              <View style={styles.templateRow}>
                {TEMPLATES.map(t => (
                  <TouchableOpacity
                    key={t.label}
                    style={styles.templateChip}
                    onPress={() => applyTemplate(t)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.templateChipText}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Notification title…"
                placeholderTextColor={Colors.inputBorder}
                maxLength={80}
              />
              <Text style={styles.charCount}>{title.length}/80</Text>

              <Text style={styles.fieldLabel}>Message *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={body}
                onChangeText={setBody}
                placeholder="Write your message here…"
                placeholderTextColor={Colors.inputBorder}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={200}
              />
              <Text style={styles.charCount}>{body.length}/200</Text>

              <View style={styles.sendRow}>
                <View style={styles.targetInfo}>
                  <Ionicons name="people" size={16} color={Colors.textMuted} />
                  <Text style={styles.targetText}>Broadcast to all users</Text>
                </View>
                <TouchableOpacity
                  style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
                  onPress={handleSend}
                  disabled={sending}
                  activeOpacity={0.85}
                >
                  {sending ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <>
                      <Ionicons name="send" size={16} color={Colors.white} />
                      <Text style={styles.sendBtnText}>Send Now</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* History header */}
            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>Notification History</Text>
              <TouchableOpacity onPress={loadLogs}>
                <Ionicons name="refresh" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {logsLoading && (
              <View style={styles.logsLoading}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          !logsLoading ? (
            <View style={styles.emptyLogs}>
              <Ionicons name="notifications-off-outline" size={36} color={Colors.inputBorder} />
              <Text style={styles.emptyText}>No notifications sent yet.</Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  header: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  composeCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    ...Shadow.card,
    gap: 4,
  },
  sectionTitle: {
    fontSize: FontSize.subheader,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  fieldLabel: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  templateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  templateChip: {
    backgroundColor: Colors.primary + '12',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  templateChipText: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.medium,
    color: Colors.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  textArea: {
    height: 88,
  },
  charCount: {
    fontSize: FontSize.caption,
    color: Colors.inputBorder,
    textAlign: 'right',
    marginTop: 2,
  },
  sendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  targetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  targetText: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    minWidth: 110,
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.6,
  },
  sendBtnText: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.semibold,
    color: Colors.white,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logsLoading: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  emptyLogs: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    gap: Spacing.xs,
  },
  emptyText: {
    fontSize: FontSize.small,
    color: Colors.textMuted,
  },
  logCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  logIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logBody: {
    flex: 1,
    gap: 3,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  logTitle: {
    flex: 1,
    fontSize: FontSize.small,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  logTime: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
    flexShrink: 0,
  },
  logMsg: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  logTarget: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
  },
});
