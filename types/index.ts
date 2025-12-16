export interface Exercise {
  id: string
  name: string
  initialValue: number
  targetValue: number
  currentValue: number
  weeklyProgress: number
  unit: string
  dayOfWeek?: number // 0=Domingo, 1=Segunda, etc.
  weekValues?: Record<number, { sets: number; reps?: number; time?: number; notes?: string }> // Valores por semana
}

export interface DailyChecklist {
  id: string
  date: string
  exerciseId: string
  completed: boolean
  notes?: string
  repsDone?: number
  setsDone?: number
  createdAt: string
  updatedAt: string
}
