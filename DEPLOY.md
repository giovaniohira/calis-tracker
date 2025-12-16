# 🚀 Deploy na Vercel - Passo a Passo

## 1. Preparar o Código

```bash
# Certifique-se de que tudo está commitado
git add .
git commit -m "Ready for deploy"
```

## 2. Criar Repositório no GitHub

1. Acesse [github.com](https://github.com)
2. Clique em "New repository"
3. Nome: `calis-tracker` (ou qualquer nome)
4. **NÃO** marque "Initialize with README"
5. Clique em "Create repository"

## 3. Fazer Push do Código

```bash
git remote add origin https://github.com/SEU_USUARIO/calis-tracker.git
git branch -M main
git push -u origin main
```

## 4. Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em **"Add New Project"**
4. Importe o repositório `calis-tracker`
5. A Vercel detectará automaticamente:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Clique em **"Deploy"**

## 5. Configurar Variáveis de Ambiente (Opcional)

**Apenas se você configurou o Supabase:**

1. No projeto na Vercel, vá em **Settings** → **Environment Variables**
2. Adicione:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Sua URL do Supabase (ex: `https://xxxxx.supabase.co`)
3. Adicione:
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: Sua chave anônima do Supabase
4. Clique em **"Redeploy"** para aplicar as variáveis

## 6. Pronto! 🎉

Seu app estará online em ~2 minutos em uma URL como:
- `https://calis-tracker.vercel.app`
- Ou uma URL customizada que você configurar

## 📝 Notas

- O app funciona **sem Supabase** (usa localStorage)
- Se não configurar variáveis de ambiente, o app funcionará normalmente
- Cada push no GitHub gera um novo deploy automaticamente
- A Vercel oferece SSL gratuito e CDN global

