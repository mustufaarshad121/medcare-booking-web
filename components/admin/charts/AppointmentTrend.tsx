'use client'

import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

export interface TrendPoint {
  date: string
  appointments: number
  revenue: number
}

export default function AppointmentTrend({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={210}>
      <ComposedChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="appt"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <YAxis
          yAxisId="rev"
          orientation="right"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `$${v}`}
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
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
        />
        <Bar
          yAxisId="appt"
          dataKey="appointments"
          fill="#0f3460"
          radius={[4, 4, 0, 0]}
          name="appointments"
          maxBarSize={40}
        />
        <Line
          yAxisId="rev"
          type="monotone"
          dataKey="revenue"
          stroke="#16a085"
          strokeWidth={2.5}
          dot={{ fill: '#16a085', r: 3 }}
          activeDot={{ r: 5 }}
          name="revenue"
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
