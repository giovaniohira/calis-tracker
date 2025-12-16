'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  icon: LucideIcon
  progress: number
  color: 'yellow' | 'blue' | 'purple'
}

export default function StatsCard({ title, value, icon: Icon, progress, color }: StatsCardProps) {
  const colorClasses = {
    yellow: {
      bg: 'bg-yellow-primary/20',
      border: 'border-yellow-primary/50',
      text: 'text-yellow-primary',
      glow: ''
    }
  }

  const colors = colorClasses[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: 0, scale: 1 }}
      className={`glass rounded-2xl p-6 ${colors.glow} transition-all relative overflow-hidden group shadow-lg`}
    >
      {/* Background glow */}
      <div className={`absolute inset-0 ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-light text-white/50 tracking-tight">{title}</h3>
          <div className={colors.text}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        
        <div className={`text-3xl font-light mb-4 ${colors.text} tracking-tight`}>
          {value}
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-dark-card rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, progress)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full bg-gradient-to-r ${colors.text.replace('text-', 'from-')} ${colors.text.replace('text-', 'to-')} rounded-full`}
          />
        </div>
      </div>
    </motion.div>
  )
}

