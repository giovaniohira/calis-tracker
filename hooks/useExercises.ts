'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase-client'
import { TRAINING_PLAN, getExpectedValueForWeek } from '@/lib/training-plan'
import type { Exercise } from '@/types'

// Função auxiliar para normalizar exercícios e garantir valores válidos
function normalizeExercise(ex: any): Exercise {
  return {
    id: ex.id,
    name: ex.name,
    initialValue: ex.initialValue ?? ex.initial_value ?? 0,
    targetValue: ex.targetValue ?? ex.target_value ?? 0,
    currentValue: ex.currentValue ?? ex.current_value ?? 0,
    weeklyProgress: ex.weeklyProgress ?? ex.weekly_progress ?? 0,
    unit: ex.unit || 'reps',
    dayOfWeek: ex.dayOfWeek ?? ex.day_of_week,
    weekValues: (ex.weekValues ?? ex.week_values) || undefined
  }
}

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar exercícios
  const loadExercises = useCallback(async () => {
    setLoading(true)
    setError(null)

    const supabase = getSupabaseClient()

    // Se Supabase não estiver configurado, usar localStorage
    if (!supabase) {
      const saved = localStorage.getItem('calis-exercises')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          const normalized = Array.isArray(parsed) 
            ? parsed.map(normalizeExercise)
            : []
          setExercises(normalized)
        } catch (e) {
          setError('Erro ao carregar dados do localStorage')
        }
      } else {
        // Criar exercícios baseados no plano de treino
        const defaultExercises: Exercise[] = TRAINING_PLAN.map((plan, index) => {
          const week1Value = getExpectedValueForWeek(plan, 1)
          const week12Value = getExpectedValueForWeek(plan, 12)
          
          // Converter weekValues para o formato esperado
          const weekValues: Record<number, { sets: number; reps?: number; time?: number; notes?: string }> = {}
          Object.keys(plan.weeks).forEach(week => {
            const weekNum = parseInt(week)
            const weekData = plan.weeks[weekNum]
            weekValues[weekNum] = {
              sets: weekData.sets,
              reps: weekData.reps,
              time: weekData.time,
              notes: weekData.notes
            }
          })
          
          return {
            id: `exercise-${index + 1}`,
            name: plan.name,
            initialValue: week1Value,
            targetValue: week12Value,
            currentValue: 0, // Todos começam em 0
            weeklyProgress: 0, // Não usado mais, mas mantido para compatibilidade
            unit: plan.unit,
            dayOfWeek: plan.dayOfWeek,
            weekValues
          }
        })
        setExercises(defaultExercises)
        localStorage.setItem('calis-exercises', JSON.stringify(defaultExercises))
      }
      setLoading(false)
      return
    }

    // Usar Supabase
    try {
      const { data, error: fetchError } = await supabase
        .from('exercises')
        .select('*')
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError

      // Converter formato do banco para formato do app
      const formattedExercises: Exercise[] = (data || []).map(normalizeExercise)

      setExercises(formattedExercises)

      // Se não houver dados, criar exercícios baseados no plano de treino
      if (formattedExercises.length === 0) {
        const defaultExercises = TRAINING_PLAN.map((plan) => {
          const week1Value = getExpectedValueForWeek(plan, 1)
          const week12Value = getExpectedValueForWeek(plan, 12)
          
          // Converter weekValues para JSONB
          const weekValues: Record<number, { sets: number; reps?: number; time?: number; notes?: string }> = {}
          Object.keys(plan.weeks).forEach(week => {
            const weekNum = parseInt(week)
            const weekData = plan.weeks[weekNum]
            weekValues[weekNum] = {
              sets: weekData.sets,
              reps: weekData.reps,
              time: weekData.time,
              notes: weekData.notes
            }
          })
          
          return {
            name: plan.name,
            initial_value: week1Value,
            target_value: week12Value,
            current_value: 0, // Todos começam em 0
            weekly_progress: 0,
            unit: plan.unit,
            day_of_week: plan.dayOfWeek,
            week_values: weekValues
          }
        })
        
        // Inserir exercícios no banco
        const { data: insertedData, error: insertError } = await supabase
          .from('exercises')
          .insert(defaultExercises)
          .select()

        if (!insertError && insertedData) {
          const formatted: Exercise[] = insertedData.map(normalizeExercise)
          setExercises(formatted)
        }
      }
    } catch (err: any) {
      console.error('Erro ao carregar exercícios:', err)
      setError(err.message || 'Erro ao carregar exercícios')
      
      // Fallback para localStorage
      const saved = localStorage.getItem('calis-exercises')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          const normalized = Array.isArray(parsed)
            ? parsed.map(normalizeExercise)
            : []
          setExercises(normalized)
        } catch (e) {
          // Ignorar erro de parse
        }
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Adicionar exercício
  const addExercise = useCallback(async (exercise: Omit<Exercise, 'id'>) => {
    const supabase = getSupabaseClient()
    
    if (!supabase) {
      // Fallback para localStorage
      const newExercise: Exercise = {
        ...exercise,
        id: Date.now().toString()
      }
      const updated = [...exercises, newExercise]
      setExercises(updated)
      localStorage.setItem('calis-exercises', JSON.stringify(updated))
      return newExercise
    }

    try {
      const { data, error: insertError } = await supabase
        .from('exercises')
        .insert({
          name: exercise.name,
          initial_value: exercise.initialValue,
          target_value: exercise.targetValue,
          current_value: exercise.currentValue,
          weekly_progress: exercise.weeklyProgress,
          unit: exercise.unit,
          day_of_week: exercise.dayOfWeek || null,
          week_values: exercise.weekValues || null
        })
        .select()
        .single()

      if (insertError) throw insertError

      const newExercise: Exercise = normalizeExercise(data)

      setExercises(prev => [...prev, newExercise])
      return newExercise
    } catch (err: any) {
      console.error('Erro ao adicionar exercício:', err)
      setError(err.message || 'Erro ao adicionar exercício')
      throw err
    }
  }, [exercises])

  // Atualizar exercício
  const updateExercise = useCallback(async (id: string, field: keyof Exercise, value: number) => {
    const supabase = getSupabaseClient()
    
    // Garantir que o valor seja sempre um número válido
    const safeValue = field === 'currentValue' ? (value ?? 0) : value
    
    if (!supabase) {
      // Fallback para localStorage
      const updated = exercises.map(ex => {
        if (ex.id === id) {
          return { ...ex, [field]: safeValue }
        }
        return ex
      })
      setExercises(updated)
      localStorage.setItem('calis-exercises', JSON.stringify(updated))
      return
    }

    try {
      // Mapear campo para formato do banco
      const dbFieldMap: Record<string, string> = {
        initialValue: 'initial_value',
        targetValue: 'target_value',
        currentValue: 'current_value',
        weeklyProgress: 'weekly_progress',
        dayOfWeek: 'day_of_week'
      }

      const dbField = dbFieldMap[field] || field
      const updateData: any = { [dbField]: safeValue }
      
      // Se atualizando weekValues, manter formato JSONB
      if (field === 'weekValues') {
        updateData.week_values = safeValue
      }

      const { error: updateError } = await supabase
        .from('exercises')
        .update(updateData)
        .eq('id', id)

      if (updateError) throw updateError

      setExercises(prev => prev.map(ex => {
        if (ex.id === id) {
          return { ...ex, [field]: safeValue }
        }
        return ex
      }))
    } catch (err: any) {
      console.error('Erro ao atualizar exercício:', err)
      setError(err.message || 'Erro ao atualizar exercício')
      
      // Fallback para localStorage
      const updated = exercises.map(ex => {
        if (ex.id === id) {
          return { ...ex, [field]: safeValue }
        }
        return ex
      })
      setExercises(updated)
      localStorage.setItem('calis-exercises', JSON.stringify(updated))
    }
  }, [exercises])

  // Deletar exercício
  const deleteExercise = useCallback(async (id: string) => {
    const supabase = getSupabaseClient()
    
    if (!supabase) {
      // Fallback para localStorage
      const updated = exercises.filter(ex => ex.id !== id)
      setExercises(updated)
      localStorage.setItem('calis-exercises', JSON.stringify(updated))
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setExercises(prev => prev.filter(ex => ex.id !== id))
    } catch (err: any) {
      console.error('Erro ao deletar exercício:', err)
      setError(err.message || 'Erro ao deletar exercício')
      
      // Fallback para localStorage
      const updated = exercises.filter(ex => ex.id !== id)
      setExercises(updated)
      localStorage.setItem('calis-exercises', JSON.stringify(updated))
    }
  }, [exercises])

  // Carregar na montagem
  useEffect(() => {
    loadExercises()
  }, [loadExercises])

  return {
    exercises,
    loading,
    error,
    addExercise,
    updateExercise,
    deleteExercise,
    refresh: loadExercises
  }
}

