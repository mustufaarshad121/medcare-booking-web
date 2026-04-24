'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'

export interface DoctorPoint {
  name: string
  appointments: number
  revenue: number
}

export default function DoctorBookings({ data }: { data: DoctorPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[210px]">
        <p className="text-sm text-slate-400">No doctor data yet</p>
      </div>
    )
  }

  const chartData = data.map(d => ({
    ...d,
    shortName: d.name.split(' ').pop() ?? d.name,
  }))

  return (
    <ResponsiveContainer width="100%" height={210}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="shortName"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            fontSize: '12px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
          labelStyle={{ fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}
          formatter={(value, name) => {
            const v = Number(value ?? 0)
            return name === 'revenue'
              ? [`$${v.toLocaleString()}`, 'Revenue']
              : [v, 'Appointments']
          }}
          labelFormatter={(_: unknown, payload: readonly { payload?: { name?: string } }[]) =>
            (payload?.[0]?.payload?.name as string) ?? ''
          }
        />
        <Bar
          dataKey="appointments"
          fill="#0f3460"
          radius={[4, 4, 0, 0]}
          name="appointments"
          maxBarSize={36}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
