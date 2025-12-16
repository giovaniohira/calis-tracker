'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase-client'
import type { DailyChecklist } from '@/types'

export function useDailyChecklist(selectedDate: Date = new Date()) {
  const [checklists, setChecklists] = useState<DailyChecklist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseClient()

  const dateString = selectedDate.toISOString().split('T')[0]

  // Carregar checklists do dia
  const loadChecklists = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (!supabase) {
      // Fallback para localStorage
      const saved = localStorage.getItem(`calis-checklist-${dateString}`)
      if (saved) {
        try {
          setChecklists(JSON.parse(saved))
        } catch (e) {
          setError('Erro ao carregar checklist do localStorage')
        }
      } else {
        setChecklists([])
      }
      setLoading(false)
      return
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('daily_checklists')
        .select('*')
        .eq('date', dateString)
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError

      const formatted: DailyChecklist[] = (data || []).map((item: any) => ({
        id: item.id,
        date: item.date,
        exerciseId: item.exercise_id,
        completed: item.completed,
        notes: item.notes || '',
        repsDone: item.reps_done,
        setsDone: item.sets_done,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }))

      setChecklists(formatted)
    } catch (err: any) {
      console.error('Erro ao carregar checklist:', err)
      setError(err.message || 'Erro ao carregar checklist')
      
      // Fallback para localStorage
      const saved = localStorage.getItem(`calis-checklist-${dateString}`)
      if (saved) {
        try {
          setChecklists(JSON.parse(saved))
        } catch (e) {
          // Ignorar erro
        }
      }
    } finally {
      setLoading(false)
    }
  }, [dateString, supabase])

  // Criar ou atualizar checklist
  const upsertChecklist = useCallback(async (
    exerciseId: string,
    completed: boolean,
    notes?: string,
    repsDone?: number,
    setsDone?: number
  ) => {
    if (!supabase) {
      // Fallback para localStorage
      const existing = checklists.find(c => c.exerciseId === exerciseId)
      const updated: DailyChecklist = existing || {
        id: Date.now().toString(),
        date: dateString,
        exerciseId,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      updated.completed = completed
      updated.notes = notes || ''
      updated.repsDone = repsDone
      updated.setsDone = setsDone
      updated.updatedAt = new Date().toISOString()

      const newChecklists = existing
        ? checklists.map(c => c.exerciseId === exerciseId ? updated : c)
        : [...checklists, updated]

      setChecklists(newChecklists)
      localStorage.setItem(`calis-checklist-${dateString}`, JSON.stringify(newChecklists))
      return updated
    }

    try {
      const { data, error: upsertError } = await supabase
        .from('daily_checklists')
        .upsert({
          date: dateString,
          exercise_id: exerciseId,
          completed,
          notes: notes || null,
          reps_done: repsDone || null,
          sets_done: setsDone || null
        }, {
          onConflict: 'date,exercise_id'
        })
        .select()
        .single()

      if (upsertError) throw upsertError

      const formatted: DailyChecklist = {
        id: data.id,
        date: data.date,
        exerciseId: data.exercise_id,
        completed: data.completed,
        notes: data.notes || '',
        repsDone: data.reps_done,
        setsDone: data.sets_done,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      setChecklists(prev => {
        const existing = prev.find(c => c.exerciseId === exerciseId)
        return existing
          ? prev.map(c => c.exerciseId === exerciseId ? formatted : c)
          : [...prev, formatted]
      })

      return formatted
    } catch (err: any) {
      console.error('Erro ao salvar checklist:', err)
      setError(err.message || 'Erro ao salvar checklist')
      throw err
    }
  }, [dateString, checklists, supabase])

  // Deletar checklist
  const deleteChecklist = useCallback(async (id: string) => {
    if (!supabase) {
      const updated = checklists.filter(c => c.id !== id)
      setChecklists(updated)
      localStorage.setItem(`calis-checklist-${dateString}`, JSON.stringify(updated))
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from('daily_checklists')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setChecklists(prev => prev.filter(c => c.id !== id))
    } catch (err: any) {
      console.error('Erro ao deletar checklist:', err)
      setError(err.message || 'Erro ao deletar checklist')
    }
  }, [dateString, checklists, supabase])

  useEffect(() => {
    loadChecklists()
  }, [loadChecklists])

  return {
    checklists,
    loading,
    error,
    upsertChecklist,
    deleteChecklist,
    refresh: loadChecklists
  }
}

