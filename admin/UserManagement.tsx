import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
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
import { getAllProfiles, getUserAppointments, toggleBlockUser } from '../../lib/admin';
import { formatDate } from '../../lib/utils';
import type { Profile, Appointment } from '../../types';

function UserAvatar({ name, isBlocked }: { name: string; isBlocked: boolean }) {
  const initials = (name || '?')
    .split(' ')
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  return (
    <View style={[styles.avatar, isBlocked && styles.avatarBlocked]}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}

interface BookingHistoryModalProps {
  user: Profile | null;
  onClose: () => void;
}

function BookingHistoryModal({ user, onClose }: BookingHistoryModalProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getUserAppointments(user.id)
      .then(setAppointments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalScreen} edges={['top', 'bottom']}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.modalTitleBlock}>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {user.full_name ?? user.email ?? 'User'}
            </Text>
            <Text style={styles.modalSub}>Booking History</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : appointments.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="calendar-outline" size={40} color={Colors.inputBorder} />
            <Text style={styles.emptyText}>No appointments found.</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
            {appointments.map(appt => (
              <View key={appt.id} style={styles.apptCard}>
                <View style={styles.apptRow}>
                  <Text style={styles.apptDoctor} numberOfLines={1}>
                    {appt.doctor?.name ?? 'Unknown Doctor'}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      appt.status === 'confirmed' ? styles.badgeConfirmed : styles.badgeCancelled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        appt.status === 'confirmed' ? styles.textConfirmed : styles.textCancelled,
                      ]}
                    >
                      {appt.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.apptMeta}>
                  {appt.doctor?.specialty} · {formatDate(appt.appointment_date)}
                </Text>
                <Text style={styles.apptMeta}>
                  {appt.time_slot} · {appt.location}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

export default function UserManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setProfiles(await getAllProfiles());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleBlock = (user: Profile) => {
    const action = user.is_blocked ? 'Unblock' : 'Block';
    Alert.alert(
      `${action} User`,
      `${action} ${user.full_name ?? user.email ?? 'this user'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action,
          style: user.is_blocked ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await toggleBlockUser(user.id, !user.is_blocked);
              setProfiles(prev =>
                prev.map(p =>
                  p.id === user.id ? { ...p, is_blocked: !p.is_blocked } : p
                )
              );
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'Action failed');
            }
          },
        },
      ]
    );
  };

  const filtered = profiles.filter(p => {
    const q = search.toLowerCase();
    return (
      (p.full_name ?? '').toLowerCase().includes(q) ||
      (p.email ?? '').toLowerCase().includes(q)
    );
  });

  const renderItem = useCallback(({ item }: { item: Profile }) => (
    <View style={[styles.card, item.is_blocked && styles.cardBlocked]}>
      <UserAvatar name={item.full_name ?? item.email ?? '?'} isBlocked={item.is_blocked} />
      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>
          {item.full_name ?? '—'}
        </Text>
        <Text style={styles.userEmail} numberOfLines={1}>{item.email ?? '—'}</Text>
        <View style={styles.userMeta}>
          <View style={styles.countBadge}>
            <Ionicons name="calendar-outline" size={11} color={Colors.primary} />
            <Text style={styles.countText}>{item.appointment_count ?? 0} bookings</Text>
          </View>
          {item.is_admin && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          )}
          {item.is_blocked && (
            <View style={styles.blockedBadge}>
              <Text style={styles.blockedBadgeText}>Blocked</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.historyBtn}
          onPress={() => setSelectedUser(item)}
        >
          <Ionicons name="list-outline" size={18} color={Colors.primary} />
        </TouchableOpacity>
        {!item.is_admin && (
          <TouchableOpacity
            style={[styles.blockBtn, item.is_blocked && styles.unblockBtn]}
            onPress={() => handleBlock(item)}
          >
            <Ionicons
              name={item.is_blocked ? 'lock-open-outline' : 'ban-outline'}
              size={18}
              color={item.is_blocked ? Colors.success : Colors.error}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  ), []);

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name or email…"
          placeholderTextColor={Colors.inputBorder}
        />
        {!!search && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color={Colors.error} />
          <Text style={styles.errorMsg}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={p => p.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <Text style={styles.listHeader}>
              {filtered.length} user{filtered.length !== 1 ? 's' : ''} found
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="people-outline" size={40} color={Colors.inputBorder} />
              <Text style={styles.emptyText}>
                {search ? 'No users match your search.' : 'No users registered yet.'}
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {selectedUser && (
        <BookingHistoryModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
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
    gap: Spacing.sm,
    paddingTop: Spacing.xl,
  },
  errorMsg: {
    fontSize: FontSize.small,
    color: Colors.error,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emptyText: {
    fontSize: FontSize.small,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Shadow.card,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    padding: 0,
  },
  list: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  listHeader: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  cardBlocked: {
    opacity: 0.75,
    borderWidth: 1,
    borderColor: Colors.errorBorder,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarBlocked: {
    backgroundColor: Colors.textMuted,
  },
  avatarText: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  userEmail: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
    flexWrap: 'wrap',
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.primary + '12',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  countText: {
    fontSize: FontSize.caption,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  adminBadge: {
    backgroundColor: '#7c3aed22',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  adminBadgeText: {
    fontSize: FontSize.caption,
    color: '#7c3aed',
    fontWeight: FontWeight.semibold,
  },
  blockedBadge: {
    backgroundColor: Colors.badgeCancelledBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  blockedBadgeText: {
    fontSize: FontSize.caption,
    color: Colors.badgeCancelledText,
    fontWeight: FontWeight.medium,
  },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexShrink: 0,
  },
  historyBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.errorBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unblockBtn: {
    backgroundColor: '#dcfce7',
  },

  /* Modal */
  modalScreen: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  modalTitleBlock: {
    flex: 1,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: FontSize.subheader,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  modalSub: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
  },
  modalBody: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  apptCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  apptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  apptDoctor: {
    flex: 1,
    fontSize: FontSize.small,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  badgeConfirmed: {
    backgroundColor: Colors.badgeConfirmedBg,
  },
  badgeCancelled: {
    backgroundColor: Colors.badgeCancelledBg,
  },
  statusText: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.medium,
    textTransform: 'capitalize',
  },
  textConfirmed: {
    color: Colors.badgeConfirmedText,
  },
  textCancelled: {
    color: Colors.badgeCancelledText,
  },
  apptMeta: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
  },
});
