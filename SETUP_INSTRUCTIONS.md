# Pizarra Digital de WODs para Gimnasio (Ultra-Light)

## 1. Supabase (Base de Datos Realtime)
1. Entrá a [Supabase](https://supabase.com/) y creá un nuevo proyecto.
2. Andá The SQL Editor (el ícono de la terminal en el menú izquierdo).
3. Pegá el contenido del archivo `supabase.sql` que está en la raíz de este proyecto y ejecutalo (botón "Run").
4. Andá a Project Settings > API. Copiá la **Project URL** y la **Project API Key (anon/public)**.
5. Creá un archivo `.env` en la raíz del proyecto (a la misma altura que `package.json`) y pegá esto con tus datos:
   ```env
   VITE_SUPABASE_URL=tu_project_url_aca
   VITE_SUPABASE_ANON_KEY=tu_anon_key_aca
   ```

## 2. GitHub (Repositorio de Código)
1. Entrá a [GitHub](https://github.com/) y creá un nuevo repositorio vacío (sin README, ni gitignore).
2. Abrí la terminal en la carpeta de este proyecto y corré estos comandos:
   ```bash
   git add .
   git commit -m "Initial commit de la Pizarra Digital WOD"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git push -u origin main
   ```

## 3. Vercel (Hosting Gratuito)
1. Entrá a [Vercel](https://vercel.com/) y hacé login con tu cuenta de GitHub.
2. Tocá el botón "Add New..." -> "Project".
3. Importá el repositorio de GitHub que acabás de crear.
4. En "Framework Preset" asegurate de que diga **Vite** (suele detectarlo solo).
5. Desplegá la sección "Environment Variables" y agregá las dos variables de Supabase:
   *   Name: `VITE_SUPABASE_URL` | Value: `tu_project_url_aca`
   *   Name: `VITE_SUPABASE_ANON_KEY` | Value: `tu_anon_key_aca`
6. Tocá **Deploy**. ¡Listo! Vas a tener un link público para abrir en la TV.
