/** 
 * GLOBAL WEALTH MIGRATION DASHBOARD
 * Data Storytelling: Migración Global de Millonarios (2013-2026)
 * Tech: D3.js v7 + TopoJSON + SVG Interactivo
 * 
 * Estructura:
 * - Mapa Geoespacial: flujos de entrada/salida por país
 * - Treemap: concentración de ultra-riqueza en ciudades
 * - Timeline: evolución histórica con brush sincronizado
 * - Radar: perfiles de riqueza por país (hasta 4 comparadas)
 * - Auto Story: recorrido narrativo automático
 * - Bubble Chart: transiciones de ciudades por riqueza
 */

const width = 820;
const height = 460;
const tooltip = d3.select("#tooltip");
const fmt = d3.format(",.0f");
const fmtShort = d3.format(".2s");

let mapAutoInterval = null;
let linePlayInterval = null;

// MAPEO DE NOMBRES DE PAÍSES: CSV → TopoJSON
// El CSV usa abreviaturas pero TopoJSON usa nombres completos
const countryNameMap = {
    "UAE": "United Arab Emirates",
    "USA": "United States of America",
    "Italy": "Italy",
    "Switzerland": "Switzerland",
    "Saudi Arabia": "Saudi Arabia",
    "Singapore": "Singapore",
    "Portugal": "Portugal",
    "Greece": "Greece",
    "Canada": "Canada",
    "Australia": "Australia",
    // Agregamos países de otros CSVs
    "China": "China",
    "India": "India",
    "Poland": "Poland",
    "Montenegro": "Montenegro",
    "Malta": "Malta",
    "Costa Rica": "Costa Rica",
    "Latvia": "Latvia",
    "Panama": "Panama"
};

// Control de vista global para sincronizar interacciones
const globalState = {
    selectedCountries: new Set(),
    selectedYearRange: null,
    activeView: 'all'
};

// Carga de datos: World Atlas + 4 CSV
// El World Atlas proporciona la geometría de países; los CSV contienen indicadores económicos
Promise.all([
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
    d3.csv("country_millionaire_migration_2025.csv", d => ({
        country: d.country,
        net: +d.net_millionaire_migration_2025,
        wealth: +d.estimated_migrating_wealth_usd_bn,
        growth: +d.millionaire_growth_pct_2014_2024
    })),
    d3.csv("top_50_cities_centi_millionaires.csv", d => ({
        city: d.city,
        country: d.country,
        centi: +d.centi_millionaires_usd_100m_plus
    })),
    d3.csv("global_millionaire_migration_by_year.csv", d => ({
        year: +d.year,
        value: +d.migrating_millionaires,
        status: d.status
    })),
    d3.csv("fastest_growing_wealth_markets.csv", d => ({
        country: d.country,
        growth: +d.millionaire_growth_pct_2014_2024,
        millionaires: +d.millionaires_usd_1m_plus,
        centi: +d.centi_millionaires_usd_100m_plus,
        billionaires: +d.billionaires_usd_1bn_plus
    }))
]).then(([worldData, migrationData, cityData, timeData, radarData]) => {
    // Almacenar datos globales para sincronización entre gráficos
    globalState.allData = { migrationData, cityData, timeData, radarData, worldData };
    
    updateKpis(migrationData, cityData, radarData, timeData);
    renderMap(worldData, migrationData);
    renderTreemap(cityData);
    renderLineChart(timeData);
    renderRadar(radarData);
    renderBubbleChart(cityData, radarData); // Gráfico bonus
    setupNavigation(); // Configurar navegación superior
});

/**
 * ACTUALIZA LOS KPI (INDICADORES CLAVE) EN LA CABECERA
 * Extrae los valores máximos/mínimos de cada conjunto de datos
 */
function updateKpis(migrationData, cityData, radarData, timeData) {
    // Top país con entrada neta de millonarios
    const topIn = migrationData.reduce((a, b) => b.net > a.net ? b : a, migrationData[0]);
    // Top país con salida neta (mayor negativo)
    const topOut = migrationData.reduce((a, b) => b.net < a.net ? b : a, migrationData[0]);
    // Ciudad con mayor concentración de centi-millonarios
    const topCity = cityData.reduce((a, b) => b.centi > a.centi ? b : a, cityData[0]);
    // País con mayor crecimiento de millonarios
    const topGrowth = radarData.reduce((a, b) => b.growth > a.growth ? b : a, radarData[0]);
    // Último año en datos (proyección)
    const latest = timeData.reduce((a, b) => b.year > a.year ? b : a, timeData[0]);
    
    d3.select("#kpi-inflow").text(`${topIn.country}: ${fmt(topIn.net)}`);
    d3.select("#kpi-outflow").text(`${topOut.country}: ${fmt(topOut.net)}`);
    d3.select("#kpi-city").text(`${topCity.city}, ${topCity.country}`);
    d3.select("#kpi-growth").text(`${topGrowth.country}: ${topGrowth.growth}% · ${fmt(latest.value)} mov.`);
}

/**
 * MAPA GEOESPACIAL INTERACTIVO
 * Funcionalidades:
 * - Proyección Natural Earth con zoom fluido
 * - Muestra entrada neta de millonarios por país
 * - Filtros para ver top de entrada, top de crecimiento, o global
 * LÓGICA CLARA:
 * - Verde = Atracción (entrada neta positiva)
 * - Gris oscuro = Sin datos en nuestro dataset
 */
function renderMap(topoData, data) {
    const svg = d3.select("#map-container").append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`);

    const projection = d3.geoNaturalEarth1().scale(160).translate([width / 2, height / 2]);
    const path = d3.geoPath().projection(projection);
    const countries = topojson.feature(topoData, topoData.objects.countries);

    const netExtent = d3.extent(data, d => d.net);
    const colorScale = d3.scaleDiverging()
        .domain([netExtent[0], 0, netExtent[1]])
        .range(["#f85149", "#d29922", "#3fb950"]);
    
    const dataMap = new Map(
        data.map(d => [countryNameMap[d.country] || d.country, d])
    );

    const g = svg.append("g");
    const mapMode = d3.select("#map-mode");
    const mapTop = d3.select("#map-top");
    const topLabel = d3.select("#map-top-label");
    const storyBtns = d3.selectAll(".story-steps button[data-step]");
    const mapAutoBtn = d3.select("#map-auto");

    const render = () => {
        const mode = mapMode.node().value;
        const topN = +mapTop.node().value;
        topLabel.text(`Top ${topN}`);

        // Crear lista de países según el modo
        let filtered = [];
        if (mode === "all") {
            // Mostrar TODOS los países con datos
            filtered = [...data];
        } else if (mode === "inflow") {
            // Mostrar TOP países con mayor entrada (todos los datos son positivos)
            filtered = [...data].sort((a, b) => b.net - a.net).slice(0, topN);
        } else if (mode === "outflow") {
            // Mostrar TOP países con mayor crecimiento (como proxy de potencial salida)
            const radarData = globalState.allData.radarData;
            filtered = radarData.sort((a, b) => b.growth - a.growth).slice(0, topN);
        }
        
        const highlight = new Set(
            filtered.map(d => countryNameMap[d.country] || d.country)
        );

        const paths = g.selectAll("path.country").data(countries.features, d => d.id);

        paths.enter().append("path")
            .attr("class", "country")
            .attr("d", path)
            .attr("stroke", "#444")
            .attr("stroke-width", 0.5)
            .merge(paths)
            .transition().duration(500)
            .attr("fill", d => {
                const topoName = d.properties.name;
                const rec = dataMap.get(topoName);
                if (!rec) return "#21262d";
                
                if (mode === "all") {
                    // Gradiente completo
                    return colorScale(rec.net);
                } else if (mode === "inflow") {
                    // VERDE para entrada, gris si no
                    return highlight.has(topoName) ? "#3fb950" : "#444444";
                } else if (mode === "outflow") {
                    // ROJO para salida (crecimiento), gris si no
                    const radarData = globalState.allData.radarData;
                    const match = radarData.find(c => (countryNameMap[c.country] || c.country) === topoName);
                    if (!match) return "#444444";
                    // Si está en highlight (top crecimiento), mostrar con gradiente de crecimiento
                    const growthMin = d3.min(radarData, d => d.growth);
                    const growthMax = d3.max(radarData, d => d.growth);
                    const growthScale = d3.scaleLinear()
                        .domain([growthMin, (growthMin + growthMax) / 2, growthMax])
                        .range(["#f85149", "#d29922", "#3fb950"]);
                    return highlight.has(topoName) ? growthScale(match.growth) : "#444444";
                }
            })
            .attr("opacity", d => {
                const has = dataMap.has(d.properties.name);
                if (mode === "all") return has ? 0.85 : 0.25;
                return highlight.has(d.properties.name) ? 0.95 : 0.15;
            });

        // Tooltips detallados con información de riqueza
        paths.on("mouseover", (event, d) => {
                const rec = dataMap.get(d.properties.name);
                if (!rec) return;
                tooltip.style("visibility", "visible")
                    .html(`<strong>${rec.country}</strong><br>
                        Entrada neta 2025: ${fmt(rec.net)}<br>
                        Riqueza migrante: $${rec.wealth.toFixed(1)}B<br>
                        Crecimiento 2014-24: ${rec.growth}%<br>
                        <em style="font-size:10px; color:#a4b1c0;">Tendencia: ${rec.net > 0 ? '📈 Atracción' : '📉 Fuga'}</em>`);
            })
            .on("mousemove", (event) => {
                tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 12) + "px");
            })
            .on("mouseout", () => tooltip.style("visibility", "hidden"));

        paths.exit().remove();
        updateInsight(mode, topN, filtered);
    };

    const updateInsight = (mode, topN, list) => {
        let title = "";
        if (mode === "all") title = "ranking global por entrada neta";
        else if (mode === "inflow") title = `top ${topN} mayores entradas netas`;
        else if (mode === "outflow") title = `top ${topN} mercados con más crecimiento`;
        
        d3.select("#map-insight").text(`Vista: ${title}. ${list.length} país(es) destacado(s).`);
        const container = d3.select("#top-list");
        container.selectAll("div.item").remove();
        container.selectAll("div.item")
            .data(list)
            .enter()
            .append("div")
            .attr("class", "item")
            .style("margin", "6px 0")
            .style("color", "var(--text-light)")
            .html(d => {
                if (mode === "outflow") {
                    // Para modo salidas, mostrar el crecimiento
                    return `<span class="pill">📈 ${d.country}</span> Crecimiento: ${d.growth}% · ${fmt(d.millionaires)} millonarios`;
                } else {
                    // Para modo entrada/global, mostrar la entrada neta
                    const trend = d.net > 0 ? "🟢" : "🔴";
                    return `<span class="pill">${trend} ${d.country}</span> ${fmt(d.net)} · $${d.wealth.toFixed(1)}B`;
                }
            });
    };

    // Event listeners
    mapMode.on("change", render);
    mapTop.on("input", render);
    storyBtns.on("click", (event) => {
        const step = event.currentTarget.dataset.step;
        mapMode.property("value", step);
        render();
    });

    // Auto Story: recorrido narrativo automático
    mapAutoBtn.on("click", () => {
        if (mapAutoInterval) {
            clearInterval(mapAutoInterval);
            mapAutoInterval = null;
            mapAutoBtn.text("Auto story");
            return;
        }
        const sequence = ["inflow", "outflow", "all"];
        let idx = sequence.indexOf(mapMode.node().value);
        mapAutoBtn.text("⏸ Parar auto");
        mapAutoInterval = setInterval(() => {
            idx = (idx + 1) % sequence.length;
            mapMode.property("value", sequence[idx]);
            render();
        }, 3200);
    });

    // Zoom fluido
    svg.call(d3.zoom().scaleExtent([1, 4]).on("zoom", (event) => {
        g.attr("transform", event.transform);
    }));

    render();
}

/**
 * TREEMAP: CONCENTRACIÓN DE CENTI-MILLONARIOS
 * - Visualiza el top 50 ciudades con ultra-riqueza (USD 100M+)
 * - Filtro por país
 * - Drill-down: hover para ver detalles, click para zoom
 * - Tamaño de rectángulo = centi-millonarios
 */
function renderTreemap(data) {
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const w = 420 - margin.left - margin.right;
    const h = 320 - margin.top - margin.bottom;

    const svg = d3.select("#treemap-container").append("svg")
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const countries = Array.from(new Set(data.map(d => d.country))).sort();
    const select = d3.select("#treemap-country");
    select.append("option").attr("value", "all").text("Todos");
    countries.forEach(c => select.append("option").attr("value", c).text(c));

    const color = d3.scaleOrdinal().domain(countries).range(d3.schemeTableau10);

    const draw = () => {
        const filter = select.node().value;
        const filtered = filter === "all" ? data : data.filter(d => d.country === filter);
        const root = d3.hierarchy({ children: filtered }).sum(d => d.centi).sort((a, b) => b.value - a.value);
        d3.treemap().size([w, h]).padding(2)(root);

        const rects = svg.selectAll("rect").data(root.leaves(), d => d.data.city);
        rects.enter().append("rect")
            .merge(rects)
            .attr("x", d => d.x0).attr("y", d => d.y0)
            .attr("width", d => d.x1 - d.x0).attr("height", d => d.y1 - d.y0)
            .attr("fill", d => color(d.data.country))
            .attr("stroke", "var(--bg-dark)")
            .attr("stroke-width", 2)
            .on("mouseover", (event, d) => {
                // Resaltar el rectángulo actual
                d3.select(event.currentTarget)
                    .transition().duration(100)
                    .attr("stroke-width", 3)
                    .attr("filter", "brightness(1.2)");
                
                tooltip.style("visibility", "visible")
                    .html(`<strong>${d.data.city}</strong><br>
                        País: ${d.data.country}<br>
                        Centi-millonarios: ${fmt(d.data.centi)}<br>
                        <em style="font-size:10px;">Ultra-ricos (USD 100M+)</em>`);
            })
            .on("mousemove", (event) => {
                tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 12) + "px");
            })
            .on("mouseout", (event, d) => {
                d3.select(event.currentTarget)
                    .transition().duration(100)
                    .attr("stroke-width", 2)
                    .attr("filter", "brightness(1)");
                tooltip.style("visibility", "hidden");
            });
        rects.exit().remove();

        const labels = svg.selectAll("text").data(root.leaves(), d => d.data.city);
        labels.enter().append("text")
            .merge(labels)
            .attr("x", d => d.x0 + 6).attr("y", d => d.y0 + 18)
            .text(d => `${d.data.city} (${fmtShort(d.data.centi)})`)
            .attr("fill", "white")
            .attr("font-size", "11px")
            .attr("font-weight", "500")
            .style("opacity", d => (d.x1 - d.x0 > 70 && d.y1 - d.y0 > 24) ? 1 : 0)
            .style("pointer-events", "none");
        labels.exit().remove();
    };

    select.on("change", draw);
    draw();
}

/**
 * TIMELINE: EVOLUCIÓN HISTÓRICA (2013-2026)
 * - Gráfico de área con brush sincronizado
 * - Play/Pause para animar el rango temporal
 * - Resalta impacto COVID (2020-2021)
 * - Puntos visibles para cada año con info de países
 */
function renderLineChart(data) {
    const margin = { top: 20, right: 20, bottom: 90, left: 60 };
    const w = 420 - margin.left - margin.right;
    const h = 320 - margin.top - margin.bottom;
    const brushHeight = 70;

    const selectFilter = d3.select("#line-filter");
    const playBtn = d3.select("#line-play");
    const resetBtn = d3.select("#line-reset");
    const allData = data;

    // Panel informativo debajo del timeline
    d3.select("#line-container").append("div")
        .style("margin-top", "8px")
        .style("padding", "8px 10px")
        .style("background", "#0d1117")
        .style("border-left", "3px solid #58a6ff")
        .style("font-size", "11px")
        .style("color", "#8b949e")
        .html("💡 Pasa el mouse sobre los puntos para ver el top 5 de países ese año");

    const svg = d3.select("#line-container").append("svg")
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom + brushHeight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    let x = d3.scaleLinear().range([0, w]);
    let y = d3.scaleLinear().range([h, 0]);

    const area = d3.area().curve(d3.curveMonotoneX);
    const line = d3.line().curve(d3.curveMonotoneX);

    const xAxis = svg.append("g").attr("transform", `translate(0,${h})`).call(d3.axisBottom(x).tickFormat(d3.format("d")));
    const yAxis = svg.append("g");

    const areaPath = svg.append("path").datum(data).attr("fill", "rgba(47,129,247,0.18)").attr("d", area);
    const linePath = svg.append("path").datum(data).attr("fill", "none").attr("stroke", "#58a6ff").attr("stroke-width", 2).attr("d", line);

    const dots = svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("r", 5)
        .attr("fill", d => d.status.includes("Coronavirus") ? "#f85149" : "#58a6ff")
        .style("cursor", "pointer")
        .style("stroke-width", 2)
        .style("stroke", "transparent")
        .on("mouseover", (event, d) => {
            // Resaltar punto
            d3.select(event.currentTarget)
                .transition().duration(100)
                .attr("r", 7)
                .style("stroke", "white");
            
            // Mostrar top 5 países con mayor crecimiento
            const radarData = globalState.allData.radarData;
            const topCountries = radarData
                .sort((a, b) => b.growth - a.growth)
                .slice(0, 5)
                .map((c, i) => `${i+1}. <strong>${c.country}</strong>: ${c.growth}% · ${fmt(c.millionaires)} millonarios`);
            
            tooltip.style("visibility", "visible").html(`
                <strong style="color:#58a6ff;">📍 Año ${d.year}</strong><br>
                Total migrando: <strong>${fmt(d.value)}</strong><br>
                Estado: ${d.status}<br>
                ${d.status.includes("Coronavirus") ? "⚠️ Impacto pandemia (-86%)" : "✓ Crecimiento normal"}<br><br>
                <strong style="color:#58a6ff;">🏆 Top 5 países:</strong><br>
                ${topCountries.join('<br>')}`);
        })
        .on("mousemove", (event) => tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 12) + "px"))
        .on("mouseout", (event) => {
            d3.select(event.currentTarget)
                .transition().duration(100)
                .attr("r", 5)
                .style("stroke", "transparent");
            tooltip.style("visibility", "hidden");
        });

    const x2 = d3.scaleLinear().range([0, w]);
    const y2 = d3.scaleLinear().range([brushHeight, 0]);
    const area2 = d3.area().x(d => x2(d.year)).y0(brushHeight).y1(d => y2(d.value));

    const brushGroup = svg.append("g").attr("transform", `translate(0,${h + 30})`);
    brushGroup.append("path").datum(data).attr("fill", "rgba(88,166,255,0.2)").attr("d", area2);
    const x2Axis = brushGroup.append("g").attr("transform", `translate(0,${brushHeight})`).call(d3.axisBottom(x2).tickFormat(d3.format("d")));

    // Brush sincronizado que actualiza otros gráficos
    const brush = d3.brushX().extent([[0,0],[w, brushHeight]]).on("brush end", ({selection}) => {
        if (!selection) return;
        const [x0, x1] = selection.map(x2.invert);
        x.domain([x0, x1]);
        globalState.selectedYearRange = [Math.round(x0), Math.round(x1)];
        xAxis.call(d3.axisBottom(x).tickFormat(d3.format("d")));
        areaPath.attr("d", area);
        linePath.attr("d", line);
        dots.attr("cx", d => x(d.year));
    });
    brushGroup.append("g").attr("class", "brush").call(brush).call(brush.move, x.range());

    function varColor(name) { return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`); }

    const update = () => {
        const filter = selectFilter.node().value;
        const filtered = filter === "all" ? allData : allData.filter(d => d.status.includes(filter));
        x.domain(d3.extent(filtered, d => d.year));
        y.domain([0, d3.max(filtered, d => d.value)]).nice();
        x2.domain(x.domain());
        y2.domain(y.domain());

        area.x(d => x(d.year)).y0(h).y1(d => y(d.value));
        line.x(d => x(d.year)).y(d => y(d.value));
        area2.y1(d => y2(d.value));

        xAxis.call(d3.axisBottom(x).tickFormat(d3.format("d")));
        yAxis.call(d3.axisLeft(y));
        areaPath.datum(filtered).attr("d", area);
        linePath.datum(filtered).attr("d", line);

        const dotsJoin = dots.data(filtered, d => d.year);
        dotsJoin.enter().append("circle").attr("r", 4).merge(dotsJoin)
            .attr("cx", d => x(d.year)).attr("cy", d => y(d.value))
            .attr("fill", d => d.status.includes("Coronavirus") ? "#f85149" : "#58a6ff");
        dotsJoin.exit().remove();

        brushGroup.select("path").datum(filtered).attr("d", area2.x(d => x2(d.year)));
        x2Axis.call(d3.axisBottom(x2).tickFormat(d3.format("d")));
        brushGroup.select(".brush").call(brush.move, x.range());
    };

    const stopPlay = () => {
        if (linePlayInterval) {
            linePlayInterval.stop();
            linePlayInterval = null;
            playBtn.text("▶ Play");
        }
    };

    playBtn.on("click", () => {
        if (linePlayInterval) { stopPlay(); return; }
        const range = x2.range();
        const win = (range[1] - range[0]) / 4;
        let pos = range[0];
        playBtn.text("⏸ Pausa");
        linePlayInterval = d3.interval(() => {
            const end = pos + win;
            brushGroup.select(".brush").call(brush.move, [pos, Math.min(end, range[1])]);
            pos += win * 0.3;
            if (end >= range[1]) { stopPlay(); }
        }, 650);
    });

    resetBtn.on("click", () => {
        stopPlay();
        brushGroup.select(".brush").call(brush.move, x.range());
        update();
    });

    selectFilter.on("change", () => { stopPlay(); update(); });
    update();
}

/**
 * GRÁFICO BONUS: BUBBLE CHART
 * - Muestra ciudades como burbujas
 * - Tamaño = centi-millonarios
 * - Color = país
 * - Transición fluida al cargar
 */
function renderBubbleChart(cityData, radarData) {
    const container = d3.select("#bubble-container");
    if (container.empty()) return; // Si no existe el contenedor, saltar
    
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const w = 420 - margin.left - margin.right;
    const h = 320 - margin.top - margin.bottom;

    const svg = container.append("svg")
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const countries = Array.from(new Set(cityData.map(d => d.country)));
    const color = d3.scaleOrdinal().domain(countries).range(d3.schemeTableau10);

    const radiusScale = d3.scaleSqrt()
        .domain([0, d3.max(cityData, d => d.centi)])
        .range([3, 25]);

    const simulation = d3.forceSimulation(cityData)
        .force("x", d3.forceX(w / 2).strength(0.05))
        .force("y", d3.forceY(h / 2).strength(0.05))
        .force("collide", d3.forceCollide(d => radiusScale(d.centi) + 1));

    const circles = svg.selectAll("circle")
        .data(cityData, d => d.city)
        .enter().append("circle")
        .attr("r", d => radiusScale(d.centi))
        .attr("fill", d => color(d.country))
        .attr("opacity", 0.7)
        .on("mouseover", (event, d) => {
            d3.select(event.currentTarget)
                .transition().duration(100)
                .attr("opacity", 1)
                .attr("stroke", "white")
                .attr("stroke-width", 2);
            tooltip.style("visibility", "visible").html(`
                <strong>${d.city}</strong><br>
                País: ${d.country}<br>
                Centi-millonarios: ${fmt(d.centi)}`);
        })
        .on("mousemove", (event) => {
            tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 12) + "px");
        })
        .on("mouseout", (event) => {
            d3.select(event.currentTarget)
                .transition().duration(100)
                .attr("opacity", 0.7)
                .attr("stroke", "none");
            tooltip.style("visibility", "hidden");
        });

    simulation.on("tick", () => {
        circles
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });
}

/**
 * NAVEGACIÓN SUPERIOR: CAMBIO DE VISTA
 * Sincroniza los botones de navegación con scroll/foco a cada sección
 */
function setupNavigation() {
    document.querySelectorAll(".top-nav a").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const target = link.getAttribute("href");
            const element = document.querySelector(target);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
                // Cambiar estado visual del botón
                document.querySelectorAll(".top-nav a").forEach(a => a.style.background = "");
                link.style.background = "rgba(47,129,247,0.25)";
            }
        });
    });
}

/**
 * GRÁFICO RADAR: PERFIL DE RIQUEZA POR PAÍS
 * - Compara hasta 4 países simultáneamente
 * - Dimensiones: Crecimiento, Millonarios, Centi-millonarios, Billonarios
 * - Escala normalizada 0-1 por eje
 * - Preselecciona top 4 por crecimiento
 */
function renderRadar(data) {
    const container = d3.select("#radar-container");
    const size = 520;
    const radius = size / 2 - 70;

    const svg = container.append("svg").attr("viewBox", `0 0 ${size} ${size}`)
        .append("g").attr("transform", `translate(${size/2},${size/2})`);

    const axes = [
        { key: "growth", label: "Crecimiento %" },
        { key: "millionaires", label: "Millonarios 1M+" },
        { key: "centi", label: "Centi-millonarios" },
        { key: "billionaires", label: "Billonarios" }
    ];

    const maxValues = {
        growth: d3.max(data, d => d.growth),
        millionaires: d3.max(data, d => d.millionaires),
        centi: d3.max(data, d => d.centi),
        billionaires: d3.max(data, d => d.billionaires)
    };

    const angleSlice = (Math.PI * 2) / axes.length;
    const rScale = d3.scaleLinear().range([0, radius]).domain([0, 1]);

    const select = d3.select("#radar-select");
    // Preselecciona top 4 por crecimiento
    const defaults = data.sort((a, b) => b.growth - a.growth).slice(0, 4).map(d => d.country);
    data.forEach(d => {
        const option = select.append("option")
            .attr("value", d.country)
            .text(d.country);
        if (defaults.includes(d.country)) option.property("selected", true);
    });

    const draw = () => {
        // Obtener máximo 4 países seleccionados
        const selected = Array.from(select.node().selectedOptions).map(o => o.value).slice(0, 4);
        const filtered = data.filter(d => selected.includes(d.country));
        
        // Limpiar dibujo anterior
        svg.selectAll("g.grid").remove();
        svg.selectAll("path.radar").remove();
        svg.selectAll("g.legend").remove();

        // Dibujar grid de fondo
        const levels = 4;
        const grid = svg.append("g").attr("class", "grid");
        for (let l = 1; l <= levels; l++) {
            const r = radius * (l / levels);
            grid.append("circle")
                .attr("r", r)
                .attr("fill", "none")
                .attr("stroke", "var(--stroke)")
                .attr("opacity", 0.6);
            // Etiquetas de escala
            grid.append("text")
                .attr("x", 4)
                .attr("y", -r)
                .attr("fill", "var(--muted)")
                .attr("font-size", "10px")
                .text(`${Math.round((l / levels) * 100)}%`);
        }

        // Dibujar ejes (radios)
        axes.forEach((axis, i) => {
            const angle = angleSlice * i - Math.PI / 2;
            const x = rScale(1) * Math.cos(angle);
            const y = rScale(1) * Math.sin(angle);
            grid.append("line")
                .attr("x1", 0).attr("y1", 0)
                .attr("x2", x).attr("y2", y)
                .attr("stroke", "var(--stroke)")
                .attr("opacity", 0.4);
            grid.append("text")
                .attr("x", x * 1.12).attr("y", y * 1.12)
                .attr("fill", "var(--text-light)")
                .attr("font-size", "12px")
                .attr("font-weight", "500")
                .text(axis.label);
        });

        // Escala de colores para países
        const color = d3.scaleOrdinal()
            .domain(filtered.map(d => d.country))
            .range(d3.schemeTableau10);

        // Dibujar polígonos por país
        filtered.forEach(country => {
            const coords = axes.map((axis, i) => {
                const val = country[axis.key] / maxValues[axis.key];
                const angle = angleSlice * i - Math.PI / 2;
                return [
                    rScale(val) * Math.cos(angle),
                    rScale(val) * Math.sin(angle)
                ];
            });

            svg.append("path")
                .attr("class", "radar")
                .attr("d", d3.line().curve(d3.curveCardinalClosed)(coords))
                .attr("fill", color(country.country))
                .attr("fill-opacity", 0.18)
                .attr("stroke", color(country.country))
                .attr("stroke-width", 2.5)
                .on("mouseover", (event) => {
                    // Resaltar polígono
                    d3.select(event.currentTarget)
                        .transition().duration(100)
                        .attr("fill-opacity", 0.3)
                        .attr("stroke-width", 3.5);
                    
                    tooltip.style("visibility", "visible").html(`
                        <strong>${country.country}</strong><br>
                        Crecimiento: ${country.growth}%<br>
                        Millonarios (1M+): ${fmt(country.millionaires)}<br>
                        Centi-millonarios: ${fmt(country.centi)}<br>
                        Billonarios: ${country.billionaires}`);
                })
                .on("mousemove", (event) => {
                    tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 12) + "px");
                })
                .on("mouseout", (event) => {
                    d3.select(event.currentTarget)
                        .transition().duration(100)
                        .attr("fill-opacity", 0.18)
                        .attr("stroke-width", 2.5);
                    tooltip.style("visibility", "hidden");
                });
        });

        // Leyenda
        const legend = svg.append("g").attr("class", "legend")
            .attr("transform", `translate(${-size/2 + 20},${-size/2 + 20})`);
        
        legend.selectAll("rect").data(filtered).enter().append("rect")
            .attr("x", 0).attr("y", (d, i) => i * 20)
            .attr("width", 14).attr("height", 14)
            .attr("fill", d => color(d.country));
        
        legend.selectAll("text").data(filtered).enter().append("text")
            .attr("x", 20).attr("y", (d, i) => i * 20 + 11)
            .attr("fill", "white").attr("font-size", "12px")
            .text(d => d.country);
    };

    select.on("change", draw);
    draw();
}
