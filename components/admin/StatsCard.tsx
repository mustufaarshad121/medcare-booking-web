interface StatsCardProps {
  title: string
  value: string
  icon: React.ReactNode
  bg: string
  border: string
}

export default function StatsCard({ title, value, icon, bg, border }: StatsCardProps) {
  return (
    <div className={`bg-white rounded-2xl border-l-4 ${border} p-5 shadow-sm hover:shadow-md transition-all`}>
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>{icon}</div>
      <p className="text-2xl font-bold text-slate-900 leading-none mb-1">{value}</p>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
    </div>
  )
}
