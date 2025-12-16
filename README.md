# Calis Tracker 🏋️

App de tracking de progresso de calistenia com plano de treino de 12 semanas.

## 🚀 Deploy na Vercel

### Passo a Passo

1. **Crie um repositório no GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/calis-tracker.git
   git push -u origin main
   ```

2. **Acesse [vercel.com](https://vercel.com)**
   - Faça login com GitHub
   - Clique em "Add New Project"
   - Importe o repositório
   - A Vercel detectará automaticamente o Next.js

3. **Configure Variáveis de Ambiente (Opcional - apenas se usar Supabase)**
   - Em "Environment Variables", adicione:
     - `NEXT_PUBLIC_SUPABASE_URL` = sua URL do Supabase
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = sua chave anônima do Supabase
   - Se não configurar, o app usará localStorage

4. **Deploy!**
   - Clique em "Deploy"
   - Aguarde ~2 minutos
   - Seu app estará online!

## 🗄️ Setup do Banco de Dados (Opcional)

O app funciona sem banco de dados (usa localStorage), mas para sincronização entre dispositivos:

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o script `supabase/setup.sql` no SQL Editor do Supabase
3. Copie a URL e a chave anônima
4. Adicione as variáveis de ambiente na Vercel (passo 3 acima)

## 🛠️ Desenvolvimento Local

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📦 Tecnologias

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL)
