'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface StatusDonutProps {
  confirmed: number
  cancelled: number
}

const COLORS = ['#16a085', '#ef4444']
const LABELS = ['Confirmed', 'Cancelled']

export default function StatusDonut({ confirmed, cancelled }: StatusDonutProps) {
  const data = [
    { name: 'Confirmed', value: confirmed },
    { name: 'Cancelled', value: cancelled },
  ]
  const total = confirmed + cancelled

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-[210px]">
        <p className="text-sm text-slate-400">No appointment data yet</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={210}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={58}
            outerRadius={82}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            formatter={(value, name) => {
              const v = Number(value ?? 0)
              return [`${v} (${((v / total) * 100).toFixed(1)}%)`, String(name)]
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '12px', paddingTop: '4px' }}
            formatter={(value) => LABELS[LABELS.indexOf(value)] ?? value}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{ top: '-16px' }}
      >
        <p className="text-2xl font-bold text-slate-900">{total}</p>
        <p className="text-xs text-slate-400 mt-0.5">Total</p>
      </div>
    </div>
  )
}
