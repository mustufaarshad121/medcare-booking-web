import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
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
import {
  getAllDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from '../../lib/admin';
import type { DoctorWithFee } from '../../types';

const SPECIALTIES = [
  'Oncology',
  'Pulmonology',
  'Cardiology',
  'Family Medicine',
  'Internal Medicine',
];

const LOCATIONS = ['New York', 'London', 'Dubai'];

const AVATAR_COLORS = [
  '#c0392b', '#2980b9', '#27ae60', '#16a085',
  '#e67e22', '#8e44ad', '#d35400', '#0f3460',
];

interface FormState {
  name: string;
  specialty: string;
  location: string;
  bio: string;
  avatar_color: string;
  consultation_fee: string;
  is_available: boolean;
}

const EMPTY_FORM: FormState = {
  name: '',
  specialty: SPECIALTIES[0],
  location: LOCATIONS[0],
  bio: '',
  avatar_color: AVATAR_COLORS[0],
  consultation_fee: '150',
  is_available: true,
};

function doctorToForm(d: DoctorWithFee): FormState {
  return {
    name: d.name,
    specialty: d.specialty,
    location: d.location,
    bio: d.bio ?? '',
    avatar_color: d.avatar_color ?? AVATAR_COLORS[0],
    consultation_fee: String(d.consultation_fee),
    is_available: d.is_available,
  };
}

function DoctorAvatar({ color, name }: { color: string; name: string }) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  return (
    <View style={[styles.avatar, { backgroundColor: color }]}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}

interface ChipRowProps {
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
}

function ChipRow({ options, selected, onSelect }: ChipRowProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt}
          style={[styles.chip, selected === opt && styles.chipActive]}
          onPress={() => onSelect(opt)}
          activeOpacity={0.8}
        >
          <Text style={[styles.chipText, selected === opt && styles.chipTextActive]}>
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

interface DoctorModalProps {
  visible: boolean;
  editTarget: DoctorWithFee | null;
  onClose: () => void;
  onSaved: () => void;
}

function DoctorModal({ visible, editTarget, onClose, onSaved }: DoctorModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (visible) {
      setForm(editTarget ? doctorToForm(editTarget) : EMPTY_FORM);
      setFormError('');
    }
  }, [visible, editTarget]);

  const set = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) =>
      setForm(prev => ({ ...prev, [key]: value })),
    []
  );

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('Name is required.'); return; }
    const fee = parseInt(form.consultation_fee, 10);
    if (isNaN(fee) || fee < 0) { setFormError('Enter a valid consultation fee.'); return; }

    setSaving(true);
    setFormError('');
    try {
      const payload = {
        name: form.name.trim(),
        specialty: form.specialty,
        location: form.location,
        bio: form.bio.trim(),
        avatar_color: form.avatar_color,
        consultation_fee: fee,
        is_available: form.is_available,
      };
      if (editTarget) {
        await updateDoctor(editTarget.id, payload);
      } else {
        await createDoctor(payload);
      }
      onSaved();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalScreen} edges={['top', 'bottom']}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {editTarget ? 'Edit Doctor' : 'Add Doctor'}
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={styles.saveBtn}
          >
            {saving
              ? <ActivityIndicator size="small" color={Colors.white} />
              : <Text style={styles.saveBtnText}>Save</Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
          {!!formError && (
            <View style={styles.formError}>
              <Text style={styles.formErrorText}>{formError}</Text>
            </View>
          )}

          <Text style={styles.fieldLabel}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={v => set('name', v)}
            placeholder="Dr. Jane Smith"
            placeholderTextColor={Colors.inputBorder}
          />

          <Text style={styles.fieldLabel}>Specialty</Text>
          <ChipRow options={SPECIALTIES} selected={form.specialty} onSelect={v => set('specialty', v)} />

          <Text style={styles.fieldLabel}>Location</Text>
          <ChipRow options={LOCATIONS} selected={form.location} onSelect={v => set('location', v)} />

          <Text style={styles.fieldLabel}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.bio}
            onChangeText={v => set('bio', v)}
            placeholder="Professional background and specializations…"
            placeholderTextColor={Colors.inputBorder}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={styles.fieldLabel}>Consultation Fee ($)</Text>
          <TextInput
            style={styles.input}
            value={form.consultation_fee}
            onChangeText={v => set('consultation_fee', v)}
            placeholder="150"
            placeholderTextColor={Colors.inputBorder}
            keyboardType="numeric"
          />

          <Text style={styles.fieldLabel}>Avatar Color</Text>
          <View style={styles.colorRow}>
            {AVATAR_COLORS.map(c => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: c },
                  form.avatar_color === c && styles.colorSwatchSelected,
                ]}
                onPress={() => set('avatar_color', c)}
                activeOpacity={0.8}
              >
                {form.avatar_color === c && (
                  <Ionicons name="checkmark" size={16} color={Colors.white} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.fieldLabel}>Available for Bookings</Text>
              <Text style={styles.fieldSub}>Patients can book appointments</Text>
            </View>
            <Switch
              value={form.is_available}
              onValueChange={v => set('is_available', v)}
              trackColor={{ false: Colors.inputBorder, true: Colors.accent }}
              thumbColor={Colors.white}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState<DoctorWithFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<DoctorWithFee | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setDoctors(await getAllDoctors());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditTarget(null);
    setModalVisible(true);
  };

  const openEdit = (doc: DoctorWithFee) => {
    setEditTarget(doc);
    setModalVisible(true);
  };

  const handleDelete = (doc: DoctorWithFee) => {
    Alert.alert(
      'Delete Doctor',
      `Remove ${doc.name} permanently? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoctor(doc.id);
              setDoctors(prev => prev.filter(d => d.id !== doc.id));
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'Delete failed');
            }
          },
        },
      ]
    );
  };

  const handleToggleAvailable = async (doc: DoctorWithFee) => {
    try {
      await updateDoctor(doc.id, { is_available: !doc.is_available });
      setDoctors(prev =>
        prev.map(d => (d.id === doc.id ? { ...d, is_available: !d.is_available } : d))
      );
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Update failed');
    }
  };

  const renderItem = useCallback(({ item }: { item: DoctorWithFee }) => (
    <View style={styles.card}>
      <DoctorAvatar color={item.avatar_color ?? Colors.primary} name={item.name} />
      <View style={styles.cardInfo}>
        <Text style={styles.doctorName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.doctorSub}>{item.specialty} · {item.location}</Text>
        <View style={styles.cardMeta}>
          <View style={styles.feeBadge}>
            <Text style={styles.feeText}>${item.consultation_fee}</Text>
          </View>
          <TouchableOpacity
            style={[styles.availBadge, !item.is_available && styles.availBadgeOff]}
            onPress={() => handleToggleAvailable(item)}
          >
            <Text style={[styles.availText, !item.is_available && styles.availTextOff]}>
              {item.is_available ? 'Available' : 'Unavailable'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(item)}>
          <Ionicons name="pencil" size={18} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnDanger} onPress={() => handleDelete(item)}>
          <Ionicons name="trash" size={18} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  ), []);

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
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
          data={doctors}
          keyExtractor={d => d.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <Text style={styles.listHeader}>{doctors.length} doctors registered</Text>
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="medical-outline" size={40} color={Colors.inputBorder} />
              <Text style={styles.emptyText}>No doctors yet. Tap + to add one.</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={openAdd} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>

      <DoctorModal
        visible={modalVisible}
        editTarget={editTarget}
        onClose={() => setModalVisible(false)}
        onSaved={() => {
          setModalVisible(false);
          load();
        }}
      />
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
  },
  errorMsg: {
    fontSize: FontSize.small,
    color: Colors.error,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  list: {
    padding: Spacing.md,
    paddingBottom: 100,
    gap: Spacing.sm,
  },
  listHeader: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    fontSize: FontSize.small,
    color: Colors.textMuted,
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  cardInfo: {
    flex: 1,
    minWidth: 0,
  },
  doctorName: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  doctorSub: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  feeBadge: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  feeText: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  availBadge: {
    backgroundColor: Colors.badgeConfirmedBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  availBadgeOff: {
    backgroundColor: Colors.badgeCancelledBg,
  },
  availText: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.medium,
    color: Colors.badgeConfirmedText,
  },
  availTextOff: {
    color: Colors.badgeCancelledText,
  },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexShrink: 0,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnDanger: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.errorBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
  modalTitle: {
    fontSize: FontSize.subheader,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    minWidth: 64,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.semibold,
    color: Colors.white,
  },
  modalBody: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.xs,
  },
  formError: {
    backgroundColor: Colors.errorBg,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.errorBorder,
  },
  formErrorText: {
    fontSize: FontSize.small,
    color: Colors.errorText,
  },
  fieldLabel: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  fieldSub: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
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
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    backgroundColor: Colors.white,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.medium,
    color: Colors.textMuted,
  },
  chipTextActive: {
    color: Colors.white,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSwatchSelected: {
    borderWidth: 2,
    borderColor: Colors.white,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
});
