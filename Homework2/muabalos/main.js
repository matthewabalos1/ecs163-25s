// console.log("main.js running");

// Resources used:
//     ChatGPT
//     https://unpkg.com/d3-sankey@0.12.3/dist/d3-sankey.min.js
//     https://d3-graph-gallery.com/sankey.html
//     https://codesandbox.io/examples/package/d3-sankey
//     https://css-tricks.com/almanac/properties/b/box-shadow/ 


// Load the terrorism CSV dataset 
d3.csv("data/globalterrorismdb_0718dist.csv").then(rawData => {
    //  bar chart of top 10 countries by number of attacks
    drawBarChart(rawData);
    //  scatter plot of fatalities vs. injuries
    drawScatterPlot(rawData);
    //  Sankey diagram mapping attack types to weapon types
    drawSankeyDiagram(rawData);
  // Check for errors encountered during CSV load
  }).catch(error => {
    console.error("Failed to load CSV:", error);
  });


// Draw a bar chart of top 10 countries by number of terrorist attacks
function drawBarChart(data) {
        // Check the bar chart container exists before drawing
        if (d3.select("#bar-chart").empty()) {
            console.error("The #bar-chart div is missing from the HTML.");
            return;
        }

        // Aggregate and count number of attacks by country
        // Sort descending and select top 10 countries
        const countryCounts = d3.nest()
            .key(d => d.country_txt)
            .rollup(v => v.length)
            .entries(data)
            .map(d => [d.key, d.value])
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        // Define the dimensions and margins
        const margin = { top: 40, right: 20, bottom: 70, left: 100 },
        width = 800 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

  // Create SVG container and apply margin transform
  const svg = d3.select("#bar-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // Set X and Y axis scales
  const x = d3.scaleBand()
      .domain(countryCounts.map(d => d[0]))
      .range([0, width])
      .padding(0.2);

  const y = d3.scaleLinear()
      .domain([0, d3.max(countryCounts, d => d[1])])
      .nice()
      .range([height, 0]);

  // Set X and Y axes with appropriate transformations
  svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

  svg.append("g")
      .call(d3.axisLeft(y));

  // Add Y-axis label
  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -70)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Number of Attacks");

  // Add X-axis label
  svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 50)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Country");

  // Create and render bars for each country count
  svg.selectAll(".bar")
      .data(countryCounts)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d[0]))
      .attr("y", d => y(d[1]))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d[1]))
      .attr("fill", "steelblue");

  // Add chart title text
  svg.append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .text("Top 10 Countries by Number of Terrorist Attacks");
}


// Draw a scatter plot comparing fatalities (nkill) and injuries (nwound)
function drawScatterPlot(data) {
    // Define SVG dimensions and margins for scatter plot
    const svgWidth = 600, svgHeight = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    // Filter data to include only entries with numeric nkill and nwound values
    const filteredData = data.filter(d =>
        !isNaN(+d.nkill) && !isNaN(+d.nwound)
    );

    // Create SVG container and group element with margin transform
    const svg = d3.select("#scatter-plot")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define X scale for fatalities (nkill) with nice rounding
    const x = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => +d.nkill)])
        .nice()
        .range([0, width]);

    // Define Y scale for injuries (nwound) with nice rounding
    const y = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => +d.nwound)])
        .nice()
        .range([height, 0]);

    // Add X axis at bottom of plot area
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    // Add Y axis at left of plot area
    svg.append("g")
        .call(d3.axisLeft(y));

    // Set up gradient color scale based on number of fatalities (nkill)
    const colorMax = d3.max(filteredData, d => +d.nkill);
    // Reverse the color scale: darker blue at low values, lighter at high
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([colorMax * 1.2, 0]);

    // Create circles for each data point positioned by fatalities and injuries
    svg.selectAll("circle")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("cx", d => x(+d.nkill))
        .attr("cy", d => y(+d.nwound))
        .attr("r", 3)
        .style("fill", d => colorScale(+d.nkill))
        .style("opacity", 0.7);

    // Add title text above scatter plot
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("font-size", "13px")
        .text("Fatalities vs Injuries (Scatter Plot)");

    // Add X axis label below axis
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("Fatalities (nkill)");

    // Add Y axis label rotated vertically
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -40)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("Injuries (nwound)");

    // DDimensions for color legend
    const legendWidth = 200, legendHeight = 10;
    // Add defs element to SVG for gradient definition
    const defs = svg.append("defs");
    // Linear gradient for legend
    const linearGradient = defs.append("linearGradient")
        .attr("id", "legend-gradient");

    // Gradientfrom 0 to 1 in 0.1 increments, reversing blues scale
    linearGradient.selectAll("stop")
        .data(d3.range(0, 1.01, 0.1))
        .enter()
        .append("stop")
        .attr("offset", d => d)
        .attr("stop-color", d => d3.interpolateBlues(1 - d));

    // Add rectangle filled with gradient as legend
    svg.append("rect")
        .attr("x", width - legendWidth)
        .attr("y", height + 50)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)");

    // Define scale for legend axis matching color scale domain
    const legendScale = d3.scaleLinear()
        .domain([colorMax * 1.2, 0])
        .range([0, legendWidth]);

    // Create bottom axis for legend with ticks formatted as integers
    const legendAxis = d3.axisBottom(legendScale)
        .ticks(5)
        .tickFormat(d3.format(".0f"));

    // Add legend axis below gradient rectangle
    svg.append("g")
        .attr("transform", `translate(${width - legendWidth}, ${height + 60})`)
        .call(legendAxis);

    // Add label text above legend
    svg.append("text")
        .attr("x", width - legendWidth)
        .attr("y", height + 45)
        .attr("font-size", "10px")
        .text("Fatalities (Blue Gradient)");
}


// Draw a Sankey diagram mapping attack types to weapon types, with abbreviations and filters
function drawSankeyDiagram(data) {
    // Define SVG dimensions for Sankey diagram
    const svgWidth = 800, svgHeight = 600;
    // Create SVG container for Sankey diagram with margin above
    const svg = d3.select("#sankey-diagram")
        .append("svg")
        .style("margin-top", "10px")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // Add title text above Sankey diagram
    svg.append("text")
        .attr("x", svgWidth / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text("Attack Types to Weapon Types (Sankey Diagram)");

    // Initialize Sankey generator with node width, padding, and extent
    const sankey = d3.sankey()
        .nodeWidth(20)
        .nodePadding(40)
        .extent([[1, 1], [svgWidth - 1, svgHeight - 1]]);

    // Aggregate data by attack type and weapon type, counting occurrences
    const attackToWeapon = d3.nest()
        .key(d => d.attacktype1_txt)
        .key(d => d.weaptype1_txt)
        .rollup(v => v.length)
        .entries(data);

    // Prepare maps and arrays for nodes and links
    const nodes = new Map();
    const links = [];

    // Define common weapon types to keep, others grouped as "Other"
    const commonWeapons = new Set(["Explosives", "Firearms", "Incendiary", "Melee", "Chemical", "Unknown"]);
    // Define abbreviations for long attack or weapon type names
    const abbreviations = {
      "Facility/Infrastructure Attack": "Infra Attack",
      "Vehicle (not to include vehicle-borne explosives, i.e., car or truck bombs)": "Vehicle (No Bombs)",
      "Hostage Taking (Barricade Incident)": "Barricade Hostage",
      "Hostage Taking (Kidnapping)": "Kidnapping"
    };

    // Iterate over aggregated data to create nodes and links for Sankey diagram
    attackToWeapon.forEach(attack => {
        const source = attack.key;
        attack.values.forEach(weapon => {
            // Map uncommon weapons to "Other"
            const target = commonWeapons.has(weapon.key) ? weapon.key : "Other";
            // Abbreviate source and target names 
            const resolvedSource = abbreviations[source] || source;
            const resolvedTarget = abbreviations[target] || target;

            // Add source and target nodes to map
            nodes.set(resolvedSource, { name: resolvedSource });
            nodes.set(resolvedTarget, { name: resolvedTarget });

            // Add link if count exceeds and source differs from target
            if (weapon.value > 20 && resolvedSource !== resolvedTarget) {
                links.push({ source: resolvedSource, target: resolvedTarget, value: weapon.value });
            }
        });
    });

    // Prepare data structure for Sankey layout with nodes array and links with indices
    const sankeyData = {
        nodes: Array.from(nodes.values()),
        links: links.map(d => ({
            source: Array.from(nodes.keys()).indexOf(d.source),
            target: Array.from(nodes.keys()).indexOf(d.target),
            value: d.value
        }))
    };

    // Define color scale for nodes using categorical scheme
    const color = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(sankeyData.nodes.map(d => d.name));

    // Compute the Sankey positions for nodes and links
    sankey(sankeyData);

    // Append rectangles for nodes with position and size from layout
    svg.append("g")
        .selectAll("rect")
        .data(sankeyData.nodes)
        .enter().append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0)
        .style("fill", d => color(d.name))
        .append("title")
        .text(d => `${d.name}\n${d.value}`);

    // Append paths for links with stroke width proportional to flow value
    svg.append("g")
        .attr("fill", "none")
        .selectAll("path")
        .data(sankeyData.links)
        .enter().append("path")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke", "lightgray")
        .attr("stroke-width", d => Math.max(1, d.width))
        .attr("opacity", 0.6);

    // Append text labels for nodes positioned to the left or right of nodes
    svg.append("g")
        .selectAll("text")
        .data(sankeyData.nodes)
        .enter().append("text")
        .attr("x", d => d.x0 - 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .text(d => d.name)
        .filter(d => d.x0 < svgWidth / 2)
        .attr("x", d => d.x1 + 6)
        .attr("text-anchor", "start");
}
