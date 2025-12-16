// Estrutura do plano de treino de 12 semanas
// Baseado no documento fornecido pelo usuário

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0=Domingo, 1=Segunda, etc.

export interface ExerciseWeekData {
  sets: number
  reps?: number
  time?: number // em segundos
  notes?: string
}

export interface ExerciseDefinition {
  name: string
  dayOfWeek: DayOfWeek
  unit: 'reps' | 'seg' | 'sets'
  weeks: Record<number, ExerciseWeekData> // semana -> dados
  initialValue: number
  targetValue: number
}

// Mapeamento de dias da semana
export const DAY_NAMES: Record<DayOfWeek, string> = {
  0: 'Domingo',
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
  6: 'Sábado'
}

// Plano de treino completo
export const TRAINING_PLAN: ExerciseDefinition[] = [
  // SEGUNDA - Push + Core
  {
    name: 'Flexão Inclinada',
    dayOfWeek: 1,
    unit: 'reps',
    initialValue: 15,
    targetValue: 20,
    weeks: {
      1: { sets: 4, reps: 15 },
      2: { sets: 4, reps: 17 },
      3: { sets: 5, reps: 17 },
      4: { sets: 5, reps: 19 },
      5: { sets: 5, reps: 20 },
      6: { sets: 6, reps: 20 },
      7: { sets: 6, reps: 22 },
      8: { sets: 6, reps: 22 },
      9: { sets: 6, reps: 25 },
      10: { sets: 6, reps: 25 },
      11: { sets: 6, reps: 27 },
      12: { sets: 6, reps: 30 }
    }
  },
  {
    name: 'Flexão Tradicional',
    dayOfWeek: 1,
    unit: 'reps',
    initialValue: 10,
    targetValue: 40,
    weeks: {
      1: { sets: 3, reps: 10 },
      2: { sets: 3, reps: 12 },
      3: { sets: 4, reps: 12 },
      4: { sets: 4, reps: 15 },
      5: { sets: 4, reps: 18 },
      6: { sets: 5, reps: 20 },
      7: { sets: 5, reps: 25 },
      8: { sets: 5, reps: 30 },
      9: { sets: 5, reps: 35 },
      10: { sets: 5, reps: 40 },
      11: { sets: 5, reps: 40 },
      12: { sets: 5, reps: 45 }
    }
  },
  {
    name: 'Pike Push-up',
    dayOfWeek: 1,
    unit: 'reps',
    initialValue: 6,
    targetValue: 12,
    weeks: {
      1: { sets: 3, reps: 6 },
      2: { sets: 3, reps: 8 },
      3: { sets: 4, reps: 8 },
      4: { sets: 4, reps: 10 },
      5: { sets: 4, reps: 10 },
      6: { sets: 5, reps: 10 },
      7: { sets: 5, reps: 12 },
      8: { sets: 5, reps: 12 },
      9: { sets: 5, reps: 15 },
      10: { sets: 5, reps: 15 },
      11: { sets: 5, reps: 18 },
      12: { sets: 5, reps: 20 }
    }
  },
  {
    name: 'Prancha',
    dayOfWeek: 1,
    unit: 'seg',
    initialValue: 40,
    targetValue: 120,
    weeks: {
      1: { sets: 3, time: 40 },
      2: { sets: 3, time: 45 },
      3: { sets: 4, time: 45 },
      4: { sets: 4, time: 50 },
      5: { sets: 4, time: 60 },
      6: { sets: 5, time: 60 },
      7: { sets: 5, time: 75 },
      8: { sets: 5, time: 90 },
      9: { sets: 5, time: 100 },
      10: { sets: 5, time: 120 },
      11: { sets: 5, time: 120 },
      12: { sets: 5, time: 150 }
    }
  },
  
  // TERÇA - Pull (barra progressiva)
  {
    name: 'Barra Australiana',
    dayOfWeek: 2,
    unit: 'reps',
    initialValue: 10,
    targetValue: 20,
    weeks: {
      1: { sets: 4, reps: 10 },
      2: { sets: 4, reps: 12 },
      3: { sets: 5, reps: 12 },
      4: { sets: 5, reps: 15 },
      5: { sets: 5, reps: 15 },
      6: { sets: 5, reps: 18 },
      7: { sets: 5, reps: 18 },
      8: { sets: 4, reps: 20, notes: 'máximo' },
      9: { sets: 5, reps: 20 },
      10: { sets: 5, reps: 22 },
      11: { sets: 5, reps: 25 },
      12: { sets: 5, reps: 25 }
    }
  },
  {
    name: 'Barra Negativa',
    dayOfWeek: 2,
    unit: 'reps',
    initialValue: 3,
    targetValue: 4,
    weeks: {
      1: { sets: 5, reps: 3, notes: '5s descida' },
      2: { sets: 5, reps: 3, notes: '6s descida' },
      3: { sets: 6, reps: 3 },
      4: { sets: 6, reps: 4, notes: '6-8s descida' },
      5: { sets: 6, reps: 4, notes: '6-8s descida' },
      6: { sets: 4, reps: 4 },
      7: { sets: 4, reps: 4 },
      8: { sets: 3, reps: 3 },
      9: { sets: 3, reps: 3 },
      10: { sets: 3, reps: 3 },
      11: { sets: 3, reps: 3 },
      12: { sets: 3, reps: 3 }
    }
  },
  {
    name: 'Isometria Topo da Barra',
    dayOfWeek: 2,
    unit: 'seg',
    initialValue: 10,
    targetValue: 20,
    weeks: {
      1: { sets: 3, time: 10 },
      2: { sets: 3, time: 15 },
      3: { sets: 4, time: 15 },
      4: { sets: 4, time: 20 },
      5: { sets: 4, time: 20 },
      6: { sets: 4, time: 25 },
      7: { sets: 4, time: 30 },
      8: { sets: 4, time: 30 },
      9: { sets: 4, time: 35 },
      10: { sets: 4, time: 40 },
      11: { sets: 4, time: 45 },
      12: { sets: 4, time: 50 }
    }
  },
  {
    name: 'Dead Hang',
    dayOfWeek: 2,
    unit: 'seg',
    initialValue: 30,
    targetValue: 60,
    weeks: {
      1: { sets: 3, time: 30 },
      2: { sets: 3, time: 35 },
      3: { sets: 3, time: 40 },
      4: { sets: 3, time: 45 },
      5: { sets: 3, time: 50 },
      6: { sets: 3, time: 55 },
      7: { sets: 3, time: 60 },
      8: { sets: 3, time: 60 },
      9: { sets: 3, time: 70 },
      10: { sets: 3, time: 75 },
      11: { sets: 3, time: 80 },
      12: { sets: 3, time: 90 }
    }
  },
  
  // QUARTA - Pernas + Cardio
  {
    name: 'Agachamento',
    dayOfWeek: 3,
    unit: 'reps',
    initialValue: 20,
    targetValue: 30,
    weeks: {
      1: { sets: 4, reps: 20 },
      2: { sets: 4, reps: 22 },
      3: { sets: 4, reps: 25 },
      4: { sets: 4, reps: 25 },
      5: { sets: 4, reps: 27 },
      6: { sets: 4, reps: 28 },
      7: { sets: 4, reps: 28 },
      8: { sets: 4, reps: 30 },
      9: { sets: 4, reps: 30 },
      10: { sets: 4, reps: 32 },
      11: { sets: 4, reps: 35 },
      12: { sets: 4, reps: 40 }
    }
  },
  {
    name: 'Avanço',
    dayOfWeek: 3,
    unit: 'reps',
    initialValue: 10,
    targetValue: 15,
    weeks: {
      1: { sets: 3, reps: 10, notes: 'cada perna' },
      2: { sets: 3, reps: 12, notes: 'cada perna' },
      3: { sets: 4, reps: 12, notes: 'cada perna' },
      4: { sets: 4, reps: 13, notes: 'cada perna' },
      5: { sets: 4, reps: 13, notes: 'cada perna' },
      6: { sets: 4, reps: 14, notes: 'cada perna' },
      7: { sets: 4, reps: 14, notes: 'cada perna' },
      8: { sets: 4, reps: 15, notes: 'cada perna' },
      9: { sets: 4, reps: 15, notes: 'cada perna' },
      10: { sets: 4, reps: 16, notes: 'cada perna' },
      11: { sets: 4, reps: 18, notes: 'cada perna' },
      12: { sets: 4, reps: 20, notes: 'cada perna' }
    }
  },
  {
    name: 'Panturrilha',
    dayOfWeek: 3,
    unit: 'reps',
    initialValue: 25,
    targetValue: 35,
    weeks: {
      1: { sets: 4, reps: 25 },
      2: { sets: 4, reps: 27 },
      3: { sets: 4, reps: 28 },
      4: { sets: 4, reps: 30 },
      5: { sets: 4, reps: 30 },
      6: { sets: 4, reps: 32 },
      7: { sets: 4, reps: 32 },
      8: { sets: 4, reps: 35 },
      9: { sets: 4, reps: 35 },
      10: { sets: 4, reps: 38 },
      11: { sets: 4, reps: 40 },
      12: { sets: 4, reps: 45 }
    }
  },
  
  // QUINTA - Upper + Metabólico
  {
    name: 'Flexão (Máximo Técnico)',
    dayOfWeek: 4,
    unit: 'reps',
    initialValue: 10,
    targetValue: 40,
    weeks: {
      1: { sets: 4, reps: 10, notes: 'máximo técnico' },
      2: { sets: 4, reps: 12, notes: 'máximo técnico' },
      3: { sets: 5, reps: 15, notes: 'máximo técnico' },
      4: { sets: 5, reps: 18, notes: 'máximo técnico' },
      5: { sets: 5, reps: 20, notes: 'máximo técnico' },
      6: { sets: 5, reps: 25, notes: 'máximo técnico' },
      7: { sets: 5, reps: 30, notes: 'máximo técnico' },
      8: { sets: 5, reps: 35, notes: 'máximo técnico' },
      9: { sets: 5, reps: 35, notes: 'máximo técnico' },
      10: { sets: 5, reps: 40, notes: 'máximo técnico' },
      11: { sets: 5, reps: 40, notes: 'máximo técnico' },
      12: { sets: 5, reps: 45, notes: 'máximo técnico' }
    }
  },
  {
    name: 'Australiana (Máximo)',
    dayOfWeek: 4,
    unit: 'reps',
    initialValue: 10,
    targetValue: 25,
    weeks: {
      1: { sets: 4, reps: 10, notes: 'máximo' },
      2: { sets: 4, reps: 12, notes: 'máximo' },
      3: { sets: 5, reps: 15, notes: 'máximo' },
      4: { sets: 5, reps: 18, notes: 'máximo' },
      5: { sets: 5, reps: 20, notes: 'máximo' },
      6: { sets: 5, reps: 22, notes: 'máximo' },
      7: { sets: 5, reps: 25, notes: 'máximo' },
      8: { sets: 4, reps: 25, notes: 'máximo' },
      9: { sets: 5, reps: 25, notes: 'máximo' },
      10: { sets: 5, reps: 28, notes: 'máximo' },
      11: { sets: 5, reps: 30, notes: 'máximo' },
      12: { sets: 5, reps: 30, notes: 'máximo' }
    }
  },
  {
    name: 'Dips Banco',
    dayOfWeek: 4,
    unit: 'reps',
    initialValue: 12,
    targetValue: 20,
    weeks: {
      1: { sets: 3, reps: 12 },
      2: { sets: 3, reps: 14 },
      3: { sets: 4, reps: 14 },
      4: { sets: 4, reps: 16 },
      5: { sets: 4, reps: 16 },
      6: { sets: 4, reps: 18 },
      7: { sets: 4, reps: 18 },
      8: { sets: 4, reps: 20 },
      9: { sets: 4, reps: 20 },
      10: { sets: 4, reps: 22 },
      11: { sets: 4, reps: 25 },
      12: { sets: 4, reps: 25 }
    }
  },
  
  // SEXTA - Full Body + HIIT
  {
    name: 'Barra Fixa',
    dayOfWeek: 5,
    unit: 'reps',
    initialValue: 0,
    targetValue: 5,
    weeks: {
      1: { sets: 0, reps: 0, notes: 'Ainda não' },
      2: { sets: 0, reps: 0, notes: 'Ainda não' },
      3: { sets: 0, reps: 0, notes: 'Ainda não' },
      4: { sets: 0, reps: 0, notes: 'Tentativa parcial' },
      5: { sets: 0, reps: 0, notes: 'Tentativa parcial' },
      6: { sets: 0, reps: 0, notes: 'Primeira barra provável' },
      7: { sets: 4, reps: 1, notes: '1-3 reps' },
      8: { sets: 5, reps: 2, notes: '2-3 reps' },
      9: { sets: 6, reps: 3 },
      10: { sets: 6, reps: 5 },
      11: { sets: 6, reps: 4 },
      12: { sets: 6, reps: 5 }
    }
  }
]

// Função para obter dados de um exercício em uma semana específica
function getExerciseWeekData(exercise: ExerciseDefinition, week: number): ExerciseWeekData | null {
  return exercise.weeks[week] || null
}

// Função para calcular o valor esperado (total de reps/sets) para uma semana
export function getExpectedValueForWeek(exercise: ExerciseDefinition, week: number): number {
  const weekData = getExerciseWeekData(exercise, week)
  if (!weekData) return exercise.initialValue
  
  if (exercise.unit === 'reps') {
    return weekData.reps || 0
  } else if (exercise.unit === 'seg') {
    return weekData.time || 0
  } else {
    return weekData.sets || 0
  }
}


