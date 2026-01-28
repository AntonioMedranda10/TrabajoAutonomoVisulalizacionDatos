# 💻 GUÍA DE CÓDIGO DETALLADA - COMENTARIOS EXPLICATIVOS

Este documento contiene **fragmentos de código real** con comentarios línea por línea explicando qué hace cada parte.

---

## 📍 TABLA DE CONTENIDOS

1. [Carga de Datos](#carga-de-datos)
2. [Mapa Geoespacial](#mapa-geoespacial)
3. [Treemap Jerárquico](#treemap-jerárquico)
4. [Timeline con Brush](#timeline-con-brush)
5. [Radar Multidimensional](#radar-multidimensional)
6. [Bubble Chart (Bonus)](#bubble-chart-bonus)

---

# 1. CARGA DE DATOS

## Código: Promise.all() para cargar múltiples fuentes

```javascript
/**
 * CARGAR TODOS LOS DATOS AL MISMO TIEMPO
 * 
 * ¿Por qué Promise.all()?
 * - Sin Promise.all(): Cargaría 1 archivo, espera, luego siguiente (lento)
 * - Con Promise.all(): Carga 5 archivos en paralelo (rápido)
 * - Ahorra ~1-2 segundos en carga inicial
 */

Promise.all([
    // 1️⃣ CARGAR MAPA DEL MUNDO (TopoJSON de CDN)
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
    // Resultado: {objects: {countries: {geometries: [...]}}, ...}
    // Este archivo contiene las coordenadas de TODOS los países
    
    
    // 2️⃣ CARGAR CSV #1: Flujos de millonarios por país
    d3.csv("country_millionaire_migration_2025.csv", d => ({
        // Cada fila (d) se convierte en objeto con tipos correctos
        country: d.country,                                    // "UAE", "USA", etc.
        net: +d.net_millionaire_migration_2025,              // Convierte a número
        wealth: +d.estimated_migrating_wealth_usd_bn,        // Dólares en miles de millones
        growth: +d.millionaire_growth_pct_2014_2024         // Porcentaje
    })),
    // Resultado: Array de 150+ países con sus datos numéricos
    
    
    // 3️⃣ CARGAR CSV #2: Top 50 ciudades con ultra-riqueza
    d3.csv("top_50_cities_centi_millionaires.csv", d => ({
        city: d.city,                                         // "New York", "London", etc.
        country: d.country,                                   // País donde está
        centi: +d.centi_millionaires_usd_100m_plus          // Personas con +$100M USD
    })),
    // Resultado: Array de 50 ciudades ordenadas por riqueza
    
    
    // 4️⃣ CARGAR CSV #3: Serie de tiempo (2013-2026)
    d3.csv("global_millionaire_migration_by_year.csv", d => ({
        year: +d.year,                                        // 2013, 2014, ..., 2026
        value: +d.migrating_millionaires,                    // Cantidad ese año
        status: d.status                                      // "Normal" o "Coronavirus Impact"
    })),
    // Resultado: Array de 14 años con cantidades y estado
    
    
    // 5️⃣ CARGAR CSV #4: Mercados con crecimiento
    d3.csv("fastest_growing_wealth_markets.csv", d => ({
        country: d.country,                                   // País
        growth: +d.millionaire_growth_pct_2014_2024,        // Crecimiento %
        millionaires: +d.millionaires_usd_1m_plus,          // Total de millonarios
        centi: +d.centi_millionaires_usd_100m_plus,         // Total de ultra-ricos
        billionaires: +d.billionaires_usd_1bn_plus          // Total de billonarios
    }))
    // Resultado: Array de países con 4 dimensiones de datos

]).then(([worldData, migrationData, cityData, timeData, radarData]) => {
    // ✅ AQUÍ LLEGA CUANDO TODOS LOS 5 ARCHIVOS CARGARON EXITOSAMENTE
    // Los nombres entre [] DEBEN coincidir con el orden arriba
    
    
    // GUARDAR DATOS GLOBALES (para acceso desde cualquier gráfico)
    globalState.allData = {
        migrationData,  // CSV 1
        cityData,       // CSV 2
        timeData,       // CSV 3
        radarData,      // CSV 4
        worldData       // TopoJSON
    };
    // Ahora cualquier función puede hacer: globalState.allData.migrationData
    
    
    // MOSTRAR LOS 4 INDICADORES CLAVE
    updateKpis(migrationData, cityData, radarData, timeData);
    // Esta función busca el máximo/mínimo de cada dataset
    // y lo muestra en la pantalla (KPI = Key Performance Indicator)
    
    
    // RENDERIZAR (DIBUJAR) TODOS LOS GRÁFICOS
    renderMap(worldData, migrationData);       // Mapa + colores
    renderTreemap(cityData);                   // Rectángulos por ciudad
    renderLineChart(timeData);                 // Área con brush
    renderRadar(radarData);                    // Gráfico radar multidimensional
    renderBubbleChart(cityData, radarData);    // Burbujas con simulación
    setupNavigation();                          // Navegación suave entre secciones
    
    console.log("✅ Dashboard cargado completamente");
    
}).catch(error => {
    // ❌ SI ALGO FALLA (archivo no encontrado, sintaxis JSON mala, etc.)
    console.error("Error cargando datos:", error);
    alert("Error: No se pudieron cargar los datos. Verifica que los CSV existen.");
});
```

### Explicación del flujo:

```
INICIO:
  ↓
Navegador solicita 5 archivos
  ↓ (en paralelo, simultáneamente)
1. TopoJSON del mundo     (descargando...)
2. CSV países              (descargando...)
3. CSV ciudades           (descargando...)
4. CSV timeline           (descargando...)
5. CSV mercados           (descargando...)
  ↓ (cuando TODOS terminan)
.then(([data1, data2, ...]) => {
  Dibujar todo
  Mostrar dashboard
})
```

---

# 2. MAPA GEOESPACIAL

## Código: Crear y colorear el mapa

```javascript
/**
 * FUNCIÓN: renderMap()
 * Dibuja un mapa del mundo donde cada país está coloreado
 * Verde = Entrada de millonarios
 * Rojo = Salida de millonarios
 */

function renderMap(worldData, migrationData) {
    
    // ═══════════════════════════════════════════════════════
    // PASO 1: PREPARAR LOS DATOS
    // ═══════════════════════════════════════════════════════
    
    // Crear un "diccionario" (Map) para búsqueda rápida
    // Convierte: Array [{country: "UAE", net: 9800}, ...]
    //       En:  Map {"UAE" → {country: "UAE", net: 9800}, ...}
    const migrationMap = new Map(
        migrationData.map(d => [
            d.country,  // Clave: nombre del país
            d           // Valor: objeto completo con todos sus datos
        ])
    );
    // Ahora: migrationMap.get("UAE") retorna {country: "UAE", net: 9800, ...}
    // En O(1) tiempo = búsqueda ultrarápida
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 2: CREAR ESCALA DE COLORES
    // ═══════════════════════════════════════════════════════
    
    // Encontrar el valor mínimo (salida máxima = más rojo)
    const minNet = d3.min(migrationData, d => d.net);  // Ej: -8900 (China)
    
    // Encontrar el valor máximo (entrada máxima = más verde)
    const maxNet = d3.max(migrationData, d => d.net);  // Ej: +9800 (UAE)
    
    // Escala divergente: Red-Yellow-Green
    // En el MEDIO (0) = amarillo (neutral)
    // En los EXTREMOS = rojo o verde
    const colorScale = d3.scaleDiverging()
        .domain([minNet, 0, maxNet])  // Rango de números
        .interpolator(d3.interpolateRdYlGn);  // Interpolador oficial D3
    
    // Resultado de colorScale:
    // colorScale(-8900) → "#d73027" (ROJO oscuro - salida)
    // colorScale(0)     → "#fee8c8" (AMARILLO - neutral)
    // colorScale(+9800) → "#1a9850" (VERDE oscuro - entrada)
    // colorScale(-2000) → "#fc8d59" (NARANJA - salida parcial)
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 3: CREAR PROYECCIÓN DEL MUNDO
    // ═══════════════════════════════════════════════════════
    
    // Proyección Natural Earth (realista para mapas políticos)
    const projection = d3.geoNaturalEarth1()
        .fitSize([width, height], worldData);
    // width = 820 píxeles
    // height = 460 píxeles
    // worldData = objeto TopoJSON completo
    // .fitSize = ajusta automáticamente la escala para que quepa todo
    
    // Resultado: Una función que convierte [lon, lat] → [x, y]
    // Ej: projection([0, 0]) retorna [410, 230] (centro del mapa)
    
    
    // Crear "dibujante" de geografía
    // Toma geometría TopoJSON + proyección = caminos SVG
    const geoPath = d3.geoPath()
        .projection(projection);
    // Ej: geoPath(egyptGeogeometry) retorna "M 123 456 L 234 567 ..."
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 4: LIMPIAR Y CREAR SVG PRINCIPAL
    // ═══════════════════════════════════════════════════════
    
    // Seleccionar contenedor HTML del mapa
    const svg = d3.select("#map-container")
        .html("")  // Limpiar contenido anterior (si renderizamos de nuevo)
        .append("svg")  // Crear nuevo elemento SVG
        .attr("width", width)   // 820 píxeles
        .attr("height", height);  // 460 píxeles
    
    // Crear grupo (g) para aplicar zoom después
    const g = svg.append("g");
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 5: EXTRAER PAÍSES DE TOPOJSON
    // ═══════════════════════════════════════════════════════
    
    // TopoJSON es un formato comprimido de GeoJSON
    // Necesitamos convertir usando la librería topojson
    const countries = topojson.feature(
        worldData,                          // Datos TopoJSON
        worldData.objects.countries         // Especificar qué extraer
    ).features;
    // Resultado: Array de 200+ objetos, cada uno con:
    // {
    //   geometry: {type: "Polygon", coordinates: [[...]]},
    //   properties: {name: "Egypt", ...}
    // }
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 6: DIBUJAR CADA PAÍS
    // ═══════════════════════════════════════════════════════
    
    g.selectAll("path")        // Seleccionar TODOS los <path> (ninguno existe aún)
        .data(countries)        // Vincular a los 200+ países
        .join("path")           // Crear <path> para cada país
        
        // ─── ATRIBUTO 1: Geometría (d = data = país)
        .attr("d", geoPath)     // Aplicar la función geoPath
        // Resultado: <path d="M 123 456 L 234 567 ..."/>
        // SVG dibuja la forma del país
        
        // ─── ATRIBUTO 2: Color del relleno
        .attr("fill", d => {
            // d = objeto país con properties.name = "Egypt"
            
            // Buscar datos de migración para este país
            const data = migrationMap.get(d.properties.name);
            // data = {country: "Egypt", net: 234, wealth: 5.2, growth: 8}
            
            if (data) {
                // Si encontramos datos, colorear según el flujo neto
                return colorScale(data.net);
                // Ej: colorScale(234) → color verde claro
            } else {
                // Si NO hay datos (Groenlandia, islas pequeñas), gris
                return "#ccc";
            }
        })
        
        // ─── ATRIBUTO 3: Color del borde
        .attr("stroke", "#fff")         // Blanco = separa países
        .attr("stroke-width", 0.5)      // Muy delgado
        
        // ─── EVENTO 1: Al pasar mouse SOBRE el país
        .on("mouseover", function(event, d) {
            // this = el elemento <path> del país
            // event = evento del mouse
            // d = datos del país
            
            // Buscar datos de migración
            const data = migrationMap.get(d.properties.name);
            
            if (data) {
                // Cambiar cursor a pointer (indicar que es interactivo)
                d3.select(this).style("cursor", "pointer");
                
                // Mostrar tooltip con información
                tooltip
                    .style("visibility", "visible")  // Hacerlo visible
                    .style("background", "#222")     // Fondo oscuro
                    .style("color", "#fff")          // Texto blanco
                    .style("padding", "8px 12px")
                    .style("border-radius", "4px")
                    .html(`
                        <strong>${data.country}</strong><br/>
                        Entrada neta: <strong>${fmt(data.net)}</strong><br/>
                        Riqueza migrada: <strong>$${fmt(data.wealth)}B</strong><br/>
                        Crecimiento 2014-2024: <strong>${data.growth}%</strong>
                    `);
                // fmt = formateador de números (agrega comas)
                // Ej: fmt(9800) → "9,800"
            }
        })
        
        // ─── EVENTO 2: Al mover mouse (actualizar posición del tooltip)
        .on("mousemove", function(event) {
            // event.pageX, event.pageY = posición del mouse en pantalla
            tooltip
                .style("top", (event.pageY - 10) + "px")   // Arriba del mouse
                .style("left", (event.pageX + 10) + "px"); // A la derecha
        })
        
        // ─── EVENTO 3: Al salir del país
        .on("mouseout", function() {
            // Ocultamos el tooltip
            tooltip.style("visibility", "hidden");
        });
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 7: AGREGAR ZOOM INTERACTIVO
    // ═══════════════════════════════════════════════════════
    
    // Crear comportamiento de zoom (rueda del mouse, clic+arrastrar)
    const zoom = d3.zoom()
        .scaleExtent([1, 4])  // Zoom mínimo 1x, máximo 4x
        .on("zoom", (event) => {
            // event.transform = objeto con escala (scale) y traslación (translate)
            // Aplicar la transformación a TODO lo dentro del grupo
            g.attr("transform", event.transform);
        });
    
    // Activar zoom en el SVG completo
    svg.call(zoom);
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 8: AGREGAR BÚSQUEDA DE PAÍS
    // ═══════════════════════════════════════════════════════
    
    // Escuchar cambios en el input de búsqueda
    d3.select("#mapSearch")
        .on("input", function() {
            // this.value = lo que escribió el usuario
            // Ej: "UAE"
            const query = this.value.toUpperCase();
            // "UAE" → "UAE" (normalizar a mayúsculas)
            
            // Cambiar color de bordes de TODOS los países
            g.selectAll("path")
                .style("stroke", d => {
                    const name = d.properties.name;
                    
                    // Si el nombre del país CONTIENE lo que buscas
                    if (name.toUpperCase().includes(query)) {
                        return "#ffff00";  // Borde AMARILLO (resaltado)
                    } else {
                        return "#fff";     // Borde blanco (normal)
                    }
                })
                .style("stroke-width", d => {
                    // También engrosar el borde del país encontrado
                    if (d.properties.name.toUpperCase().includes(query)) {
                        return "2px";      // Más grueso
                    } else {
                        return "0.5px";    // Normal
                    }
                });
        });
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 9: AGREGAR FILTROS (Todos / Entradas / Salidas)
    // ═══════════════════════════════════════════════════════
    
    // Dropdown con opciones
    d3.select("#mapMode")
        .on("change", function() {
            // this.value = valor seleccionado
            // Ej: "inflow", "outflow", "all"
            const mode = this.value;
            
            // Mostrar/ocultar países según el modo
            g.selectAll("path")
                .style("display", d => {
                    const data = migrationMap.get(d.properties.name);
                    
                    if (!data) return "none";  // Sin datos = ocultar
                    
                    if (mode === "inflow") {
                        // Mostrar solo países con entrada (net > 0)
                        return data.net > 0 ? "block" : "none";
                    } else if (mode === "outflow") {
                        // Mostrar solo países con salida (net < 0)
                        return data.net < 0 ? "block" : "none";
                    } else {
                        // "all" = mostrar todos
                        return "block";
                    }
                });
        });
    
    
    // ═════════════════════════════════════════════════════
    // PASO 10: AUTO STORY (BONUS)
    // ═════════════════════════════════════════════════════
    
    let mapAutoInterval = null;  // Variable para controlar la animación
    
    d3.select("#mapAutoBtn")
        .on("click", function() {
            
            if (mapAutoInterval) {
                // Si ya está activo, detenerlo (toggle)
                clearInterval(mapAutoInterval);
                mapAutoInterval = null;
                d3.select(this).text("Auto story");
                return;
            }
            
            // Secuencia de vistas: todos → entradas → salidas → todos → ...
            const sequence = ["all", "inflow", "outflow"];
            let idx = 0;
            
            // Cambiar el texto del botón a "parar"
            d3.select(this).text("⏸ Parar auto");
            
            // Cada 3.2 segundos, cambiar a la siguiente vista
            mapAutoInterval = setInterval(() => {
                idx = (idx + 1) % sequence.length;  // Ciclar: 0→1→2→0→...
                
                // Cambiar el dropdown de modo
                d3.select("#mapMode")
                    .property("value", sequence[idx])
                    .dispatch("change");  // Dispara el evento change
                    // Esto ejecuta el código del filtro arriba
                
            }, 3200);  // 3200 ms = 3.2 segundos
        });
}
```

---

# 3. TREEMAP JERÁRQUICO

## Código: Visualizar ciudades por tamaño

```javascript
/**
 * FUNCIÓN: renderTreemap()
 * Dibuja rectángulos donde cada uno = una ciudad
 * Tamaño del rectángulo = cantidad de centi-millonarios
 */

function renderTreemap(cityData) {
    
    // ═══════════════════════════════════════════════════════
    // PASO 1: CREAR SVG
    // ═══════════════════════════════════════════════════════
    
    const svg = d3.select("#treemap-container")
        .html("")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 2: ORGANIZAR DATOS EN JERARQUÍA
    // ═══════════════════════════════════════════════════════
    
    // Treemap necesita estructura jerárquica: País → Ciudades
    // Vamos a crear:
    // {
    //   name: "root",
    //   children: [
    //     {
    //       name: "USA",
    //       children: [
    //         {name: "New York", value: 744},
    //         {name: "Bay Area", value: 675},
    //         ...
    //       ]
    //     },
    //     {name: "UK", children: [...]},
    //     ...
    //   ]
    // }
    
    // Agrupar ciudades por país
    const grouped = d3.group(cityData, d => d.country);
    // Resultado: Map {"USA" → [{city: "NY", ...}, {...}], ...}
    
    // Convertir a estructura jerárquica
    const hierarchyData = {
        name: "world",
        children: Array.from(grouped, ([country, cities]) => ({
            name: country,
            children: cities.map(d => ({
                name: d.city,
                value: d.centi  // IMPORTANTE: valor para calcular tamaño
            }))
        }))
    };
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 3: CREAR ALGORITMO TREEMAP
    // ═══════════════════════════════════════════════════════
    
    // Algoritmo que particiona el espacio rectangularmente
    const treemap = d3.treemap()
        .size([width, height])  // Tamaño total disponible
        .padding(2)             // Espaciado entre rectángulos
        .round(true);           // Redondear coordenadas (cleaner)
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 4: CREAR JERARQUÍA D3
    // ═══════════════════════════════════════════════════════
    
    // Convertir datos a objeto jerarquía D3
    const root = d3.hierarchy(hierarchyData)
        .sum(d => d.value)  // SUMA: cada nodo = suma de sus hijos
        // Ej: USA.value = sum(NY.value, Bay Area.value, LA.value, ...)
        .sort((a, b) => b.value - a.value);  // Ordenar descendente
    
    // Aplicar algoritmo treemap
    treemap(root);
    
    // Obtener las "hojas" (ciudades, no países)
    const leaves = root.leaves();
    // Cada leaf tiene: x0, y0, x1, y1, parent, data.name, value
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 5: DEFINIR ESCALA DE COLORES (por país)
    // ═══════════════════════════════════════════════════════
    
    // Colores diferentes por país
    const colorScale = d3.scaleOrdinal()
        .domain(grouped.keys())  // Todos los países únicos
        .range(d3.schemeTableau10);  // 10 colores predefinidos
    
    // Resultado: colorScale("USA") → "#1f77b4" (azul)
    //            colorScale("UK") → "#ff7f0e" (naranja)
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 6: DIBUJAR RECTÁNGULOS
    // ═══════════════════════════════════════════════════════
    
    const rects = svg.selectAll("rect")
        .data(leaves)  // 50 ciudades
        .join("rect")
        
        // Posición y tamaño
        .attr("x", d => d.x0)          // Esquina superior izquierda X
        .attr("y", d => d.y0)          // Esquina superior izquierda Y
        .attr("width", d => d.x1 - d.x0)   // Ancho = diferencia de X
        .attr("height", d => d.y1 - d.y0)  // Alto = diferencia de Y
        
        // Estilo
        .attr("fill", d => colorScale(d.parent.data.name))  // Color por país
        .attr("stroke", "#0d1117")    // Borde oscuro (fondo del dashboard)
        .attr("stroke-width", 1);
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 7: AGREGAR TEXTO (NOMBRES)
    // ═══════════════════════════════════════════════════════
    
    const texts = svg.selectAll("text")
        .data(leaves)
        .join("text")
        .attr("x", d => d.x0 + 4)      // Dentro del rectángulo, 4px del borde
        .attr("y", d => d.y0 + 20)     // Arriba, 20px del borde
        .attr("fill", "#fff")          // Blanco
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .text(d => {
            const name = d.data.name;
            const value = fmt(d.value);  // Formato con comas
            return `${name}: ${value}`;
        });
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 8: AGREGAR INTERACTIVIDAD (HOVER)
    // ═══════════════════════════════════════════════════════
    
    rects.on("mouseover", function(event, d) {
        // Al pasar mouse:
        d3.select(this)
            .transition()  // Animar el cambio
            .duration(200)  // En 200 milisegundos
            .attr("opacity", 0.8)  // Oscurecer un poco
            .attr("stroke-width", 2);  // Borde más grueso
        
        // Mostrar tooltip detallado
        tooltip
            .style("visibility", "visible")
            .html(`
                <strong>${d.data.name}</strong><br/>
                País: ${d.parent.data.name}<br/>
                Centi-millonarios: ${fmt(d.value)}
            `);
    })
    .on("mousemove", function(event) {
        tooltip
            .style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", function() {
        d3.select(this)
            .transition()
            .duration(200)
            .attr("opacity", 1)
            .attr("stroke-width", 1);
        
        tooltip.style("visibility", "hidden");
    });
}
```

---

# 4. TIMELINE CON BRUSH

## Código: Gráfico de área con selector temporal

```javascript
/**
 * FUNCIÓN: renderLineChart()
 * Muestra evolución temporal (2013-2026) con:
 * - Gráfico de área principal (arriba)
 * - Brush para seleccionar rango (abajo)
 * - Play button para animar
 */

function renderLineChart(timeData) {
    
    // ═══════════════════════════════════════════════════════
    // PASO 1: CREAR ESCALAS
    // ═══════════════════════════════════════════════════════
    
    // Escala X (horizontal): Años 2013-2026
    const xScale = d3.scaleLinear()
        .domain(d3.extent(timeData, d => d.year))  // Min y max automaticamente
        // domain = [2013, 2026]
        .range([0, width]);  // range = [0, 820] píxeles
    
    // Escala Y (vertical): Cantidad de millonarios (0 a máximo)
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(timeData, d => d.value)])  // 0 a 165000
        .range([height, 0]);  // INVERTIDO porque Y crece hacia abajo en SVG
        // range = [460, 0] (arriba = valor alto, abajo = 0)
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 2: CREAR FUNCIONES GENERADORAS
    // ═══════════════════════════════════════════════════════
    
    // Función para dibujar el área (relleno bajo la línea)
    const areaGenerator = d3.area()
        .x(d => xScale(d.year))        // Posición horizontal del punto
        .y0(height)                     // Línea base (abajo)
        .y1(d => yScale(d.value));      // Altura del punto
    
    // Ej: Para {year: 2020, value: 12000}
    // → (xScale(2020), yScale(12000)) = punto alto
    // → Se dibuja área desde abajo hasta ese punto
    
    
    // Función para dibujar la línea (borde superior del área)
    const lineGenerator = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.value));
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 3: CREAR SVG
    // ═══════════════════════════════════════════════════════
    
    const svg = d3.select("#line-container")
        .html("")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 4: DIBUJAR ÁREA
    // ═══════════════════════════════════════════════════════
    
    // datum() = bind array completo (no individual items)
    svg.append("path")
        .datum(timeData)  // Todos los datos a la vez
        .attr("d", areaGenerator)  // Usar generador de área
        .attr("fill", "#2f81f7")   // Azul
        .attr("opacity", 0.3);      // Semitransparente
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 5: DIBUJAR LÍNEA (BORDE DEL ÁREA)
    // ═══════════════════════════════════════════════════════
    
    svg.append("path")
        .datum(timeData)
        .attr("d", lineGenerator)
        .attr("stroke", "#2f81f7")  // Azul
        .attr("stroke-width", 2)     // Línea gruesa
        .attr("fill", "none");       // No rellenar
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 6: RESALTAR PERÍODO COVID (PUNTOS ROJOS)
    // ═══════════════════════════════════════════════════════
    
    // Filtrar solo los años marcados como "Coronavirus Impact"
    const covidData = timeData.filter(d => d.status === "Coronavirus Impact");
    // covidData = [{year: 2020, value: 12000, status: "COVID"}, ...]
    
    // Crear puntos rojos para estos años
    svg.selectAll(".covid-point")
        .data(covidData)
        .join("circle")
        .attr("class", "covid-point")
        .attr("cx", d => xScale(d.year))      // Centro X
        .attr("cy", d => yScale(d.value))     // Centro Y
        .attr("r", 4)                          // Radio 4 píxeles
        .attr("fill", "#ff0000")               // ROJO
        .attr("opacity", 0.7);
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 7: AGREGAR EJES
    // ═══════════════════════════════════════════════════════
    
    // Eje X (años)
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format("d"));  // Formato: números enteros (2013, 2014, ...)
    
    // Eje Y (cantidad)
    const yAxis = d3.axisLeft(yScale)
        .tickFormat(d3.format(",.0f"));  // Formato: números con comas (0, 50,000, 100,000, ...)
    
    // Dibujar eje X (trasladado al fondo)
    svg.append("g")
        .attr("transform", `translate(0,${height})`)  // Mover al fondo
        .call(xAxis);  // Dibujar eje
    
    // Dibujar eje Y (ya está a la izquierda por defecto)
    svg.append("g")
        .call(yAxis);
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 8: AGREGAR BRUSH (SELECTOR GRIS)
    // ═══════════════════════════════════════════════════════
    
    // El brush permite seleccionar un rango con el mouse
    const brush = d3.brushX()
        .extent([[0, 0], [width, height]])  // Área seleccionable
        .on("brush", function(event) {
            
            if (event.selection) {
                // event.selection = [x0, x1] en píxeles
                const [x0, x1] = event.selection;
                
                // Convertir píxeles a años usando escala inversa
                const yearRange = [
                    xScale.invert(x0),  // Pixel x0 → qué año?
                    xScale.invert(x1)   // Pixel x1 → qué año?
                ];
                
                // Guardar en estado global (para que otros gráficos sepan)
                globalState.selectedYearRange = yearRange;
                
                // RE-RENDERIZAR otros gráficos con este filtro
                // (Omitido en este código, pero sucede en la práctica)
            }
        });
    
    // Crear grupo para el brush y activarlo
    svg.append("g")
        .attr("class", "brush")
        .call(brush)
        .select(".overlay")  // El fondo transparente del brush
        .attr("fill", "#666")  // Color gris
        .attr("opacity", 0.1)  // Muy transparente
        .attr("cursor", "ns-resize");  // Cursor de resize
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 9: AGREGAR PLAY BUTTON (ANIMACIÓN)
    // ═══════════════════════════════════════════════════════
    
    let linePlayInterval = null;  // Variable global para control
    
    d3.select("#linePlay")
        .on("click", function() {
            
            // Inicializar contador de años
            let idx = 0;
            
            // Cambiar texto del botón
            d3.select(this).text("⏸ Pausar");
            
            // Cada 650ms, avanzar al siguiente año
            linePlayInterval = setInterval(() => {
                
                if (idx >= timeData.length) {
                    // Cuando llegamos al final, detener
                    clearInterval(linePlayInterval);
                    d3.select("#linePlay").text("▶ Reproducir");
                    return;
                }
                
                // Obtener el año actual
                const currentYear = timeData[idx].year;
                const currentValue = timeData[idx].value;
                
                // Mostrar texto flotante: "2020: 12,000 millionaires"
                svg.append("text")
                    .attr("x", width / 2)
                    .attr("y", 50)
                    .attr("text-anchor", "middle")
                    .attr("fill", "#fff")
                    .attr("font-size", "18px")
                    .attr("font-weight", "bold")
                    .text(`${currentYear}: ${fmt(currentValue)}`)
                    
                    // Animar: aparecer y desvanecerse
                    .transition()
                    .duration(600)  // 600ms para desvanecerse
                    .attr("opacity", 0)
                    .remove();  // Eliminar el elemento después
                
                // Avanzar al siguiente año
                idx++;
                
            }, 650);  // Intervalo: 650ms
        });
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 10: AGREGAR BOTÓN RESET
    // ═══════════════════════════════════════════════════════
    
    d3.select("#lineReset")
        .on("click", function() {
            // Detener animación si está en curso
            if (linePlayInterval) {
                clearInterval(linePlayInterval);
                linePlayInterval = null;
            }
            
            // Resetear estado global (sin filtro de años)
            globalState.selectedYearRange = null;
            
            // Restaurar botón play
            d3.select("#linePlay").text("▶ Reproducir");
            
            // Re-renderizar todo
            renderMap(globalState.allData.worldData, globalState.allData.migrationData);
            renderRadar(globalState.allData.radarData);
        });
}
```

---

# 5. RADAR MULTIDIMENSIONAL

## Código: Comparar países en múltiples dimensiones

```javascript
/**
 * FUNCIÓN: renderRadar()
 * Dibuja gráfico de radar (polígono circular)
 * 4 ejes = 4 dimensiones diferentes
 * Hasta 4 países para comparar
 */

function renderRadar(radarData) {
    
    // ═══════════════════════════════════════════════════════
    // PASO 1: EXTRAER PAÍSES SELECCIONADOS
    // ═══════════════════════════════════════════════════════
    
    // Obtener países del dropdown de multi-select
    const selectedOptions = d3.select("#radarSelect")
        .selectAll("option:checked")  // Opciones marcadas
        .nodes()  // Convertir a array
        .map(option => option.value);  // Extraer valores
    
    // Si no hay selección, elegir top 4 por crecimiento
    let selectedCountries = selectedOptions;
    if (selectedCountries.length === 0) {
        selectedCountries = radarData
            .sort((a, b) => b.growth - a.growth)  // Ordenar por crecimiento DESC
            .slice(0, 4)  // Top 4
            .map(d => d.country);
    }
    
    // Filtrar datos para países seleccionados
    const filteredData = radarData.filter(d => selectedCountries.includes(d.country));
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 2: DEFINIR LAS 4 DIMENSIONES
    // ═══════════════════════════════════════════════════════
    
    const dimensions = [
        {
            key: "growth",           // Nombre interno
            label: "Growth %",        // Etiqueta en gráfico
            angle: 0,                 // Posición: arriba (0 radianes)
            max: 200                  // Máximo valor (para normalizar)
        },
        {
            key: "millionaires",      // Total de millonarios
            label: "Millionaires",
            angle: Math.PI / 2,       // Derecha (π/2 radianes)
            max: 1000000              // 1 millón
        },
        {
            key: "centi",             // Centi-millonarios
            label: "Centi-millionaires",
            angle: Math.PI,           // Abajo (π radianes)
            max: 150000               // 150k
        },
        {
            key: "billionaires",      // Billonarios
            label: "Billionaires",
            angle: (3 * Math.PI) / 2, // Izquierda (3π/2 radianes)
            max: 1000                 // 1000
        }
    ];
    
    // Cada eje se posiciona en un ángulo distinto, formando cuadrado
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 3: CREAR ESCALAS RADIALES
    // ═══════════════════════════════════════════════════════
    
    const radius = 150;  // Distancia desde centro al borde
    
    // Escala lineal: valor → distancia desde centro
    const radialScale = d3.scaleLinear()
        .domain([0, 100])  // Rango normalizado 0-100
        .range([0, radius]);  // A píxeles 0-150
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 4: CREAR SVG CENTRADO
    // ═══════════════════════════════════════════════════════
    
    const svg = d3.select("#radar-container")
        .html("")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    
    // Grupo principal, centrado en el medio
    const g = svg.append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);
    // Ahora (0,0) = centro del gráfico
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 5: DIBUJAR GRID CIRCULAR (LÍNEAS DE FONDO)
    // ═══════════════════════════════════════════════════════
    
    // Líneas concéntricas (cada 25% de distancia)
    for (let i = 1; i <= 4; i++) {
        // i = 1, 2, 3, 4
        const currentRadius = (radius / 4) * i;
        
        // Dibujar círculo
        g.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", currentRadius)
            .attr("fill", "none")
            .attr("stroke", "#30363d")  // Gris oscuro
            .attr("stroke-width", 1)
            .attr("opacity", 0.3);
        
        // Etiqueta con porcentaje (25%, 50%, 75%, 100%)
        g.append("text")
            .attr("x", 5)
            .attr("y", -currentRadius)
            .attr("text-anchor", "start")
            .attr("fill", "#a4b1c0")  // Gris claro
            .attr("font-size", "10px")
            .text(`${(i * 25)}%`);
    }
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 6: DIBUJAR EJES (LÍNEAS RADIALES)
    // ═══════════════════════════════════════════════════════
    
    // Para cada dimensión, dibujar una línea del centro hacia afuera
    dimensions.forEach(dim => {
        // Convertir ángulo + radio a coordenadas cartesianas
        const x = radius * Math.cos(dim.angle - Math.PI / 2);  // -π/2 porque 0° es arriba
        const y = radius * Math.sin(dim.angle - Math.PI / 2);
        
        // Línea del centro (0,0) al borde
        g.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", x)
            .attr("y2", y)
            .attr("stroke", "#30363d")
            .attr("stroke-width", 1);
        
        // Etiqueta de la dimensión
        g.append("text")
            .attr("x", x * 1.15)  // Un poco más allá del borde
            .attr("y", y * 1.15)
            .attr("text-anchor", "middle")
            .attr("fill", "#e6edf3")
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .text(dim.label);
    });
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 7: DEFINIR COLORES PARA PAÍSES
    // ═══════════════════════════════════════════════════════
    
    const colors = ["#2f81f7", "#f85149", "#2ea043", "#ffa500"];  // Azul, Rojo, Verde, Naranja
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 8: DIBUJAR POLÍGONOS PARA CADA PAÍS
    // ═══════════════════════════════════════════════════════
    
    filteredData.forEach((countryData, countryIdx) => {
        // Para cada país seleccionado:
        
        // 1. Crear puntos (uno por dimensión)
        const points = dimensions.map(dim => {
            // Obtener valor de esta dimensión para este país
            const value = countryData[dim.key];
            
            // Normalizar a 0-100 (porcentaje del máximo)
            const normalized = (value / dim.max) * 100;
            
            // Convertir a distancia radial
            const r = radialScale(normalized);
            
            // Convertir a coordenadas cartesianas
            const x = r * Math.cos(dim.angle - Math.PI / 2);
            const y = r * Math.sin(dim.angle - Math.PI / 2);
            
            return [x, y];
        });
        
        // 2. Crear generador de línea/área
        const lineGenerator = d3.line();
        
        // 3. Cerrar el polígono (añadir primer punto al final)
        const closedPoints = [...points, points[0]];
        
        // 4. Dibujar polígono relleno
        g.append("path")
            .attr("d", lineGenerator(closedPoints))
            .attr("fill", colors[countryIdx % colors.length])
            .attr("fill-opacity", 0.25)
            .attr("stroke", colors[countryIdx % colors.length])
            .attr("stroke-width", 2)
            .attr("class", `radar-path-${countryIdx}`);
        
        // 5. Dibujar puntos circulares en los vértices
        closedPoints.slice(0, -1).forEach(([x, y]) => {
            g.append("circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", 3)
                .attr("fill", colors[countryIdx % colors.length]);
        });
    });
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 9: AGREGAR LEYENDA
    // ═══════════════════════════════════════════════════════
    
    // Posicionar leyenda en la esquina superior derecha
    const legendX = width / 2 - 150;
    const legendY = -height / 2 + 20;
    
    const legend = g.append("g")
        .attr("transform", `translate(${legendX},${legendY})`);
    
    // Rectángulo de fondo
    legend.append("rect")
        .attr("width", 180)
        .attr("height", filteredData.length * 25 + 10)
        .attr("fill", "#161b22")
        .attr("stroke", "#30363d")
        .attr("rx", 4);
    
    // Entrada para cada país
    filteredData.forEach((d, i) => {
        const legendItem = legend.append("g")
            .attr("transform", `translate(10,${10 + i * 25})`);
        
        // Cuadrado de color
        legendItem.append("rect")
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", colors[i % colors.length]);
        
        // Nombre del país
        legendItem.append("text")
            .attr("x", 20)
            .attr("y", 10)
            .attr("fill", "#e6edf3")
            .attr("font-size", "12px")
            .text(d.country);
    });
}
```

---

# 6. BUBBLE CHART (BONUS)

## Código: Simulación de fuerzas

```javascript
/**
 * FUNCIÓN: renderBubbleChart()
 * Burbujas que se mueven para no solaparse
 * Usa simulación física D3 (Force Simulation)
 * BONUS: No era requisito pero agregamos valor
 */

function renderBubbleChart(cityData, radarData) {
    
    // ═══════════════════════════════════════════════════════
    // PASO 1: PREPARAR DATOS
    // ═══════════════════════════════════════════════════════
    
    // Para este gráfico bonus, usamos ciudades
    // Cada burbuja = una ciudad, tamaño = centi-millonarios
    const bubbleData = cityData.slice(0, 20);  // Top 20 ciudades (no todas 50)
    
    // Mapear países a colores
    const countryColors = d3.scaleOrdinal()
        .domain(bubbleData.map(d => d.country).filter((v, i, a) => a.indexOf(v) === i))
        .range(d3.schemeTableau10);
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 2: CREAR SVG
    // ═══════════════════════════════════════════════════════
    
    const svg = d3.select("#bubble-container")
        .html("")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 3: CREAR SIMULACIÓN DE FUERZAS
    // ═══════════════════════════════════════════════════════
    
    // Escala para radio de burbujas
    const radiusScale = d3.scaleSqrt()
        .domain([0, d3.max(bubbleData, d => d.centi)])
        .range([5, 50]);  // Radio mínimo 5, máximo 50 píxeles
    
    
    // Crear simulación
    const simulation = d3.forceSimulation(bubbleData)
        
        // Fuerza 1: Hacia el centro horizontal
        .force("x", d3.forceX(width / 2).strength(0.05))
        // Cada burbuja es atraída hacia x=410 (centro)
        // strength = qué tan fuerte es la atracción (0-1)
        
        // Fuerza 2: Hacia el centro vertical
        .force("y", d3.forceY(height / 2).strength(0.05))
        // Cada burbuja es atraída hacia y=230 (centro)
        
        // Fuerza 3: REPULSIÓN (lo más importante)
        .force("collide", d3.forceCollide(d => {
            // Cada burbuja repele a otras si se acercan demasiado
            // Radio de repulsión = radio visual + 1px de margen
            return radiusScale(d.centi) + 1;
        }))
        // Si dos burbujas intentan solaparse, se empujan mutuamente
        // Esto hace que se organicen automáticamente
        
        // Fuerza 4 (opcional): Amortiguación
        .alphaDecay(0.02)  // Desaceleración gradual (para que se estabilice)
        .alphaMin(0.001);  // Velocidad mínima antes de parar
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 4: DIBUJAR BURBUJAS
    // ═══════════════════════════════════════════════════════
    
    const circles = svg.selectAll("circle")
        .data(bubbleData, d => d.city)  // Clave: nombre de ciudad (para actualización)
        .join("circle")
        .attr("r", d => radiusScale(d.centi))  // Radio proporcional a centi-millonarios
        .attr("fill", d => countryColors(d.country))  // Color por país
        .attr("opacity", 0.7)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5);
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 5: AGREGAR ETIQUETAS
    // ═══════════════════════════════════════════════════════
    
    const labels = svg.selectAll("text")
        .data(bubbleData, d => d.city)
        .join("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")  // Centrado verticalmente
        .attr("font-size", "11px")
        .attr("font-weight", "bold")
        .attr("fill", "#fff")
        .attr("pointer-events", "none")  // No interfiere con mouse
        .text(d => {
            // Mostrar nombre de ciudad (cortado si es muy largo)
            if (d.city.length > 12) {
                return d.city.substring(0, 10) + "...";
            }
            return d.city;
        });
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 6: CONECTAR SIMULACIÓN A VISUALIZACIÓN
    // ═══════════════════════════════════════════════════════
    
    // Cada frame de la simulación (60 fps), actualizar posiciones
    simulation.on("tick", () => {
        // Actualizar posición de cada burbuja
        circles
            .attr("cx", d => d.x)  // Posición X calculada por simulación
            .attr("cy", d => d.y);  // Posición Y calculada por simulación
        
        // Actualizar posición de cada etiqueta
        labels
            .attr("x", d => d.x)
            .attr("y", d => d.y);
    });
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 7: AGREGAR INTERACTIVIDAD
    // ═══════════════════════════════════════════════════════
    
    circles.on("mouseover", function(event, d) {
        // Al pasar mouse sobre una burbuja:
        
        // Resaltar esta burbuja
        d3.select(this)
            .transition()
            .duration(200)
            .attr("opacity", 1)  // Más opaca
            .attr("stroke-width", 3);  // Borde más grueso
        
        // Oscurecer otras burbujas
        circles
            .attr("opacity", dd => dd === d ? 1 : 0.3);
        
        // Mostrar tooltip
        tooltip
            .style("visibility", "visible")
            .html(`
                <strong>${d.city}</strong><br/>
                País: ${d.country}<br/>
                Centi-millionaires: ${fmt(d.centi)}
            `);
    })
    .on("mousemove", function(event) {
        tooltip
            .style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", function() {
        // Restaurar opacidad de todas
        circles.attr("opacity", 0.7).attr("stroke-width", 1.5);
        tooltip.style("visibility", "hidden");
    });
    
    
    // ═══════════════════════════════════════════════════════
    // PASO 8 (BONUS): DRAG (ARRASTRAR)
    // ═══════════════════════════════════════════════════════
    
    // Opcional: permitir al usuario arrastrar burbujas
    const drag = d3.drag()
        .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;  // Fijar X mientras se arrastra
            d.fy = d.y;  // Fijar Y mientras se arrastra
        })
        .on("drag", (event, d) => {
            d.fx = event.x;  // Nueva X del mouse
            d.fy = event.y;  // Nueva Y del mouse
        })
        .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;  // Soltar la burbuja
            d.fy = null;
        });
    
    circles.call(drag);
}
```

---

# RESUMEN: PATRONES CLAVE EN TODO EL CÓDIGO

## 1. Selección y Vinculación de Datos

```javascript
svg.selectAll("rect")
    .data(dataArray)
    .join("rect");
// .selectAll() = buscar todos (crea empty selection si no existen)
// .data() = vincular datos
// .join() = crear, actualizar o eliminar elementos según los datos
```

## 2. Escalas (La herramienta más importante de D3)

```javascript
// Escala = función que mapea valores a píxeles
const scale = d3.scaleLinear()
    .domain([0, 100])      // Rango de entrada
    .range([0, width]);    // Rango de salida

scale(50) → width/2  // Convierte 50 a píxeles
```

## 3. Transiciones Suaves

```javascript
d3.select("rect")
    .transition()          // Iniciar transición
    .duration(500)         // En 500ms
    .attr("x", 100);       // Animar hacia x=100
```

## 4. Eventos y Sincronización

```javascript
d3.select("#input")
    .on("change", function() {
        // Cuando cambia el input:
        globalState.value = this.value;  // Guardar estado
        renderAll();  // Re-renderizar todo
    });
```

---

**¡Ahora entiendes cómo funciona cada línea de nuestro dashboard!** 🎉
