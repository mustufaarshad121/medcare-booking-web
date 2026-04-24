'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'

export interface SpecialtyPoint {
  specialty: string
  count: number
}

const COLORS = ['#0f3460', '#16a085', '#1a4a7a', '#1fb895', '#0c2a4e', '#13856b']

export default function SpecialtyBar({ data }: { data: SpecialtyPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[210px]">
        <p className="text-sm text-slate-400">No specialty data yet</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={210}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="specialty"
          tick={{ fontSize: 11, fill: '#64748b' }}
          tickLine={false}
          axisLine={false}
          width={110}
        />
        <Tooltip
          contentStyle={{
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            fontSize: '12px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
          labelStyle={{ fontWeight: 600, color: '#1e293b' }}
          formatter={(value) => [Number(value ?? 0), 'Bookings']}
        />
        <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Bookings" maxBarSize={24}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
