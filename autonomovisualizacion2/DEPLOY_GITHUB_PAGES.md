# 🚀 CÓMO DESPLEGAR EN GITHUB PAGES

## Opción 1: Despliegue Rápido (Recomendado)

### Paso 1: Crea un repositorio en GitHub

1. Ve a [github.com/new](https://github.com/new)
2. **Repository name:** `wealth-migration-dashboard` (o tu nombre)
3. **Description:** "Global Wealth Migration Dashboard - Data Storytelling Project"
4. Selecciona **Public**
5. Haz clic en **Create repository**

### Paso 2: Clona y sube los archivos

```bash
# En tu terminal, ve al directorio del proyecto
cd c:\Users\ASUS\OneDrive\Desktop\autonomovisualizacion\autonomovisualizacion2

# Inicializa git
git init

# Agrega todos los archivos
git add .

# Commits
git commit -m "Initial commit: Global Wealth Migration Dashboard"

# Agrega el remote (reemplaza USERNAME con tu usuario GitHub)
git remote add origin https://github.com/USERNAME/wealth-migration-dashboard.git

# Sube a GitHub
git branch -M main
git push -u origin main
```

### Paso 3: Habilita GitHub Pages

1. En tu repositorio GitHub, ve a **Settings**
2. Desplázate a **Pages** (lado izquierdo)
3. Bajo "Source", selecciona **main** (rama)
4. Selecciona **/ (root)** como carpeta
5. Haz clic en **Save**

### Paso 4: ¡Tu sitio está vivo!

En 1-2 minutos, tu dashboard estará disponible en:
```
https://USERNAME.github.io/wealth-migration-dashboard
```

---

## Opción 2: Despliegue con gh-pages Branch

Si prefieres usar una rama específica:

```bash
# Crea rama gh-pages
git checkout -b gh-pages

# Sube a GitHub
git push origin gh-pages

# En GitHub Settings > Pages, selecciona "gh-pages" como source
```

---

## Opción 3: Despliegue Automático con GitHub Actions

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

---

## ✅ Verificación Post-Deploy

Una vez desplegado, verifica que:

1. **Todos los archivos cargan:**
   - Abre la consola del navegador (F12)
   - Ve a la pestaña Network
   - Verifica que todos los CSV tienen status 200

2. **Los gráficos renderean:**
   - Espera 2-3 segundos
   - El mapa debe aparecer
   - Prueba a hacer zoom

3. **Interactividad funciona:**
   - Hover en países
   - Busca "UAE"
   - Arrastra el brush del timeline

---

## 🔍 Solución de Problemas

### "404 - Página no encontrada"
**Causa:** GitHub Pages aún no ha procesado el deploy  
**Solución:** Espera 2-3 minutos y recarga

### "Gráficos no cargan"
**Causa:** Rutas relativas incorrectas  
**Solución:** Verifica que los CSV estén en la raíz del repositorio

### "World Atlas no carga"
**Causa:** CDN bloqueado  
**Solución:** Usa CDN alternativo:
```javascript
d3.json("https://unpkg.com/world-atlas@2/countries-110m.json")
```

### "Algunos CSV no cargan"
**Causa:** Problema de CORS  
**Solución:** GitHub Pages maneja CORS automáticamente. Si persiste, descarga atlas localmente.

---

## 📊 Estadísticas Después del Deploy

Una vez en vivo, puedes monitorear:

1. **GitHub Settings > Pages:**
   - Verás "Deployed successfully" si todo está correcto
   - Puedes ver el histórico de despliegues

2. **Traffic del repositorio:**
   - Analytics → Traffic
   - Verás unique visitors, pageviews

3. **Dominio personalizado (Opcional):**
   - Si tienes un dominio personal
   - Ve a Settings > Pages > Custom domain
   - Agrega tu dominio (ej: dashboard.tudominio.com)

---

## 🎁 URLs Útiles Después del Deploy

| URL | Propósito |
|-----|-----------|
| `https://USERNAME.github.io/wealth-migration-dashboard` | Dashboard principal |
| `https://USERNAME.github.io/wealth-migration-dashboard/README.md` | Documentación |
| `https://github.com/USERNAME/wealth-migration-dashboard` | Repositorio |

---

## 📱 Compartir tu Proyecto

### En redes:
```
✨ Acabo de desplegar mi dashboard de Data Storytelling:
Migración Global de Millonarios (2013-2026)

🌍 Visualiza cómo fluye el capital a nivel mundial
📊 Interactivo con D3.js + Dark Mode

https://USERNAME.github.io/wealth-migration-dashboard

#DataViz #D3js #DataStorytelling
```

### En LinkedIn:
```
Completed: Global Wealth Migration Dashboard
• 5 D3.js visualizations (Map, Treemap, Timeline, Radar, BubbleChart)
• Interactive narratives powered by real data
• Full documentation & deployment

GitHub: [link]
```

---

## 🔒 Seguridad y Privacidad

✅ GitHub Pages es gratuito y seguro
✅ Todos los datos son públicos (no incluyas datos personales)
✅ Los CSV se descargan en cliente (no en servidor)
✅ D3.js realiza procesamiento en cliente

---

## 🎓 Ejemplos de Proyectos D3 en GitHub Pages

Si quieres inspirarte:
- Observable: https://observablehq.com/@d3/
- Bostock's D3: https://bl.ocks.org/mbostock/
- Ejemplo de repositorio: github.com/[usuario]/[proyecto]

---

## ⚡ Resumen Rápido

```bash
# 1. Crea repo en GitHub
# 2. En terminal:
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/wealth-migration-dashboard.git
git branch -M main
git push -u origin main

# 3. En GitHub Settings > Pages > main / root
# 4. Espera 2-3 minutos
# 5. ¡Abre: https://USERNAME.github.io/wealth-migration-dashboard
```

---

**¡Tu dashboard está listo para ser visto por el mundo! 🌍**
