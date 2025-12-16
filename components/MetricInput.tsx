'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Save } from 'lucide-react'
import { useState } from 'react'
import type { Exercise } from '@/types'

interface MetricInputProps {
  onClose: () => void
  onSave: (exercise: Omit<Exercise, 'id'>) => void
}

export default function MetricInput({ onClose, onSave }: MetricInputProps) {
  const [formData, setFormData] = useState({
    name: '',
    initialValue: 0,
    targetValue: 0,
    unit: 'reps',
    dayOfWeek: 1
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.targetValue > 0) {
      onSave({
        name: formData.name,
        initialValue: formData.initialValue,
        targetValue: formData.targetValue,
        currentValue: 0, // Sempre começa em 0
        weeklyProgress: 0, // Mantido para compatibilidade, mas não usado
        unit: formData.unit,
        dayOfWeek: formData.dayOfWeek
      })
      setFormData({
        name: '',
        initialValue: 0,
        targetValue: 0,
        unit: 'reps',
        dayOfWeek: 1
      })
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="glass rounded-2xl p-6 max-w-md w-full glow-yellow"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-light tracking-tight">Adicionar Exercício</h2>
            <motion.button
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-lg bg-dark-card hover:bg-dark-border border border-dark-border text-white/60 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/50 mb-2 tracking-tight">
                Nome do Exercício
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-dark-card border border-dark-border text-white focus:outline-none focus:border-yellow-primary transition-all"
                placeholder="Ex: Flexões, Barras..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/50 mb-2 tracking-tight">
                  Valor Inicial
                </label>
                <input
                  type="number"
                  value={formData.initialValue}
                  onChange={(e) => setFormData({ ...formData, initialValue: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-lg bg-dark-card border border-dark-border text-white focus:outline-none focus:border-yellow-primary transition-all"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/50 mb-2 tracking-tight">
                  Meta Final
                </label>
                <input
                  type="number"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-lg bg-dark-card border border-dark-border text-white focus:outline-none focus:border-yellow-primary transition-all"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/50 mb-2 tracking-tight">
                  Unidade
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-dark-card border border-dark-border text-white focus:outline-none focus:border-yellow-primary transition-all"
                >
                  <option value="reps">Repetições</option>
                  <option value="seg">Segundos</option>
                  <option value="sets">Séries</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/50 mb-2 tracking-tight">
                  Dia da Semana
                </label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg bg-dark-card border border-dark-border text-white focus:outline-none focus:border-yellow-primary transition-all"
                >
                  <option value="1">Segunda</option>
                  <option value="2">Terça</option>
                  <option value="3">Quarta</option>
                  <option value="4">Quinta</option>
                  <option value="5">Sexta</option>
                  <option value="6">Sábado</option>
                  <option value="0">Domingo</option>
                </select>
              </div>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-lg bg-yellow-primary hover:bg-yellow-secondary text-dark-bg font-light flex items-center justify-center gap-2 transition-all glow-yellow"
            >
              <Save className="w-5 h-5" />
              Salvar Exercício
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

