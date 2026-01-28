# 📖 INSTRUCCIONES DE DESPLIEGUE - PASO A PASO

**PROYECTO:** Migración Global de Millonarios - Data Storytelling con D3.js  
**FECHA:** 27 de enero de 2026  
**VERSIÓN:** 1.0

---

## ✅ REQUISITOS PREVIOS

Antes de comenzar, asegúrate de tener instalado:

1. **Python 3.9+** (Para servidor local)
   - Verifica con: `python --version`
   - Descargar desde: https://www.python.org

2. **Un navegador web** (Chrome, Firefox, Edge, Safari)
   - Se recomienda Chrome para mejor compatibilidad

3. **La carpeta del proyecto** descargada/descomprimida

---

## 🚀 PASO 1: PREPARAR LA CARPETA

1. **Descarga el proyecto** desde (tu repositorio/compartido)
2. **Descomprime el ZIP** en tu escritorio o carpeta deseada
3. **La estructura debe verse así:**

```
autonomovisualizacion2/
├── index.html                          (Página principal)
├── main.js                             (Lógica D3.js)
├── styles.css                          (Estilos Dark Mode)
├── country_millionaire_migration_2025.csv
├── top_50_cities_centi_millionaires.csv
├── global_millionaire_migration_by_year.csv
├── fastest_growing_wealth_markets.csv
├── DOCUMENTACION_NARRATIVA.html        (PDF convertible)
└── (otros archivos de documentación)
```

**IMPORTANTE:** Todos los archivos CSV deben estar en la misma carpeta que `index.html`

---

## 🔧 PASO 2: ABRIR LA TERMINAL

Necesitas acceder a la terminal del sistema. Elige según tu SO:

### Windows
1. Abre **PowerShell** o **Símbolo del sistema**
   - Opción A: Presiona `Win + R`, escribe `cmd` y presiona Enter
   - Opción B: Presiona `Win + X`, selecciona "Windows PowerShell"

2. O desde el Explorador de archivos:
   - Navega a la carpeta `autonomovisualizacion2/`
   - Haz clic derecho en la carpeta vacía (dentro de ella)
   - Selecciona "Abrir PowerShell aquí"

### Mac
1. Abre **Terminal**
   - Presiona `Cmd + Espacio`, escribe "Terminal", presiona Enter

2. O desde Finder:
   - Navega a la carpeta
   - Click derecho → "Open in Terminal"

### Linux
1. Abre **Terminal** (Ctrl + Alt + T usualmente)
2. O click derecho en la carpeta → "Open Terminal Here"

---

## 📁 PASO 3: NAVEGAR A LA CARPETA DEL PROYECTO

En la terminal que abriste, escribe:

```bash
cd ruta/a/la/carpeta/autonomovisualizacion2
```

**EJEMPLOS:**

**Windows:**
```bash
cd C:\Users\TuNombre\Desktop\autonomovisualizacion2
```

**Mac/Linux:**
```bash
cd ~/Desktop/autonomovisualizacion2
```

**O simplemente:**
- Arrastra la carpeta `autonomovisualizacion2` a la terminal
- Automáticamente pegará la ruta correcta

Después presiona **Enter**

---

## ▶️ PASO 4: INICIAR EL SERVIDOR

En la terminal, escribe exactamente esto:

```bash
python -m http.server 8000
```

Presiona **Enter**

**Deberías ver algo como:**
```
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/)
```

✅ **El servidor está corriendo.** No cierres esta ventana.

---

## 🌐 PASO 5: ABRIR EL NAVEGADOR

Abre tu navegador y ve a:

```
http://localhost:8000
```

**Alternativas si no funciona:**
- `http://127.0.0.1:8000`
- `http://0.0.0.0:8000`

**Deberías ver:**
- Título: "Global Wealth Migration Dashboard"
- 4 KPI boxes arriba (Top entrada neta, Top salida, etc.)
- 5 gráficos interactivos (Mapa, Treemap, Timeline, Radar, Bubble)

✅ **¡El dashboard está funcionando!**

---

## 🎮 PASO 6: EXPLORAR EL DASHBOARD

### Gráfico 1: Mapa Geoespacial
- **Botones:** "Mostrar entradas" (🟢 Verde), "Mostrar salidas" (📈 Naranja/Rojo), "Vista global" (Gradiente)
- **Deslizador:** "Top N" para ver top 5-20 países
- **Zoom:** Rueda del ratón para zoom
- **Hover:** Pasa el mouse sobre países para ver datos

### Gráfico 2: Treemap (Ciudades)
- **Dropdown:** Filtra por país
- **Hover:** Ver centi-millonarios por ciudad

### Gráfico 3: Timeline (Evolución temporal)
- **Play/Pause:** Anima los años
- **Brush:** Arrastra para seleccionar rango de años
- **Puntos:** Hover para ver Top 5 países ese año

### Gráfico 4: Radar
- **Multi-select:** Elige hasta 4 países para comparar
- **Ejes:** Crecimiento %, Millonarios, Centi-millonarios, Billonarios

### Gráfico 5: Bubble Chart
- **Arrastra:** Mueve las burbujas
- **Hover:** Ver información

---

## 📄 PASO 7: LEER LA DOCUMENTACIÓN

### Opción A: En el navegador
1. En la misma carpeta, abre:
   ```
   DOCUMENTACION_NARRATIVA.html
   ```
2. Se abrirá en el navegador con toda la narrativa

### Opción B: Convertir a PDF
1. En el navegador, con `DOCUMENTACION_NARRATIVA.html` abierto:
2. Presiona `Ctrl + P` (o `Cmd + P` en Mac)
3. En "Destino" selecciona **"Guardar como PDF"**
4. Elige dónde guardar y haz clic en **"Guardar"**

**¡Ahora tienes el PDF listo para entregar!**

---

## ❌ SOLUCIÓN DE PROBLEMAS

### "No se puede acceder a localhost:8000"

**Solución:**
1. Verifica que la terminal dice `Serving HTTP on...`
2. Si no sale, presiona Ctrl + C y vuelve a escribir:
   ```bash
   python -m http.server 8000
   ```
3. Asegúrate de estar en la carpeta correcta (con los archivos CSV)

### "404 error: File not found"

**Causas:**
- La carpeta no tiene los archivos CSV
- Estás en la carpeta equivocada

**Solución:**
1. Verifica que `country_millionaire_migration_2025.csv` está en la misma carpeta
2. Comprueba que escribiste bien la ruta en terminal

### "Los gráficos no cargan"

**Causas:**
- Los archivos CSV están faltando
- La conexión a CDN de D3.js se perdió

**Solución:**
1. Recarga la página (F5 o Cmd + R)
2. Verifica que tienes internet (para CDN de D3.js)
3. Abre la consola (F12) y busca errores de rojo

### "El mapa sale vacío o en gris"

**Causa:** Los datos no cargan del CSV

**Solución:**
1. Abre `main.js` con un editor de texto
2. Verifica que el código D3 tiene las rutas correctas:
   ```javascript
   d3.csv("country_millionaire_migration_2025.csv", ...)
   ```
3. Recarga (Ctrl + F5 para forzar caché)

---

## 🛑 DETENER EL SERVIDOR

Cuando termines:

1. Ve a la ventana de terminal
2. Presiona **Ctrl + C** (simultáneamente)
3. Escribe **"S"** y presiona **Enter** si pregunta

La terminal cerrará el servidor.

---

## 📤 PARA ENTREGAR EL TRABAJO

Necesitas proporcionar:

### Archivo 1: PDF con narrativa
- **Nombre:** `DOCUMENTACION_NARRATIVA.pdf`
- **Cómo obtener:** Sigue PASO 7, Opción B
- **Contenido:** Narrativa, dataset, herramientas, gráficos, resultados

### Archivo 2: Enlace al dashboard (Opcional pero recomendado)

**Opción A: GitHub Pages (Gratis y permanente)**

1. Crea una cuenta en https://github.com
2. Crea un repositorio nuevo llamado `autonomovisualizacion2`
3. Sube todos los archivos (respeta la estructura)
4. Ve a "Settings" → "Pages"
5. En "Branch" selecciona "main" → "Save"
6. Espera 1-2 minutos
7. Tu proyecto estará en: `https://TuUsuario.github.io/autonomovisualizacion2`

**Opción B: Vercel (Aún más fácil)**
1. Ve a https://vercel.com
2. Click en "Deploy"
3. Conecta tu GitHub
4. Selecciona el repositorio
5. Click Deploy
6. Te da una URL automáticamente

**Opción C: Local (Solo si presentas en la misma máquina)**
- Proporciona las instrucciones de este documento
- El profesor sigue PASO 1-5

---

## ✅ CHECKLIST FINAL

Antes de entregar, verifica:

- [ ] Todos los archivos CSV están en la carpeta `autonomovisualizacion2/`
- [ ] El servidor Python se inicia sin errores
- [ ] El dashboard carga en `http://localhost:8000`
- [ ] Los 5 gráficos se renderizan correctamente
- [ ] Al hacer clic en botones, los colores del mapa cambian
- [ ] El PDF se generó correctamente
- [ ] El enlace a GitHub Pages (si aplica) funciona
- [ ] El PDF contiene todas las secciones requeridas

---

## 📞 CONTACTO Y SOPORTE

Si algo no funciona:

1. **Verifica que Python está instalado:** `python --version`
2. **Verifica que estás en la carpeta correcta:** `ls` (Mac/Linux) o `dir` (Windows)
3. **Verifica los archivos:** Deben estar: `index.html`, `*.csv`, `main.js`, `styles.css`
4. **Abre la consola del navegador:** F12 → "Console" y busca mensajes de error

---

## 🎉 ¡LISTO!

Ahora tienes todo lo necesario para:
1. ✅ Ver el dashboard en funcionamiento
2. ✅ Generar el PDF con documentación
3. ✅ Desplegar a producción (GitHub Pages)
4. ✅ Entregar la tarea

**Última verificación:** El proyecto cumple todos los requisitos de la rúbrica:
- ✅ Dataset válido (Kaggle, libre, con variables numéricas y categóricas)
- ✅ Visualizaciones interactivas (5 gráficos avanzados con D3.js)
- ✅ Gráficos avanzados (Choropleth, Treemap, Radar, Simulación de fuerzas)
- ✅ Documentación completa (Narrativa, dataset, herramientas, gráficos, conclusiones)
- ✅ Código limpio y comentado (711 líneas con JSDoc)

**¡Adelante con la presentación!** 🚀
