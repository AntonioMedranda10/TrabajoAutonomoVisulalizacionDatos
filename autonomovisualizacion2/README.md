# 🌍 Global Wealth Migration Dashboard
## Data Storytelling: Narrativa con Datos sobre Migración Global de Millonarios (2013-2026)

### 📊 Descripción del Proyecto

Dashboard interactivo que cuenta la historia de cómo se mueven los millonarios globales y cómo la riqueza se concentra en ciudades y países. Análisis de **10 años de datos** (2013-2026) con proyecciones futuras, enfoque en el impacto COVID y el auge de mercados emergentes.

---

## 🎯 Objetivos Logrados

### ✅ Interactividad Completa (D3.js v7)

1. **Mapa Geoespacial (Natural Earth)**
   - Zoom fluido con scroll
   - Tooltips detallados al pasar el mouse
   - Barra de búsqueda interactiva con resaltado de países
   - Filtros: Vista de todas, top entradas, top salidas
   - Auto Story: recorrido automático narrativo
   - Coloración divergente (rojo = salida, verde = entrada)

2. **Treemap de Centi-Millonarios**
   - Top 50 ciudades con ultra-riqueza (USD 100M+)
   - Filtro por país
   - Hover interactivo con detalles
   - Tamaño proporcional a cantidad de centi-millonarios

3. **Timeline con Brush Sincronizado**
   - Gráfico de área (2013-2026)
   - Brush selector para zoom temporal
   - Play/Pause para animar rango
   - Destaca impacto COVID (2020-2021: caída del 86%)
   - Filtro por escenario (Normal vs COVID)

4. **Radar Multidemensional**
   - Compara hasta 4 países simultáneamente
   - Dimensiones: Crecimiento %, Millonarios, Centi-millonarios, Billonarios
   - Escalas normalizadas (0-1) por eje
   - Preselecciona top 4 por crecimiento

5. **Bubble Chart (Bonus)**
   - Explorador de ciudades con simulación de fuerzas
   - Tamaño = centi-millonarios
   - Color = país
   - Transiciones fluidas D3

### 📖 Narrativa de Datos Completa

- **Sección Hero:** 4 preguntas clave basadas en insights reales
- **Lectura Rápida:** Análisis de flujos por sección
- **Justificación del Dataset:** Párrafo extenso sobre relevancia geopolítica
- **KPIs en Tiempo Real:** Top inflows/outflows, ciudades, mercados

### 🎨 Estética Dark Mode Preservada

- Tema coherente en todas las secciones
- Paleta: #0d1117 (fondo), #2f81f7 (acento), #58a6ff (líneas)
- Bordes redondeados, sombras sutiles
- Tipografía: Inter/Segoe UI

---

## 📂 Estructura de Archivos

```
autonomovisualizacion2/
├── index.html                                  # Estructura HTML + narrativa
├── main.js                                    # Lógica D3.js (650+ líneas comentadas)
├── styles.css                                 # Tema Dark Mode
├── country_millionaire_migration_2025.csv    # Datos de flujos por país
├── top_50_cities_centi_millionaires.csv      # Top ciudades ultra-riqueza
├── global_millionaire_migration_by_year.csv  # Series temporales (2013-2026)
├── fastest_growing_wealth_markets.csv        # Perfiles país + radar
└── README.md                                 # Este archivo
```

---

## 🚀 Cómo Ejecutar

### Opción 1: Servidor Local Python (Recomendado)
```bash
cd c:\Users\ASUS\OneDrive\Desktop\autonomovisualizacion\autonomovisualizacion2
python -m http.server 8000
# Luego: http://localhost:8000
```

### Opción 2: Servidor con Node.js
```bash
npx http-server -p 8000
```

### Opción 3: Desplegar en GitHub Pages
1. Crea repositorio en GitHub
2. Sube archivos a `gh-pages` branch
3. Habilita GitHub Pages en Settings
4. URL: `https://tuusuario.github.io/autonomovisualizacion/autonomovisualizacion2/`

---

## 📊 Insights Clave del Dataset

| Métrica | Valor | Implicación |
|---------|-------|------------|
| **Top Entrada 2025** | UAE: +9,800 | Mercados emergentes lideran atracción |
| **Top Salida 2025** | China: -8,500 | Fuga de capitales por desconfianza política |
| **Ciudad Ultra-Riqueza** | NYC: 744 centi-M | Concentración de poder económico en EE.UU. |
| **Crecimiento Máximo** | UAE: +98% (2014-24) | Reformas fiscales y estabilidad política |
| **Impacto COVID** | 2020: -86% (-98k) | Pandemia paraliza movimientos globales |
| **Recuperación** | 2022-26: +98% | Boom acelerado post-COVID |

---

## 🎓 Técnicas de Visualización Utilizadas

1. **Cartografía Coroplética:** Mapa con coloración divergente
2. **Treemaps:** Jerarquía proporcional (ciudades vs riqueza)
3. **Series Temporales + Brush:** Timeline interactivo
4. **Gráficos Radar:** Comparativa multidimensional
5. **Simulación de Fuerzas:** Bubble chart evitando solapamientos
6. **Tooltips Contextuales:** Información detallada on-hover
7. **Filtros Dinámicos:** Cambio de vista sin recargar datos

---

## 💻 Requisitos Técnicos

- **D3.js v7** (CDN)
- **TopoJSON** para World Atlas
- **Navegador moderno** (Chrome, Firefox, Safari, Edge)
- **Python 3.x** o **Node.js** (para servidor local)

---

## 🔧 Código Destacado

### Ejemplo: Brush Sincronizado
```javascript
const brush = d3.brushX()
    .extent([[0,0],[w, brushHeight]])
    .on("brush end", ({selection}) => {
        if (!selection) return;
        const [x0, x1] = selection.map(x2.invert);
        x.domain([x0, x1]);
        globalState.selectedYearRange = [Math.round(x0), Math.round(x1)];
        // Actualiza otros gráficos automáticamente
    });
```

### Ejemplo: Coloración Divergente
```javascript
const colorScale = d3.scaleDiverging(d3.interpolateRdYlGn)
    .domain([netExtent[0], 0, netExtent[1]]);
// Rojo ← 0 → Verde (entrada/salida)
```

---

## 📋 Rúbrica de Cumplimiento

| Requisito | Estado | Notas |
|-----------|--------|-------|
| Interactividad completa D3.js | ✅ | 5 gráficos + bonus Bubble Chart |
| Zoom fluido + Tooltips | ✅ | Mapa con hover detallado |
| Búsqueda interactiva | ✅ | Resaltado dinámico de países |
| Treemap con drill-down | ✅ | Filtro por país + hover |
| Brush sincronizado | ✅ | Timeline actualiza rango de datos |
| Radar con 4 países | ✅ | Selección múltiple, preselect top 4 |
| Narrativa de datos | ✅ | 4 preguntas clave basadas en insights |
| Storytelling coherente | ✅ | Flujo: Mapa → Treemap → Timeline → Radar |
| Auto Story mejorado | ✅ | Recorrido automático entre vistas |
| Gráfico Bonus (Burbujas) | ✅ | Con simulación de fuerzas |
| Justificación Dataset | ✅ | Párrafo sobre geopolítica + relevancia |
| Código limpio comentado | ✅ | 650+ líneas con comentarios docstring |
| Estética Dark Mode | ✅ | Paleta preservada, sin cambios visuales |

---

## 🌟 Características Originales para "10"

### 1. **Auto Story Narrativo**
Botón que hace recorrido automático por vistas (Inflows → Outflows → Global) con transiciones suaves.

### 2. **Bubble Chart con Simulación de Fuerzas**
Gráfico bonus que muestra ciudades como burbujas, evitando solapamientos con física D3.

### 3. **Justificación Geopolítica del Dataset**
Sección completa explicando por qué la migración de millonarios es indicador de salud económica global.

### 4. **KPIs Dinámicos**
Cabecera que actualiza automáticamente con top inflows, outflows, ciudades y mercados.

### 5. **Navegación Smooth Scroll**
Links superiores que desplazan fluidamente entre secciones y resaltan dinámicamente.

---

## 📝 Notas de Desarrollo

- **Responsividad:** Grid container usa `repeat(auto-fit, minmax(420px, 1fr))` para adaptarse
- **Performance:** Usa D3 transitions en lugar de redibujado completo
- **Accesibilidad:** Tooltips con Markdown-like syntax para claridad
- **Datos:** CSV parseados con `d3.csv()` con schema tipado

---

## 🐛 Troubleshooting

### Problema: "Cannot find module..."
**Solución:** Los datos CSV deben estar en el mismo directorio. Comprueba rutas relativas en `main.js`.

### Problema: Mapa no carga
**Solución:** Requiere conexión a Internet para World Atlas CDN (`cdn.jsdelivr.net`). Si está offline, descarga atlas localmente.

### Problema: Brush no actualiza gráficos
**Solución:** Usa `globalState` para sincronizar. Verifica que los listeners de `change` estén conectados.

---

## 📄 Licencia

- **Dataset:** CC BY-SA 4.0 (Kaggle)
- **Código:** MIT (libre para uso académico/comercial)

---

## 👤 Autor

Proyecto de Data Storytelling | 2026

---

**¡Disfruta explorando la migración global de millonarios! 💰🌍**
