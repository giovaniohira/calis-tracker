'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Edit2, X, Save, Calendar } from 'lucide-react'
import { useState } from 'react'
import type { Exercise, DailyChecklist as ChecklistType } from '@/types'
import { useDailyChecklist } from '@/hooks/useDailyChecklist'

interface DailyChecklistProps {
  exercises: Exercise[]
  selectedDate: Date
  onDateChange: (date: Date) => void
  currentWeek: number
  onUpdateExercise?: (exerciseId: string, field: keyof Exercise, value: number) => void
}

export default function DailyChecklist({ exercises, selectedDate, onDateChange, currentWeek, onUpdateExercise }: DailyChecklistProps) {
  const { checklists, loading, upsertChecklist } = useDailyChecklist(selectedDate)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNotes, setEditNotes] = useState('')
  const [editReps, setEditReps] = useState<number | undefined>()
  const [editSets, setEditSets] = useState<number | undefined>()
  const [editTime, setEditTime] = useState<number | undefined>()

  // Filtrar exercícios do dia da semana selecionado
  const dayOfWeek = selectedDate.getDay() // 0=Domingo, 1=Segunda, etc.
  const exercisesForDay = exercises.filter(ex => {
    // Se não tem dayOfWeek definido, mostrar todos (compatibilidade)
    if (ex.dayOfWeek === undefined) return true
    return ex.dayOfWeek === dayOfWeek
  })

  const getChecklistForExercise = (exerciseId: string): ChecklistType | undefined => {
    return checklists.find(c => c.exerciseId === exerciseId)
  }

  const updateExerciseValue = (exerciseId: string, repsDone?: number, setsDone?: number, timeDone?: number) => {
    if (!onUpdateExercise) return
    
    const exercise = exercises.find(ex => ex.id === exerciseId)
    if (!exercise) return

    const currentValue = exercise.currentValue ?? 0
    let newValue = currentValue

    // Atualizar currentValue baseado na unidade do exercício
    // Apenas atualizar se o novo valor for maior que o atual (não diminuir progresso)
    if (exercise.unit === 'reps' && repsDone !== undefined) {
      // Para exercícios de reps, usar o valor de repsDone
      newValue = Math.max(currentValue, repsDone)
    } else if (exercise.unit === 'seg') {
      // Para exercícios de tempo, usar timeDone ou repsDone (que armazena tempo)
      const timeValue = timeDone !== undefined ? timeDone : repsDone
      if (timeValue !== undefined) {
        newValue = Math.max(currentValue, timeValue)
      } else if (exercise.weekValues?.[currentWeek]?.time) {
        // Se não especificou, usar o valor esperado da semana
        const expectedTime = exercise.weekValues[currentWeek].time || 0
        newValue = Math.max(currentValue, expectedTime)
      }
    } else if (exercise.unit === 'sets' && setsDone !== undefined) {
      // Para exercícios de sets, usar setsDone
      newValue = Math.max(currentValue, setsDone)
    } else if (exercise.unit === 'reps' && repsDone === undefined && exercise.weekValues?.[currentWeek]?.reps) {
      // Se completou mas não especificou reps, usar o valor esperado da semana
      const expectedReps = exercise.weekValues[currentWeek].reps || 0
      newValue = Math.max(currentValue, expectedReps)
    }

    // Só atualizar se o valor mudou
    if (newValue !== currentValue) {
      onUpdateExercise(exerciseId, 'currentValue', newValue)
    }
  }

  const toggleComplete = async (exerciseId: string) => {
    const existing = getChecklistForExercise(exerciseId)
    const exercise = exercises.find(ex => ex.id === exerciseId)
    const newCompleted = !existing?.completed
    
    // Aguardar o upsert completar para ter os dados atualizados
    const updatedChecklist = await upsertChecklist(
      exerciseId,
      newCompleted,
      existing?.notes,
      existing?.repsDone,
      existing?.setsDone
    )

    // Se completou, atualizar o valor do exercício
    // Se desmarcou, não fazer nada (manter o valor atual como melhor marca)
    if (newCompleted && exercise) {
      const repsToUse = updatedChecklist?.repsDone
      const setsToUse = updatedChecklist?.setsDone
      
      // Se não tem valores salvos no checklist, usar valores esperados da semana
      if ((repsToUse === undefined || repsToUse === null) && 
          (setsToUse === undefined || setsToUse === null) && 
          exercise.weekValues?.[currentWeek]) {
        const weekData = exercise.weekValues[currentWeek]
        if (exercise.unit === 'reps' && weekData.reps) {
          updateExerciseValue(exerciseId, weekData.reps, weekData.sets)
        } else if (exercise.unit === 'seg' && weekData.time) {
          updateExerciseValue(exerciseId, weekData.time, weekData.sets, weekData.time)
        } else if (weekData.sets) {
          updateExerciseValue(exerciseId, undefined, weekData.sets)
        }
      } else if (repsToUse !== undefined && repsToUse !== null) {
        // Usar valores do checklist (sempre priorizar repsDone se existir)
        updateExerciseValue(exerciseId, repsToUse, setsToUse, exercise.unit === 'seg' ? repsToUse : undefined)
      } else if (setsToUse !== undefined && setsToUse !== null) {
        // Se só tem sets, usar sets
        updateExerciseValue(exerciseId, undefined, setsToUse)
      } else if (exercise.weekValues?.[currentWeek]) {
        // Fallback: usar valores esperados da semana
        const weekData = exercise.weekValues[currentWeek]
        if (exercise.unit === 'reps' && weekData.reps) {
          updateExerciseValue(exerciseId, weekData.reps, weekData.sets)
        } else if (exercise.unit === 'seg' && weekData.time) {
          updateExerciseValue(exerciseId, weekData.time, weekData.sets, weekData.time)
        }
      }
    }
  }

  const startEditing = (exerciseId: string) => {
    const existing = getChecklistForExercise(exerciseId)
    const exercise = exercises.find(ex => ex.id === exerciseId)
    setEditingId(exerciseId)
    setEditNotes(existing?.notes || '')
    
    // Para exercícios de tempo, usar repsDone como tempo
    if (exercise?.unit === 'seg') {
      setEditTime(existing?.repsDone)
      setEditReps(undefined)
    } else {
      setEditReps(existing?.repsDone)
      setEditTime(undefined)
    }
    setEditSets(existing?.setsDone)
    
    // Se não tem valores salvos, usar os valores esperados da semana
    if (!existing?.repsDone && exercise?.weekValues?.[currentWeek]) {
      if (exercise.unit === 'reps' && exercise.weekValues[currentWeek].reps) {
        setEditReps(exercise.weekValues[currentWeek].reps)
      }
      if (exercise.unit === 'seg' && exercise.weekValues[currentWeek].time) {
        setEditTime(exercise.weekValues[currentWeek].time)
      }
      if (exercise.weekValues[currentWeek].sets) {
        setEditSets(exercise.weekValues[currentWeek].sets)
      }
    }
  }

  const saveEdit = async (exerciseId: string) => {
    const existing = getChecklistForExercise(exerciseId)
    const exercise = exercises.find(ex => ex.id === exerciseId)
    
    // Para exercícios de tempo, usar editTime como repsDone (já que o schema usa repsDone para ambos)
    const repsToSave = exercise?.unit === 'seg' ? editTime : editReps
    
    // Se salvou valores, marcar como completo automaticamente
    const shouldComplete = repsToSave !== undefined || editSets !== undefined
    
    // Aguardar o upsert completar
    const updatedChecklist = await upsertChecklist(
      exerciseId,
      shouldComplete || existing?.completed || false,
      editNotes,
      repsToSave,
      editSets
    )
    
    // Atualizar o valor do exercício com os valores salvos
    if (shouldComplete && updatedChecklist) {
      updateExerciseValue(exerciseId, updatedChecklist.repsDone, updatedChecklist.setsDone, editTime)
    }
    
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditNotes('')
    setEditReps(undefined)
    setEditSets(undefined)
    setEditTime(undefined)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
    onDateChange(newDate)
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center justify-center py-8">
          <div className="text-white/50 font-light">Carregando checklist...</div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 mb-8"
    >
      {/* Header com seletor de data */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-light tracking-tight flex items-center gap-2">
          <Calendar className="w-5 h-5 text-yellow-primary" />
          Checklist Diário
        </h2>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => changeDate(-1)}
            className="p-1.5 rounded-lg bg-dark-card hover:bg-dark-border border border-dark-border text-white/60 hover:text-white transition-all"
          >
            <X className="w-4 h-4 rotate-90" />
          </motion.button>
          <div className="text-sm font-light text-white/70 min-w-[200px] text-center">
            {formatDate(selectedDate)}
            {isToday(selectedDate) && (
              <span className="ml-2 text-yellow-primary text-xs">(Hoje)</span>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => changeDate(1)}
            className="p-1.5 rounded-lg bg-dark-card hover:bg-dark-border border border-dark-border text-white/60 hover:text-white transition-all"
          >
            <X className="w-4 h-4 -rotate-90" />
          </motion.button>
          {!isToday(selectedDate) && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDateChange(new Date())}
              className="px-3 py-1.5 rounded-lg bg-yellow-primary/20 hover:bg-yellow-primary/30 border border-yellow-primary/50 text-yellow-primary text-xs font-light transition-all"
            >
              Hoje
            </motion.button>
          )}
        </div>
      </div>

      {/* Lista de exercícios */}
      {exercisesForDay.length === 0 ? (
        <div className="text-center py-8 text-white/50 font-light">
          {dayOfWeek === 0 || dayOfWeek === 6 ? (
            <div>
              <p className="text-lg mb-2">Descanso</p>
              <p className="text-sm">
                {dayOfWeek === 0 
                  ? 'Domingo - Descanso total' 
                  : 'Sábado - Descanso ativo (caminhada 30-40 min)'}
              </p>
            </div>
          ) : (
            <p>Nenhum exercício programado para este dia</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {exercisesForDay.map((exercise, index) => {
          const checklist = getChecklistForExercise(exercise.id)
          const isCompleted = checklist?.completed || false
          const isEditing = editingId === exercise.id

          return (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 p-4 rounded-lg bg-dark-card/50 hover:bg-dark-card transition-all group"
            >
              {/* Checkbox */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleComplete(exercise.id)}
                className="mt-0.5 flex-shrink-0"
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-yellow-primary" />
                ) : (
                  <Circle className="w-5 h-5 text-white/30" />
                )}
              </motion.button>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h3 className="text-sm font-light text-white/80">{exercise.name}</h3>
                    {exercise.weekValues && exercise.weekValues[currentWeek] && (
                      <div className="text-xs text-white/50 mt-0.5">
                        {exercise.weekValues[currentWeek].sets && (
                          <span>{exercise.weekValues[currentWeek].sets}x</span>
                        )}
                        {exercise.weekValues[currentWeek].reps && (
                          <span> {exercise.weekValues[currentWeek].reps} reps</span>
                        )}
                        {exercise.weekValues[currentWeek].time && (
                          <span> {exercise.weekValues[currentWeek].time}s</span>
                        )}
                        {exercise.weekValues[currentWeek].notes && (
                          <span className="ml-1 italic">({exercise.weekValues[currentWeek].notes})</span>
                        )}
                      </div>
                    )}
                  </div>
                  {!isEditing && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => startEditing(exercise.id)}
                      className="p-1 rounded text-white/40 hover:text-yellow-primary transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-2 mt-2">
                    <div className={`grid gap-2 ${exercise.unit === 'seg' ? 'grid-cols-2' : 'grid-cols-2'}`}>
                      {exercise.unit === 'reps' && (
                        <input
                          type="number"
                          placeholder="Reps"
                          value={editReps || ''}
                          onChange={(e) => setEditReps(e.target.value ? parseInt(e.target.value) : undefined)}
                          className="px-3 py-1.5 rounded-lg bg-dark-bg border border-dark-border text-white text-sm focus:outline-none focus:border-yellow-primary transition-all"
                        />
                      )}
                      {exercise.unit === 'seg' && (
                        <input
                          type="number"
                          placeholder="Tempo (seg)"
                          value={editTime || ''}
                          onChange={(e) => setEditTime(e.target.value ? parseInt(e.target.value) : undefined)}
                          className="px-3 py-1.5 rounded-lg bg-dark-bg border border-dark-border text-white text-sm focus:outline-none focus:border-yellow-primary transition-all"
                        />
                      )}
                      <input
                        type="number"
                        placeholder="Séries"
                        value={editSets || ''}
                        onChange={(e) => setEditSets(e.target.value ? parseInt(e.target.value) : undefined)}
                        className="px-3 py-1.5 rounded-lg bg-dark-bg border border-dark-border text-white text-sm focus:outline-none focus:border-yellow-primary transition-all"
                      />
                    </div>
                    <textarea
                      placeholder="Anotações..."
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-1.5 rounded-lg bg-dark-bg border border-dark-border text-white text-sm focus:outline-none focus:border-yellow-primary transition-all resize-none"
                    />
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => saveEdit(exercise.id)}
                        className="px-3 py-1.5 rounded-lg bg-yellow-primary/20 hover:bg-yellow-primary/30 border border-yellow-primary/50 text-yellow-primary text-xs font-light transition-all flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                        Salvar
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={cancelEdit}
                        className="px-3 py-1.5 rounded-lg bg-dark-card hover:bg-dark-border border border-dark-border text-white/60 hover:text-white text-xs font-light transition-all flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Cancelar
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-white/50 font-light space-y-1">
                    {exercise.unit === 'reps' && checklist?.repsDone && (
                      <div>Reps: {checklist.repsDone}</div>
                    )}
                    {exercise.unit === 'seg' && checklist?.repsDone && (
                      <div>Tempo: {checklist.repsDone}s</div>
                    )}
                    {checklist?.setsDone && (
                      <div>Séries: {checklist.setsDone}</div>
                    )}
                    {checklist?.notes && (
                      <div className="mt-1 italic">{checklist.notes}</div>
                    )}
                    {!checklist && (
                      <div className="text-white/30">Clique para adicionar anotações</div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
        </div>
      )}

      {/* Estatísticas do dia */}
      {checklists.length > 0 && exercisesForDay.length > 0 && (
        <div className="mt-6 pt-6 border-t border-dark-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/50 font-light">
              Exercícios completos: {checklists.filter(c => c.completed && exercisesForDay.some(ex => ex.id === c.exerciseId)).length} / {exercisesForDay.length}
            </span>
            <div className="w-32 h-1.5 bg-dark-card rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(checklists.filter(c => c.completed && exercisesForDay.some(ex => ex.id === c.exerciseId)).length / exercisesForDay.length) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-yellow-primary to-yellow-accent rounded-full"
              />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

