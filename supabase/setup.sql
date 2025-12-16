-- ============================================
-- SETUP COMPLETO - Calis Tracker
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- para resetar e inicializar o app do zero
-- 
-- ⚠️ ATENÇÃO: Este script DELETA todos os dados existentes!

-- 1. DELETAR TUDO (Reset completo)
DROP TABLE IF EXISTS daily_checklists CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 2. CRIAR FUNÇÃO PARA ATUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. CRIAR TABELA DE EXERCÍCIOS
CREATE TABLE exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  initial_value INTEGER NOT NULL DEFAULT 0,
  target_value INTEGER NOT NULL,
  current_value INTEGER NOT NULL DEFAULT 0,
  weekly_progress INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'reps',
  day_of_week INTEGER, -- 0=Domingo, 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado
  week_values JSONB, -- Valores esperados por semana {1: {sets: 4, reps: 15}, 2: {...}}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_exercises_created_at ON exercises(created_at);
CREATE INDEX idx_exercises_day_of_week ON exercises(day_of_week);

-- Trigger para updated_at
CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON exercises
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. CRIAR TABELA DE CHECKLISTS DIÁRIOS
CREATE TABLE daily_checklists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  reps_done INTEGER,
  sets_done INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, exercise_id)
);

-- Índices
CREATE INDEX idx_daily_checklists_date ON daily_checklists(date);
CREATE INDEX idx_daily_checklists_exercise_id ON daily_checklists(exercise_id);
CREATE INDEX idx_daily_checklists_date_exercise ON daily_checklists(date, exercise_id);

-- Trigger para updated_at
CREATE TRIGGER update_daily_checklists_updated_at
  BEFORE UPDATE ON daily_checklists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. CONFIGURAR ROW LEVEL SECURITY (RLS)
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checklists ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir todas as operações
CREATE POLICY "Allow all operations on exercises" ON exercises
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on daily_checklists" ON daily_checklists
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. POPULAR EXERCÍCIOS DO PLANO DE TREINO
-- SEGUNDA - Push + Core
INSERT INTO exercises (name, initial_value, target_value, current_value, weekly_progress, unit, day_of_week, week_values) VALUES
('Flexão Inclinada', 15, 30, 0, 0, 'reps', 1, '{"1":{"sets":4,"reps":15},"2":{"sets":4,"reps":17},"3":{"sets":5,"reps":17},"4":{"sets":5,"reps":19},"5":{"sets":5,"reps":20},"6":{"sets":6,"reps":20},"7":{"sets":6,"reps":22},"8":{"sets":6,"reps":22},"9":{"sets":6,"reps":25},"10":{"sets":6,"reps":25},"11":{"sets":6,"reps":27},"12":{"sets":6,"reps":30}}'::jsonb),
('Flexão Tradicional', 10, 45, 0, 0, 'reps', 1, '{"1":{"sets":3,"reps":10},"2":{"sets":3,"reps":12},"3":{"sets":4,"reps":12},"4":{"sets":4,"reps":15},"5":{"sets":4,"reps":18},"6":{"sets":5,"reps":20},"7":{"sets":5,"reps":25},"8":{"sets":5,"reps":30},"9":{"sets":5,"reps":35},"10":{"sets":5,"reps":40},"11":{"sets":5,"reps":40},"12":{"sets":5,"reps":45}}'::jsonb),
('Pike Push-up', 6, 20, 0, 0, 'reps', 1, '{"1":{"sets":3,"reps":6},"2":{"sets":3,"reps":8},"3":{"sets":4,"reps":8},"4":{"sets":4,"reps":10},"5":{"sets":4,"reps":10},"6":{"sets":5,"reps":10},"7":{"sets":5,"reps":12},"8":{"sets":5,"reps":12},"9":{"sets":5,"reps":15},"10":{"sets":5,"reps":15},"11":{"sets":5,"reps":18},"12":{"sets":5,"reps":20}}'::jsonb),
('Prancha', 40, 150, 0, 0, 'seg', 1, '{"1":{"sets":3,"time":40},"2":{"sets":3,"time":45},"3":{"sets":4,"time":45},"4":{"sets":4,"time":50},"5":{"sets":4,"time":60},"6":{"sets":5,"time":60},"7":{"sets":5,"time":75},"8":{"sets":5,"time":90},"9":{"sets":5,"time":100},"10":{"sets":5,"time":120},"11":{"sets":5,"time":120},"12":{"sets":5,"time":150}}'::jsonb),

-- TERÇA - Pull (barra progressiva)
('Barra Australiana', 10, 25, 0, 0, 'reps', 2, '{"1":{"sets":4,"reps":10},"2":{"sets":4,"reps":12},"3":{"sets":5,"reps":12},"4":{"sets":5,"reps":15},"5":{"sets":5,"reps":15},"6":{"sets":5,"reps":18},"7":{"sets":5,"reps":18},"8":{"sets":4,"reps":20,"notes":"máximo"},"9":{"sets":5,"reps":20},"10":{"sets":5,"reps":22},"11":{"sets":5,"reps":25},"12":{"sets":5,"reps":25}}'::jsonb),
('Barra Negativa', 3, 4, 0, 0, 'reps', 2, '{"1":{"sets":5,"reps":3,"notes":"5s descida"},"2":{"sets":5,"reps":3,"notes":"6s descida"},"3":{"sets":6,"reps":3},"4":{"sets":6,"reps":4,"notes":"6-8s descida"},"5":{"sets":6,"reps":4,"notes":"6-8s descida"},"6":{"sets":4,"reps":4},"7":{"sets":4,"reps":4},"8":{"sets":3,"reps":3},"9":{"sets":3,"reps":3},"10":{"sets":3,"reps":3},"11":{"sets":3,"reps":3},"12":{"sets":3,"reps":3}}'::jsonb),
('Isometria Topo da Barra', 10, 50, 0, 0, 'seg', 2, '{"1":{"sets":3,"time":10},"2":{"sets":3,"time":15},"3":{"sets":4,"time":15},"4":{"sets":4,"time":20},"5":{"sets":4,"time":20},"6":{"sets":4,"time":25},"7":{"sets":4,"time":30},"8":{"sets":4,"time":30},"9":{"sets":4,"time":35},"10":{"sets":4,"time":40},"11":{"sets":4,"time":45},"12":{"sets":4,"time":50}}'::jsonb),
('Dead Hang', 30, 90, 0, 0, 'seg', 2, '{"1":{"sets":3,"time":30},"2":{"sets":3,"time":35},"3":{"sets":3,"time":40},"4":{"sets":3,"time":45},"5":{"sets":3,"time":50},"6":{"sets":3,"time":55},"7":{"sets":3,"time":60},"8":{"sets":3,"time":60},"9":{"sets":3,"time":70},"10":{"sets":3,"time":75},"11":{"sets":3,"time":80},"12":{"sets":3,"time":90}}'::jsonb),

-- QUARTA - Pernas + Cardio
('Agachamento', 20, 40, 0, 0, 'reps', 3, '{"1":{"sets":4,"reps":20},"2":{"sets":4,"reps":22},"3":{"sets":4,"reps":25},"4":{"sets":4,"reps":25},"5":{"sets":4,"reps":27},"6":{"sets":4,"reps":28},"7":{"sets":4,"reps":28},"8":{"sets":4,"reps":30},"9":{"sets":4,"reps":30},"10":{"sets":4,"reps":32},"11":{"sets":4,"reps":35},"12":{"sets":4,"reps":40}}'::jsonb),
('Avanço', 10, 20, 0, 0, 'reps', 3, '{"1":{"sets":3,"reps":10,"notes":"cada perna"},"2":{"sets":3,"reps":12,"notes":"cada perna"},"3":{"sets":4,"reps":12,"notes":"cada perna"},"4":{"sets":4,"reps":13,"notes":"cada perna"},"5":{"sets":4,"reps":13,"notes":"cada perna"},"6":{"sets":4,"reps":14,"notes":"cada perna"},"7":{"sets":4,"reps":14,"notes":"cada perna"},"8":{"sets":4,"reps":15,"notes":"cada perna"},"9":{"sets":4,"reps":15,"notes":"cada perna"},"10":{"sets":4,"reps":16,"notes":"cada perna"},"11":{"sets":4,"reps":18,"notes":"cada perna"},"12":{"sets":4,"reps":20,"notes":"cada perna"}}'::jsonb),
('Panturrilha', 25, 45, 0, 0, 'reps', 3, '{"1":{"sets":4,"reps":25},"2":{"sets":4,"reps":27},"3":{"sets":4,"reps":28},"4":{"sets":4,"reps":30},"5":{"sets":4,"reps":30},"6":{"sets":4,"reps":32},"7":{"sets":4,"reps":32},"8":{"sets":4,"reps":35},"9":{"sets":4,"reps":35},"10":{"sets":4,"reps":38},"11":{"sets":4,"reps":40},"12":{"sets":4,"reps":45}}'::jsonb),

-- QUINTA - Upper + Metabólico
('Flexão (Máximo Técnico)', 10, 45, 0, 0, 'reps', 4, '{"1":{"sets":4,"reps":10,"notes":"máximo técnico"},"2":{"sets":4,"reps":12,"notes":"máximo técnico"},"3":{"sets":5,"reps":15,"notes":"máximo técnico"},"4":{"sets":5,"reps":18,"notes":"máximo técnico"},"5":{"sets":5,"reps":20,"notes":"máximo técnico"},"6":{"sets":5,"reps":25,"notes":"máximo técnico"},"7":{"sets":5,"reps":30,"notes":"máximo técnico"},"8":{"sets":5,"reps":35,"notes":"máximo técnico"},"9":{"sets":5,"reps":35,"notes":"máximo técnico"},"10":{"sets":5,"reps":40,"notes":"máximo técnico"},"11":{"sets":5,"reps":40,"notes":"máximo técnico"},"12":{"sets":5,"reps":45,"notes":"máximo técnico"}}'::jsonb),
('Australiana (Máximo)', 10, 30, 0, 0, 'reps', 4, '{"1":{"sets":4,"reps":10,"notes":"máximo"},"2":{"sets":4,"reps":12,"notes":"máximo"},"3":{"sets":5,"reps":15,"notes":"máximo"},"4":{"sets":5,"reps":18,"notes":"máximo"},"5":{"sets":5,"reps":20,"notes":"máximo"},"6":{"sets":5,"reps":22,"notes":"máximo"},"7":{"sets":5,"reps":25,"notes":"máximo"},"8":{"sets":4,"reps":25,"notes":"máximo"},"9":{"sets":5,"reps":25,"notes":"máximo"},"10":{"sets":5,"reps":28,"notes":"máximo"},"11":{"sets":5,"reps":30,"notes":"máximo"},"12":{"sets":5,"reps":30,"notes":"máximo"}}'::jsonb),
('Dips Banco', 12, 25, 0, 0, 'reps', 4, '{"1":{"sets":3,"reps":12},"2":{"sets":3,"reps":14},"3":{"sets":4,"reps":14},"4":{"sets":4,"reps":16},"5":{"sets":4,"reps":16},"6":{"sets":4,"reps":18},"7":{"sets":4,"reps":18},"8":{"sets":4,"reps":20},"9":{"sets":4,"reps":20},"10":{"sets":4,"reps":22},"11":{"sets":4,"reps":25},"12":{"sets":4,"reps":25}}'::jsonb),

-- SEXTA - Full Body + HIIT
('Barra Fixa', 0, 5, 0, 0, 'reps', 5, '{"1":{"sets":0,"reps":0,"notes":"Ainda não"},"2":{"sets":0,"reps":0,"notes":"Ainda não"},"3":{"sets":0,"reps":0,"notes":"Ainda não"},"4":{"sets":0,"reps":0,"notes":"Tentativa parcial"},"5":{"sets":0,"reps":0,"notes":"Tentativa parcial"},"6":{"sets":0,"reps":0,"notes":"Primeira barra provável"},"7":{"sets":4,"reps":1,"notes":"1-3 reps"},"8":{"sets":5,"reps":2,"notes":"2-3 reps"},"9":{"sets":6,"reps":3},"10":{"sets":6,"reps":5},"11":{"sets":6,"reps":4},"12":{"sets":6,"reps":5}}'::jsonb);

-- 7. MENSAGEM DE SUCESSO
DO $$ 
BEGIN
  RAISE NOTICE '✅ Setup concluído com sucesso!';
  RAISE NOTICE '📊 14 exercícios criados';
  RAISE NOTICE '🗓️ Plano de treino de 12 semanas configurado';
  RAISE NOTICE '🎯 Todos os exercícios começam com current_value = 0';
  RAISE NOTICE '';
  RAISE NOTICE 'O app está pronto para uso!';
END $$;

