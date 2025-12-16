'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import type { Exercise } from '@/types'
import { getExpectedValueForWeek } from '@/lib/training-plan'

interface ProgressChartProps {
  exercises: Exercise[]
  currentWeek: number
}

// Cores para cada exercício (mais vivas e saturadas)
const exerciseColors = [
  '#FFD700', // Amarelo dourado
  '#FF4757', // Vermelho vibrante
  '#00D2FF', // Azul ciano brilhante
  '#00FF88', // Verde neon
  '#FF6B9D', // Rosa vibrante
  '#A855F7', // Roxo vibrante
  '#FF9F43', // Laranja vibrante
  '#0EA5E9', // Azul claro vibrante
]

export default function ProgressChart({ exercises, currentWeek }: ProgressChartProps) {
  const weeks = Array.from({ length: 12 }, (_, i) => i + 1)
  const [visibleExercises, setVisibleExercises] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    exercises.forEach(ex => {
      initial[ex.id] = true
    })
    return initial
  })

  // Calcular dados por exercício (progressão semanal não cumulativa)
  const getExerciseData = (exercise: Exercise, week: number) => {
    // Se tem weekValues, usar os valores específicos da semana
    if (exercise.weekValues && exercise.weekValues[week]) {
      const weekData = exercise.weekValues[week]
      let expected = 0
      
      if (exercise.unit === 'reps') {
        expected = weekData.reps || 0
      } else if (exercise.unit === 'seg') {
        expected = weekData.time || 0
      } else {
        expected = weekData.sets || 0
      }
      
      // Para valores atingidos, usar o currentValue apenas se estivermos na semana atual ou anterior
      // Mas mostrar o valor esperado da semana específica (não cumulativo)
      // Se estamos na semana atual, mostrar o currentValue se for menor que o esperado
      const currentValue = exercise.currentValue ?? 0
      const achieved = week < currentWeek
        ? expected // Semanas passadas: mostrar o valor esperado
        : week === currentWeek
        ? Math.min(currentValue, expected) // Semana atual: mostrar o menor entre atual e esperado
        : expected // Semanas futuras: mostrar o esperado
      
      return { expected, achieved }
    }
    
    // Fallback para exercícios sem weekValues (compatibilidade)
    const expected = exercise.initialValue + (exercise.weeklyProgress * week)
    const currentValue = exercise.currentValue ?? 0
    const achieved = week <= currentWeek ? currentValue : expected
    return { expected, achieved }
  }
  
  // Calcular total de séries semanais (não cumulativo)
  const getWeeklySetsTotal = (exercise: Exercise, week: number): number => {
    if (exercise.weekValues && exercise.weekValues[week]) {
      return exercise.weekValues[week].sets || 0
    }
    return 0
  }

  // Encontrar o valor máximo para escala
  const maxValue = Math.max(
    ...exercises.flatMap(exercise =>
      weeks.map(week => {
        const data = getExerciseData(exercise, week)
        return Math.max(data.expected, data.achieved, exercise.targetValue)
      })
    ),
    100
  )

  const chartHeight = 300
  const chartWidth = 1000
  const padding = { top: 20, right: 40, bottom: 50, left: 70 }
  const graphWidth = chartWidth - padding.left - padding.right
  const graphHeight = chartHeight - padding.top - padding.bottom

  // Converter valor para coordenada Y
  const valueToY = (value: number) => {
    return graphHeight - (value / maxValue) * graphHeight
  }

  // Converter semana para coordenada X
  const weekToX = (week: number) => {
    return ((week - 1) / (weeks.length - 1)) * graphWidth
  }

  // Gerar path SVG para uma linha
  const generatePath = (exercise: Exercise, type: 'expected' | 'achieved') => {
    const points = weeks.map(week => {
      const data = getExerciseData(exercise, week)
      const value = type === 'expected' ? data.expected : data.achieved
      const x = weekToX(week) + padding.left
      const y = valueToY(value) + padding.top
      return `${x},${y}`
    })
    return `M ${points.join(' L ')}`
  }

  const toggleExercise = (exerciseId: string) => {
    setVisibleExercises(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }))
  }

  return (
    <div className="relative">
      {/* Controles de visibilidade */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {exercises.map((exercise, index) => {
          const color = exerciseColors[index % exerciseColors.length]
          const isVisible = visibleExercises[exercise.id] ?? true
          
          return (
            <motion.button
              key={exercise.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleExercise(exercise.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                isVisible
                  ? 'bg-dark-card border border-dark-border'
                  : 'bg-dark-card/50 border border-dark-border/50 opacity-50'
              }`}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: isVisible ? color : 'transparent', border: `2px solid ${color}` }}
              />
              <span className="text-xs font-light text-white/70">{exercise.name}</span>
            </motion.button>
          )
        })}
      </div>

      {/* Gráfico SVG */}
      <div className="relative w-full overflow-x-auto">
        <svg
          width={chartWidth}
          height={chartHeight}
          className="w-full max-w-full"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid horizontal */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + ratio * graphHeight
            const value = maxValue * (1 - ratio)
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + graphWidth}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  fill="rgba(255, 255, 255, 0.4)"
                  fontSize="10"
                  textAnchor="end"
                  className="font-light"
                >
                  {Math.round(value)}
                </text>
              </g>
            )
          })}

          {/* Grid vertical (semanas) */}
          {weeks.map((week) => {
            const x = weekToX(week) + padding.left
            return (
              <g key={week}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + graphHeight}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={chartHeight - 10}
                  fill={week === currentWeek ? '#FFD700' : 'rgba(255, 255, 255, 0.4)'}
                  fontSize="10"
                  textAnchor="middle"
                  className="font-light"
                >
                  {week}
                </text>
              </g>
            )
          })}

          {/* Linhas dos exercícios */}
          {exercises.map((exercise, index) => {
            const color = exerciseColors[index % exerciseColors.length]
            const isVisible = visibleExercises[exercise.id] ?? true
            
            if (!isVisible) return null

            return (
              <g key={exercise.id}>
                {/* Linha Esperado (tracejada) */}
                <motion.path
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  d={generatePath(exercise, 'expected')}
                  fill="none"
                  stroke={color}
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  strokeLinecap="round"
                />
                
                {/* Linha Atingido (sólida) */}
                <motion.path
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: index * 0.1 + 0.2 }}
                  d={generatePath(exercise, 'achieved')}
                  fill="none"
                  stroke={color}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Pontos na linha atingido */}
                {weeks.map((week) => {
                  const data = getExerciseData(exercise, week)
                  const x = weekToX(week) + padding.left
                  const y = valueToY(data.achieved) + padding.top
                  const isCurrent = week === currentWeek
                  
                  return (
                    <motion.circle
                      key={week}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 + week * 0.05 }}
                      cx={x}
                      cy={y}
                      r={isCurrent ? 4 : 2.5}
                      fill={color}
                      stroke="#0a0a0a"
                      strokeWidth="1"
                      className="cursor-pointer"
                    />
                  )
                })}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legenda */}
      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 border-t-2 border-dashed border-yellow-primary/50"></div>
          <span className="text-xs text-white/50 font-light">Esperado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-yellow-primary"></div>
          <span className="text-xs text-white/50 font-light">Atingido</span>
        </div>
      </div>
    </div>
  )
}

