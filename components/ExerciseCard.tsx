'use client'

import { motion } from 'framer-motion'
import { Target, TrendingUp, Edit2, Trash2, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import type { Exercise } from '@/types'
import { getExpectedValueForWeek } from '@/lib/training-plan'

interface ExerciseCardProps {
  exercise: Exercise
  currentWeek: number
  onUpdate: (field: keyof Exercise, value: number) => void
  onDelete: () => void
  index: number
}

export default function ExerciseCard({ 
  exercise, 
  currentWeek, 
  onUpdate, 
  onDelete,
  index 
}: ExerciseCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState((exercise.currentValue ?? 0).toString())

  const currentValue = exercise.currentValue ?? 0
  // Progresso calculado de 0 até targetValue (não de initialValue até targetValue)
  // initialValue é apenas referência da semana 1, mas o usuário começa em 0
  const progress = exercise.targetValue === 0
    ? 0 
    : Math.max(0, Math.min(100, (currentValue / exercise.targetValue) * 100))

  // Calcular valor esperado para a semana atual
  let expectedValue: number
  if (exercise.weekValues && exercise.weekValues[currentWeek]) {
    const weekData = exercise.weekValues[currentWeek]
    if (exercise.unit === 'reps') {
      expectedValue = weekData.reps || exercise.initialValue
    } else if (exercise.unit === 'seg') {
      expectedValue = weekData.time || exercise.initialValue
    } else {
      expectedValue = weekData.sets || exercise.initialValue
    }
  } else {
    // Fallback para compatibilidade
    expectedValue = exercise.initialValue + (exercise.weeklyProgress * currentWeek)
  }
  
  const isAhead = currentValue >= expectedValue
  const isComplete = currentValue >= exercise.targetValue

  const handleSave = () => {
    const value = parseInt(editValue) || 0
    onUpdate('currentValue', value)
    setIsEditing(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="glass rounded-2xl p-6 transition-all relative overflow-hidden group shadow-lg"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-yellow-primary/0 group-hover:bg-yellow-primary/5 transition-all duration-300" />

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-light tracking-tight">{exercise.name}</h3>
            {isComplete && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-yellow-primary"
              >
                <CheckCircle2 className="w-5 h-5" />
              </motion.div>
            )}
          </div>
          <p className="text-xs text-white/50">{exercise.unit}</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 rounded-lg bg-dark-card hover:bg-dark-border border border-dark-border text-white/60 hover:text-yellow-primary transition-all"
          >
            <Edit2 className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, rotate: -15 }}
            whileTap={{ scale: 0.9 }}
            onClick={onDelete}
            className="p-2 rounded-lg bg-dark-card hover:bg-red-500/20 border border-dark-border text-white/60 hover:text-red-500 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Current Value */}
      <div className="relative z-10 mb-4">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSave()}
              className="flex-1 px-4 py-2 rounded-lg bg-dark-card border border-yellow-primary/50 text-white focus:outline-none focus:border-yellow-primary"
              autoFocus
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSave}
              className="p-2 rounded-lg bg-yellow-primary/20 hover:bg-yellow-primary/30 border border-yellow-primary/50 text-yellow-primary"
            >
              <CheckCircle2 className="w-5 h-5" />
            </motion.button>
          </div>
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="cursor-pointer"
          >
            <div className="text-4xl font-light text-yellow-primary mb-1 tracking-tight">
              {currentValue}
            </div>
            <div className="text-sm text-white/50 font-light">
              Meta: {exercise.targetValue} {exercise.unit}
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 mb-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-white/60">Progresso</span>
          <span className="text-yellow-primary font-light">{progress.toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-dark-card rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-yellow-primary to-yellow-accent rounded-full relative"
          >
            <motion.div
              animate={{ 
                boxShadow: [
                  '0 0 10px rgba(255, 215, 0, 0.5)',
                  '0 0 20px rgba(255, 215, 0, 0.8)',
                  '0 0 10px rgba(255, 215, 0, 0.5)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0"
            />
          </motion.div>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="relative z-10 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <TrendingUp className={`w-4 h-4 ${isAhead ? 'text-yellow-primary' : 'text-white/40'}`} />
          <span className="text-white/50">Esperado esta semana:</span>
        </div>
        <span className={`font-light ${isAhead ? 'text-yellow-primary' : 'text-white/50'}`}>
          {expectedValue}
        </span>
      </div>

      {/* Completion Badge */}
      {isComplete && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute top-4 right-4"
        >
          <div className="w-12 h-12 rounded-full bg-yellow-primary/20 border-2 border-yellow-primary flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-yellow-primary" />
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

