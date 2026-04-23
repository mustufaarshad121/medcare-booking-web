import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { getAnalytics } from '../../lib/admin';
import type { AnalyticsData } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_W = SCREEN_WIDTH - Spacing.md * 2 - 2;

const CHART_BASE = {
  backgroundGradientFrom: Colors.white,
  backgroundGradientTo: Colors.white,
  decimalPlaces: 0,
  labelColor: () => Colors.textMuted,
  style: { borderRadius: Radius.md },
};

const APPT_CHART_CFG = {
  ...CHART_BASE,
  color: (opacity = 1) => `rgba(15, 52, 96, ${opacity})`,
  propsForDots: { r: '4', strokeWidth: '2', stroke: Colors.accent },
};

const REV_CHART_CFG = {
  ...CHART_BASE,
  color: (opacity = 1) => `rgba(22, 160, 133, ${opacity})`,
  propsForDots: { r: '4', strokeWidth: '2', stroke: Colors.primary },
};

const BAR_CHART_CFG = {
  ...CHART_BASE,
  color: (opacity = 1) => `rgba(22, 160, 133, ${opacity})`,
};

const STAT_META: {
  key: keyof Pick<
    AnalyticsData,
    | 'totalAppointments'
    | 'confirmedAppointments'
    | 'cancelledAppointments'
    | 'totalDoctors'
    | 'totalUsers'
    | 'totalRevenue'
  >;
  label: string;
  icon: string;
  color: string;
  prefix?: string;
}[] = [
  { key: 'totalAppointments',   label: 'Total Bookings',    icon: 'calendar',         color: Colors.primary },
  { key: 'confirmedAppointments', label: 'Confirmed',        icon: 'checkmark-circle', color: Colors.success },
  { key: 'cancelledAppointments', label: 'Cancelled',        icon: 'close-circle',     color: Colors.error },
  { key: 'totalDoctors',         label: 'Active Doctors',    icon: 'medical',          color: Colors.accent },
  { key: 'totalUsers',           label: 'Registered Users',  icon: 'people',           color: '#7c3aed' },
  { key: 'totalRevenue',         label: 'Total Revenue',     icon: 'cash',             color: '#b45309', prefix: '$' },
];

const SPECIALTY_ABBR: Record<string, string> = {
  Oncology:          'Onco',
  Pulmonology:       'Pulm',
  Cardiology:        'Card',
  'Family Medicine': 'Fam',
  'Internal Medicine': 'Int',
};

function abbr(s: string) {
  return SPECIALTY_ABBR[s] ?? s.substring(0, 4);
}

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '22' }]}>
        <Ionicons
          name={icon as React.ComponentProps<typeof Ionicons>['name']}
          size={18}
          color={color}
        />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      setData(await getAnalytics());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load(true);
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading analytics…</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        <Text style={styles.errorText}>{error ?? 'No data'}</Text>
      </View>
    );
  }

  const dayLabels = data.appointmentsByDay.map(d => d.date.split('-')[2]);
  const dayCounts = data.appointmentsByDay.map(d => d.count);
  const revValues = data.revenueByDay.map(d => d.revenue);

  const specItems = data.appointmentsBySpecialty.slice(0, 5);
  const specLabels = specItems.map(s => abbr(s.specialty));
  const specCounts = specItems.map(s => s.count);

  const safeData = (arr: number[]) => (arr.some(v => v > 0) ? arr : [0]);

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Analytics Overview</Text>
          <Text style={styles.pageSub}>Real-time clinic performance</Text>
        </View>

        {/* ── Stats Grid ───────────────────────────────────────────────── */}
        <View style={styles.statsGrid}>
          {STAT_META.map(m => (
            <StatCard
              key={m.key}
              label={m.label}
              value={`${m.prefix ?? ''}${Number(data[m.key]).toLocaleString()}`}
              icon={m.icon}
              color={m.color}
            />
          ))}
        </View>

        {/* ── Appointments Chart ────────────────────────────────────────── */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Appointments — Last 7 Days</Text>
          <LineChart
            data={{
              labels: dayLabels,
              datasets: [{ data: safeData(dayCounts) }],
            }}
            width={CHART_W}
            height={180}
            chartConfig={APPT_CHART_CFG}
            bezier
            style={styles.chart}
            withInnerLines={false}
          />
        </View>

        {/* ── Revenue Chart ─────────────────────────────────────────────── */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Revenue — Last 7 Days ($)</Text>
          <LineChart
            data={{
              labels: dayLabels,
              datasets: [{ data: safeData(revValues) }],
            }}
            width={CHART_W}
            height={180}
            chartConfig={REV_CHART_CFG}
            bezier
            style={styles.chart}
            withInnerLines={false}
          />
        </View>

        {/* ── Specialty Bar Chart ───────────────────────────────────────── */}
        {specItems.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Bookings by Specialty</Text>
            <BarChart
              data={{
                labels: specLabels,
                datasets: [{ data: safeData(specCounts) }],
              }}
              width={CHART_W}
              height={200}
              chartConfig={BAR_CHART_CFG}
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix=""
              showValuesOnTopOfBars
              fromZero
            />
          </View>
        )}

        {/* ── Doctor Performance ────────────────────────────────────────── */}
        {data.topDoctors.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Top Doctor Performance</Text>
            {data.topDoctors.map((doc, idx) => (
              <View
                key={doc.doctor_id}
                style={[styles.perfRow, idx < data.topDoctors.length - 1 && styles.perfBorder]}
              >
                <View style={styles.perfRank}>
                  <Text style={styles.perfRankText}>{idx + 1}</Text>
                </View>
                <View style={styles.perfInfo}>
                  <Text style={styles.perfName} numberOfLines={1}>{doc.doctor_name}</Text>
                  <Text style={styles.perfSpec}>{doc.specialty}</Text>
                </View>
                <View style={styles.perfStats}>
                  <Text style={styles.perfCount}>{doc.count} bookings</Text>
                  <Text style={styles.perfRevenue}>${doc.revenue.toLocaleString()}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Empty state */}
        {data.totalAppointments === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="bar-chart-outline" size={48} color={Colors.inputBorder} />
            <Text style={styles.emptyText}>No appointment data yet.</Text>
            <Text style={styles.emptySub}>Charts will appear once bookings are made.</Text>
          </View>
        )}
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
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  loadingText: {
    fontSize: FontSize.small,
    color: Colors.textMuted,
  },
  errorText: {
    fontSize: FontSize.small,
    color: Colors.error,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  pageHeader: {
    marginBottom: Spacing.xs,
  },
  pageTitle: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  pageSub: {
    fontSize: FontSize.small,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderLeftWidth: 3,
    width: (SCREEN_WIDTH - Spacing.md * 2 - Spacing.sm) / 2,
    ...Shadow.card,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: FontSize.header,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  chartCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    ...Shadow.card,
  },
  chartTitle: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  chart: {
    borderRadius: Radius.md,
    marginHorizontal: -Spacing.xs,
  },
  perfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  perfBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  perfRank: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perfRankText: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  perfInfo: {
    flex: 1,
  },
  perfName: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  perfSpec: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
  },
  perfStats: {
    alignItems: 'flex-end',
  },
  perfCount: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  perfRevenue: {
    fontSize: FontSize.caption,
    color: Colors.accent,
    fontWeight: FontWeight.medium,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.xs,
  },
  emptyText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.medium,
    color: Colors.textMuted,
  },
  emptySub: {
    fontSize: FontSize.small,
    color: Colors.inputBorder,
    textAlign: 'center',
  },
});
