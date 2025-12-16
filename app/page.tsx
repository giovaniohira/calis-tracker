'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  Plus,
  Minus,
  Sparkles,
  Database,
  Loader2
} from 'lucide-react'
import ExerciseCard from '@/components/ExerciseCard'
import ProgressChart from '@/components/ProgressChart'
import MetricInput from '@/components/MetricInput'
import StatsCard from '@/components/StatsCard'
import DailyChecklist from '@/components/DailyChecklist'
import { useExercises } from '@/hooks/useExercises'
import type { Exercise } from '@/types'

export default function Home() {
  const { exercises, loading, error, addExercise, updateExercise, deleteExercise } = useExercises()
  const [currentWeek, setCurrentWeek] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [celebration, setCelebration] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const handleUpdateExercise = async (id: string, field: keyof Exercise, value: number) => {
    const exercise = exercises.find(ex => ex.id === id)
    if (!exercise) return

    // Trigger celebration if target reached
    const currentValue = exercise.currentValue ?? 0
    if (field === 'currentValue' && value >= exercise.targetValue && currentValue < exercise.targetValue) {
      triggerCelebration(exercise.name)
    }

    await updateExercise(id, field, value)
  }

  const triggerCelebration = (exerciseName: string) => {
    setCelebration(exerciseName)
    setTimeout(() => setCelebration(null), 3000)
  }

  const handleAddExercise = async (exercise: Omit<Exercise, 'id'>) => {
    try {
      await addExercise(exercise)
      setShowAddModal(false)
    } catch (err) {
      console.error('Erro ao adicionar exercício:', err)
    }
  }

  const handleDeleteExercise = async (id: string) => {
    await deleteExercise(id)
  }

  const calculateProgress = (exercise: Exercise) => {
    // Progresso calculado de 0 até targetValue
    // initialValue é apenas referência da semana 1, mas o usuário começa em 0
    if (exercise.targetValue === 0) return 0
    const currentValue = exercise.currentValue ?? 0
    return Math.max(0, Math.min(100, (currentValue / exercise.targetValue) * 100))
  }

  const totalProgress = exercises.length > 0
    ? exercises.reduce((sum, ex) => sum + calculateProgress(ex), 0) / exercises.length
    : 0

  const expectedProgress = exercises.reduce((sum, ex) => {
    // Calcular valor esperado baseado em weekValues se disponível
    let expected = 0
    if (ex.weekValues && ex.weekValues[currentWeek]) {
      const weekData = ex.weekValues[currentWeek]
      if (ex.unit === 'reps') {
        expected = weekData.reps || 0
      } else if (ex.unit === 'seg') {
        expected = weekData.time || 0
      } else {
        expected = weekData.sets || 0
      }
    } else {
      // Fallback para compatibilidade
      expected = ex.initialValue + (ex.weeklyProgress * currentWeek)
    }
    // Progresso esperado calculado de 0 até targetValue
    if (ex.targetValue === 0) return sum + 0
    return sum + Math.max(0, Math.min(100, (expected / ex.targetValue) * 100))
  }, 0) / exercises.length

  return (
    <main className="min-h-screen bg-dark-bg">
      {/* Celebration Animation */}
      <AnimatePresence>
        {celebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              className="bg-yellow-primary/20 backdrop-blur-lg rounded-2xl p-8 border border-yellow-primary/50 glow-yellow-strong"
            >
              <Sparkles className="w-16 h-16 text-yellow-primary mx-auto mb-4" />
              <h2 className="text-2xl font-light text-yellow-primary text-center">
                🎉 Meta Alcançada!
              </h2>
              <p className="text-white/80 text-center mt-2">{celebration}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 glass border-b border-dark-border"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Target className="w-8 h-8 text-yellow-primary" />
            </motion.div>
            <div>
              <h1 className="text-xl font-light tracking-tight">Calis Tracker</h1>
              <p className="text-xs text-white/50 font-light">
                Progresso de Calistenia
                {process.env.NEXT_PUBLIC_SUPABASE_URL && (
                  <span className="ml-2 text-yellow-primary/60 flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    DB
                  </span>
                )}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="p-2 rounded-lg bg-yellow-primary/20 hover:bg-yellow-primary/30 border border-yellow-primary/50 text-yellow-primary transition-all"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12"
          >
            <Loader2 className="w-8 h-8 text-yellow-primary animate-spin" />
          </motion.div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 glass rounded-2xl p-4 bg-red-500/10"
          >
            <p className="text-red-400 text-sm">⚠️ {error}</p>
            <p className="text-white/60 text-xs mt-1">Usando armazenamento local como fallback</p>
          </motion.div>
        )}

        {/* Stats Overview */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatsCard
            title="Progresso Total"
            value={`${totalProgress.toFixed(1)}%`}
            icon={TrendingUp}
            progress={totalProgress}
            color="yellow"
          />
          <StatsCard
            title="Semana Atual"
            value={`Semana ${currentWeek}`}
            icon={Calendar}
            progress={(currentWeek / 12) * 100}
            color="yellow"
          />
          <StatsCard
            title="Progresso Esperado"
            value={`${expectedProgress.toFixed(1)}%`}
            icon={Target}
            progress={expectedProgress}
            color="yellow"
          />
          </div>
        )}

        {/* Week Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-light tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-yellow-primary" />
              Controle Semanal
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
              disabled={currentWeek === 1}
              className="p-2 rounded-lg bg-dark-card hover:bg-dark-border border border-dark-border disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="w-4 h-4" />
            </motion.button>
            <div className="flex-1 text-center">
              <div className="text-4xl font-light text-yellow-primary tracking-tight">{currentWeek}</div>
              <div className="text-sm text-white/50">de 12 semanas</div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentWeek(Math.min(12, currentWeek + 1))}
              disabled={currentWeek === 12}
              className="p-2 rounded-lg bg-dark-card hover:bg-dark-border border border-dark-border disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>

        {/* Daily Checklist */}
        {!loading && exercises.length > 0 && (
          <DailyChecklist
            exercises={exercises}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            currentWeek={currentWeek}
            onUpdateExercise={handleUpdateExercise}
          />
        )}

        {/* Exercises Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <AnimatePresence mode="popLayout">
              {exercises.map((exercise, index) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  currentWeek={currentWeek}
                  onUpdate={(field, value) => handleUpdateExercise(exercise.id, field, value)}
                  onDelete={() => handleDeleteExercise(exercise.id)}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Progress Chart */}
        {!loading && exercises.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 mb-8"
          >
            <h2 className="text-lg font-light mb-6 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-primary" />
              Evolução do Progresso
            </h2>
            <ProgressChart exercises={exercises} currentWeek={currentWeek} />
          </motion.div>
        )}
      </div>

      {/* Add Exercise Modal */}
      <AnimatePresence>
        {showAddModal && (
          <MetricInput
            onClose={() => setShowAddModal(false)}
            onSave={handleAddExercise}
          />
        )}
      </AnimatePresence>
    </main>
  )
}

