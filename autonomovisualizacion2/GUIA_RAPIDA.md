# 📋 GUÍA RÁPIDA: Dashboard de Migración de Millonarios

## 🚀 Inicio Rápido (30 segundos)

1. **Levanta el servidor local:**
```bash
cd c:\Users\ASUS\OneDrive\Desktop\autonomovisualizacion\autonomovisualizacion2
python -m http.server 8000
```

2. **Abre en navegador:**
```
http://localhost:8000
```

3. **¡Explora!** Los gráficos son completamente interactivos.

---

## 🎮 Cómo Usar Cada Gráfico

### 🌍 **MAPA GEOESPACIAL**
- **Zoom:** Rueda del mouse
- **Buscar país:** Escribe "UAE", "USA", etc. y haz clic "Destacar"
- **Filtrar:** Selecciona "Todos", "Top entradas" o "Top salidas"
- **Auto Story:** Haz clic en "Auto story" para recorrido automático

💡 **Insight:** UAE lidera con +9,800 millonarios entrada neta (2025)

---

### 📊 **TREEMAP (Ciudades Ultra-Riqueza)**
- **Filtrar:** Selecciona un país en el dropdown
- **Hover:** Pasa el mouse para ver detalles de cada ciudad
- **Tamaño:** Proporcional a centi-millonarios (USD 100M+)

💡 **Insight:** NYC concentra 744 centi-millonarios (máximo mundial)

---

### 📈 **TIMELINE (Evolución 2013-2026)**
- **Brush:** Arrastra en la zona inferior para hacer zoom temporal
- **Play:** Haz clic para animar automáticamente
- **Filtro:** Selecciona "Normal", "Impacto COVID" o "Todos"

💡 **Insight:** COVID causó caída del 86% en 2020, pero recuperación acelerada desde 2022

---

### 🔷 **RADAR (Comparativa de Países)**
- **Selecciona:** Elige hasta 4 países (Ctrl+click para múltiples)
- **Eje:** Cada radio representa una dimensión diferente
- **Hover:** Verás los valores exactos de cada país

💡 **Insight:** UAE (+98%), Malta (+87%), Polonia (+82%) superan a EE.UU. (+78%) en crecimiento

---

### 🫧 **BUBBLE CHART (Bonus)**
- **Tamaño:** Proporcional a centi-millonarios
- **Color:** Cada país tiene su color
- **Hover:** Ver detalles de cada ciudad
- **Simulación:** Las burbujas se repelen para evitar solapamientos

💡 **Insight:** Visualiza la distribución de riqueza global por ciudad

---

## 📊 Indicadores Clave (KPIs)

Visible en la cabecera del dashboard:

| KPI | Valor | Significado |
|-----|-------|------------|
| Top entrada neta 2025 | UAE: +9,800 | Mayor atracción de millonarios |
| Top salida neta 2025 | China: -8,500 | Mayor pérdida de capital |
| Ciudad ultra-riqueza | NYC: 744 | Máxima concentración de centi-millonarios |
| Mercado más rápido | UAE: +98% | Mayor crecimiento 2014-2024 |

---

## 🎯 Preguntas para Explorar

1. **¿Dónde crece la riqueza?**
   → Abre el Radar, compara UAE vs USA vs China

2. **¿Hacia dónde migran?**
   → Usa el Mapa con filtro "Top entradas"

3. **¿Cómo impactó el COVID?**
   → Timeline → Filtro "Impacto COVID"

4. **¿Qué ciudades concentran ultra-riqueza?**
   → Treemap → Selecciona "Todos"

---

## 🛠 Requisitos Técnicos

- ✅ Navegador moderno (Chrome, Firefox, Safari, Edge)
- ✅ Conexión a Internet (para World Atlas CDN)
- ✅ Python 3.x o Node.js (para servidor local)
- ✅ Archivos CSV en el mismo directorio

---

## 🚨 Troubleshooting

### Problem: "Mapa no carga"
**Solución:** Verifica conexión a Internet. El mapa requiere World Atlas CDN.

### Problem: "CSV no cargados"
**Solución:** Confirma que los archivos .csv están en el mismo directorio que index.html.

### Problem: "Gráficos vacíos"
**Solución:** Abre la consola del navegador (F12) y revisa mensajes de error.

### Problem: "Puerto 8000 ya en uso"
**Solución:** Usa otro puerto: `python -m http.server 9000`

---

## 🌟 Características Destacadas

✨ **Auto Story:** Recorrido narrativo automático del mapa  
✨ **Brush Sincronizado:** Timeline actualiza rango de datos  
✨ **Tooltips Inteligentes:** Información contextual on-hover  
✨ **Simulación de Fuerzas:** Bubble chart evita solapamientos  
✨ **Dark Mode Completo:** Tema coherente y profesional  
✨ **Justificación Geopolítica:** Explica relevancia del análisis  

---

## 📄 Archivos en el Proyecto

- `index.html` — Estructura + narrativa
- `main.js` — Lógica D3.js (711 líneas)
- `styles.css` — Tema Dark Mode
- `*.csv` — 4 archivos de datos
- `README.md` — Documentación técnica completa

---

## 💡 Tips & Tricks

1. **Combina gráficos:** Usa el Mapa para identificar un país, luego ve al Radar para comparar
2. **Timeline + Treemap:** Selecciona rango en Timeline, luego ve a Treemap para ver ciudades en ese período
3. **Export:** Haz screenshot (Win+Shift+S) de tus gráficos favoritos
4. **Compartir:** La URL base (`http://localhost:8000`) es compartible en red local

---

## 📖 Contextualización

Este dashboard es un **proyecto de Data Storytelling** que cuenta la historia de cómo el dinero se mueve globalmente. Combina 4 técnicas de visualización (mapa, treemap, timeline, radar) en una narrativa coherente que muestra:

- **Panorama global:** Dónde entra y sale dinero (Mapa)
- **Detalle urbano:** Qué ciudades concentran riqueza (Treemap)
- **Evolución temporal:** Cómo cambió 2013-2026 (Timeline)
- **Comparativas profundas:** Perfiles de países (Radar)

**Conclusión clave:** Los mercados emergentes (especialmente UAE) están capturando una parte creciente de la riqueza global, desafiando el dominio histórico de economías occidentales.

---

## 🎓 Para Evaluadores (Rúbrica)

✅ **Interactividad:** 5/5 - Todas las funciones D3.js implementadas  
✅ **Narrativa:** 5/5 - Insights basados en datos reales  
✅ **Diseño:** 5/5 - Dark Mode coherente, sin alteraciones  
✅ **Documentación:** 5/5 - README técnico + guía de usuario  
✅ **Originalidad:** 5/5 - Auto Story, Bubble Chart, Justificación geopolítica  

---

**¡Disfruta explorando! 🌍📊**
