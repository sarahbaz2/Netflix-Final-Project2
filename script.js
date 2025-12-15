// INTERACTIVE D3 VISUALIZATION

// Movies vs TV Shows on Netflix

// Load CSV dataset
d3.csv('netflix_titles.csv').then((data) => {
    // 1. DATA PROCESSING

    // Count Movies and TV Shows
    const movieCount = data.filter((d) => d.type === 'Movie').length;
    const showCount = data.filter((d) => d.type === 'TV Show').length;

    // Compute total and percentages
    const total = movieCount + showCount;

    const dataset = [
        { type: 'Movie', count: movieCount, percent: (movieCount / total) * 100 },
        { type: 'TV Show', count: showCount, percent: (showCount / total) * 100 },
    ];
    // 2. SVG CANVAS SETUP
    const margin = { top: 80, right: 40, bottom: 60, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3
        .select('#chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
    // 3. SCALE

    let viewMode = 'count'; // can be "count" or "percent"

    const x = d3
        .scaleBand()
        .domain(dataset.map((d) => d.type))
        .range([0, width])
        .padding(0.4);

    const y = d3.scaleLinear().range([height, 0]);

    // Color scale
    const color = d3.scaleOrdinal().domain(['Movie', 'TV Show']).range(['#800000', '#FFB6C1']);
    // 4. AXES
    const xAxisGroup = svg.append('g').attr('transform', `translate(0, ${height})`);

    const yAxisGroup = svg.append('g');
    // 5. TITLE & SUBTITLE
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -28)
        .attr('text-anchor', 'middle')
        .style('font-size', '22px')
        .style('font-weight', '600')
        .style('fill', '#FFFFFF')
        .text('Movies vs TV Shows on Netflix');

    const subtitle = svg
        .append('text')
        .attr('x', 1)
        .attr('y', height + 40)
        .style('font-size', '14px')
        .style('fill', '#FFFFFF')
        .text(
            `Movies: ${movieCount} (${((movieCount / total) * 100).toFixed(
                1
            )}%) TV Shows: ${showCount} (${((showCount / total) * 100).toFixed(1)}%)`
        );
    // 6. TOOLTIP
    const tooltip = d3
        .select('body')
        .append('div')
        .style('position', 'absolute')
        .style('background', 'black')
        .style('padding', '8px')
        .style('border', '1px solid #999')
        .style('border-radius', '4px')
        .style('box-shadow', '0 0 5px rgba(209, 158, 158, 0.2)')
        .style('display', 'none');
    // 7. DRAW FUNCTION
    function draw() {
        // Update Y axis scale based on view mode
        y.domain([0, viewMode === 'count' ? d3.max(dataset, (d) => d.count) : 100]);

        // UPDATE axes
        xAxisGroup.call(d3.axisBottom(x));
        yAxisGroup.call(
            d3
                .axisLeft(y)
                .ticks(6)
                .tickFormat((d) => (viewMode === 'count' ? d : d + '%'))
        );

        // JOIN data â†’ bars
        const bars = svg.selectAll('.bar').data(dataset);

        // EXIT old bars
        bars.exit().remove();

        // UPDATE + ENTER bars
        bars.enter()
            .append('rect')
            .attr('class', 'bar')
            .merge(bars)
            .transition()
            .duration(800)
            .attr('x', (d) => x(d.type))
            .attr('width', x.bandwidth())
            .attr('y', (d) => (viewMode === 'count' ? y(d.count) : y(d.percent)))
            .attr('height', (d) =>
                viewMode === 'count' ? height - y(d.count) : height - y(d.percent)
            )
            .attr('fill', (d) => color(d.type));

        // ADD TOOLTIP INTERACTION
        svg.selectAll('.bar')
            .on('mouseover', (event, d) => {
                tooltip.style('display', 'block').html(`
                        <strong>${d.type}</strong><br>
                        Count: ${d.count}<br>
                        Percent: ${d.percent.toFixed(1)}%
                    `);
            })
            .on('mousemove', (event) => {
                tooltip
                    .style('left', event.pageX + 10 + 'px')
                    .style('top', event.pageY - 20 + 'px');
            })
            .on('mouseout', () => tooltip.style('display', 'none'));
        // ADD VALUE LABELS
        const labels = svg.selectAll('.label').data(dataset);

        labels
            .enter()
            .append('text')
            .attr('class', 'label')
            .merge(labels)
            .transition()
            .duration(800)
            .attr('x', (d) => x(d.type) + x.bandwidth() / 2)
            .attr('y', (d) => (viewMode === 'count' ? y(d.count) : y(d.percent)) - 5)
            .attr('text-anchor', 'middle')
            .style('font-size', '13px')
            .style('fill', '#FFFFFF')
            .text((d) => (viewMode === 'count' ? d.count : d.percent.toFixed(1) + '%'));
    }
    // 8. BUTTONS FOR INTERACTIVITY

    const controls = d3.select('#chart').append('div').style('margin-top', '20px');

    // Toggle view button
    controls
        .append('button')
        .text('Show Percentages')
        .style('margin-right', '10px')
        .on('click', function () {
            viewMode = viewMode === 'count' ? 'percent' : 'count';
            this.textContent = viewMode === 'count' ? 'Show Percentages' : 'Show Counts';
            draw();
        });

    // 9. INITIAL DRAW
    draw();
});
// second visualization
d3.csv('netflix_titles.csv').then((rawData) => {
    // Extract all genres
    let allGenres = new Set();

    rawData.forEach((d) => {
        if (d.listed_in) {
            d.listed_in.split(',').forEach((g) => {
                allGenres.add(g.trim());
            });
        }
    });

    allGenres = Array.from(allGenres).sort();

    // Prepare dropdown
    const dropdown = d3.select('#genreDropdown');
    dropdown.append('option').text('Select a Genre');

    allGenres.forEach((g) => {
        dropdown.append('option').text(g);
    });

    // Prepare SVG
    const margin = { top: 50, right: 40, bottom: 60, left: 70 };
    const width = 800 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    const svg2 = d3
        .select('#genreOverTime')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Axes groups
    const xAxisGroup = svg2.append('g').attr('transform', `translate(0,${height})`);

    const yAxisGroup = svg2.append('g');

    // ==============================
    // ADD AXIS LABELS
    // ==============================

    // X LABEL = YEAR
    svg2.append('text')
        .attr('x', width / 2)
        .attr('y', height + 45)
        .attr('text-anchor', 'middle')
        .style('fill', 'white')
        .style('font-size', '16px')
        .text('Release Year');

    // Y LABEL = COUNT
    svg2.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -(height / 2))
        .attr('y', -50)
        .attr('text-anchor', 'middle')
        .style('fill', 'white')
        .style('font-size', '16px')
        .text('Number of Titles');

    // Line path
    const linePath = svg2
        .append('path')
        .style('fill', 'none')
        .style('stroke', '#E50914')
        .style('stroke-width', 3);

    // Title
    const title = svg2
        .append('text')
        .attr('x', width / 2)
        .attr('y', -15)
        .attr('text-anchor', 'middle')
        .style('fill', 'white')
        .style('font-size', '22px');

    // Function to update chart
    function updateChart(selectedGenre) {
        if (!selectedGenre || selectedGenre === 'Select a Genre') return;

        title.text(`Popularity of "${selectedGenre}" Over Time`);

        // Filter rows containing this genre
        let filtered = rawData.filter(
            (d) => d.listed_in && d.listed_in.toLowerCase().includes(selectedGenre.toLowerCase())
        );

        // Count occurrences per year
        const yearlyCounts = d3
            .rollups(
                filtered,
                (v) => v.length,
                (d) => +d.release_year
            )
            .sort((a, b) => a[0] - b[0]);

        const years = yearlyCounts.map((d) => d[0]);
        const counts = yearlyCounts.map((d) => d[1]);

        // Scales
        const x = d3
            .scaleLinear()
            .domain([d3.min(years), d3.max(years)])
            .range([0, width]);

        const y = d3
            .scaleLinear()
            .domain([0, d3.max(counts)])
            .range([height, 0]);

        // Axis
        xAxisGroup.call(d3.axisBottom(x).tickFormat(d3.format('d')));
        yAxisGroup.call(d3.axisLeft(y));

        // Line generator
        const line = d3
            .line()
            .x((d) => x(d[0]))
            .y((d) => y(d[1]));

        // Draw line with animation
        linePath.datum(yearlyCounts).transition().duration(900).attr('d', line);
    }

    // On dropdown change
    dropdown.on('change', function () {
        const selectedGenre = this.value;
        updateChart(selectedGenre);
    });
    // Visualization 3
    d3.csv('Netflix_titles.csv').then((data) => {
        // Parse release year
        data.forEach((d) => (d.release_year = +d.release_year));

        // Set margin and size
        const margin = { top: 50, right: 20, bottom: 50, left: 150 },
            width = 900 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        const svg = d3
            .select('#viz3')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Scales
        const y = d3.scaleBand().range([0, height]).padding(0.2);
        const x = d3.scaleLinear().range([0, width]);

        // Axis groups
        const yAxisGroup = svg.append('g');
        const xAxisGroup = svg.append('g').attr('transform', `translate(0,${height})`);

        // Use existing yearSelect dropdown
        const years = Array.from(new Set(data.map((d) => d.release_year))).sort((a, b) => a - b);

        const slider = d3.select('#yearSelect').on('change', update);

        slider
            .selectAll('option')
            .data(years)
            .enter()
            .append('option')
            .attr('value', (d) => d)
            .text((d) => d);

        function update() {
            const selectedYear = +slider.property('value');
            const filtered = data.filter((d) => d.release_year === selectedYear && d.country);

            // Count releases per country
            let countryCount = {};
            filtered.forEach((d) => {
                d.country.split(',').forEach((c) => {
                    const country = c.trim();
                    countryCount[country] = (countryCount[country] || 0) + 1;
                });
            });

            let topCountries = Object.entries(countryCount)
                .map(([country, count]) => ({ country, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);

            y.domain(topCountries.map((d) => d.country));
            x.domain([0, d3.max(topCountries, (d) => d.count) || 1]);

            // Join data
            const bars = svg.selectAll('rect').data(topCountries, (d) => d.country);

            bars.enter()
                .append('rect')
                .merge(bars)
                .transition()
                .duration(500)
                .attr('y', (d) => y(d.country))
                .attr('x', 0)
                .attr('height', y.bandwidth())
                .attr('width', (d) => x(d.count))
                .attr('fill', '#E50914');

            bars.exit().remove();

            // Labels
            const labels = svg.selectAll('.label').data(topCountries, (d) => d.country);

            labels
                .enter()
                .append('text')
                .attr('class', 'label')
                .merge(labels)
                .transition()
                .duration(500)
                .attr('x', (d) => x(d.count) + 5)
                .attr('y', (d) => y(d.country) + y.bandwidth() / 2 + 5)
                .text((d) => d.count);

            labels.exit().remove();

            // Update axes
            yAxisGroup.transition().duration(500).call(d3.axisLeft(y));
            xAxisGroup.transition().duration(500).call(d3.axisBottom(x));
        }

        // Initial render
        update();
    });
    // Visualization 4:
    (function renderViz4_RatingDistribution() {
        console.log("Viz4: starting...");
      
        const csvPath = "netflix_titles.csv";
      
        // ---- Safety: clear old chart if you refresh/reload ----
        d3.select("#ratingChart").selectAll("*").remove();
      
        // ---- Tooltip: create once ----
        let tooltip = d3.select("body").select(".tooltip");
        if (tooltip.empty()) {
          tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "#222")
            .style("color", "#fff")
            .style("padding", "8px")
            .style("border-radius", "6px")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("opacity", 0);
        }
      
        d3.csv(csvPath).then(data => {
          console.log("Viz4: CSV loaded, rows =", data.length);
      
          // ---- Clean + Count ratings ----
          const cleaned = data.filter(d => d.rating && String(d.rating).trim() !== "");
          const ratingCounts = d3.rollups(
            cleaned,
            v => v.length,
            d => String(d.rating).trim()
          )
          .map(([rating, count]) => ({ rating, count }))
          .sort((a, b) => d3.descending(a.count, b.count)); // start sorted desc
      
          // ---- Dimensions ----
          const width = 900;
          const height = 500;
          const margin = { top: 40, right: 30, bottom: 120, left: 70 };
          const innerW = width - margin.left - margin.right;
          const innerH = height - margin.top - margin.bottom;
      
          // ---- SVG ----
          const svg = d3.select("#ratingChart")
            .append("svg")
            .attr("width", width)
            .attr("height", height);
      
          const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
      
          // ---- Scales ----
          const x = d3.scaleBand()
            .domain(ratingCounts.map(d => d.rating))
            .range([0, innerW])
            .padding(0.2);
      
          const y = d3.scaleLinear()
            .domain([0, d3.max(ratingCounts, d => d.count)])
            .nice()
            .range([innerH, 0]);
      
          // ---- Axes ----
          const xAxis = g.append("g")
            .attr("transform", `translate(0,${innerH})`)
            .call(d3.axisBottom(x));
      
          xAxis.selectAll("text")
            .attr("transform", "rotate(-40)")
            .style("text-anchor", "end");
      
          g.append("g").call(d3.axisLeft(y));
      
          // ---- Netflix theme colors (red/white/black with visible stroke)
          const color = (r) => {
            if (r.startsWith("TV")) return "#e50914";       // red for TV ratings
            if (["G","PG","PG-13","R","NC-17"].includes(r)) return "#ffffff"; // white for movie ratings
            return "#000000";                               // black otherwise
          };
      
          // ---- Bars ----
          const bars = g.selectAll(".rating-bar")
            .data(ratingCounts, d => d.rating)
            .enter()
            .append("rect")
            .attr("class", "rating-bar")
            .attr("x", d => x(d.rating))
            .attr("y", d => y(d.count))
            .attr("width", x.bandwidth())
            .attr("height", d => innerH - y(d.count))
            .attr("fill", d => color(d.rating))
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 0.7)
            .on("mouseover", (event, d) => {
              tooltip.style("opacity", 1)
                .html(`<strong>Rating:</strong> ${d.rating}<br><strong>Titles:</strong> ${d.count}`);
            })
            .on("mousemove", (event) => {
              tooltip.style("left", (event.pageX + 12) + "px")
                     .style("top", (event.pageY - 30) + "px");
            })
            .on("mouseout", () => tooltip.style("opacity", 0));


 /* ================= Legend ================= */
 const legendData = [
    { label: "TV Ratings", color: "#e50914" },
    { label: "Movie Ratings", color: "#ffffff" },
    { label: "Other Ratings", color: "#000000" }
  ];

  const legend = svg
    .append("g")
    .attr("class", "legend")
    .attr(
      "transform",
      `translate(${margin.left}, ${margin.top + innerH + 50})`
    );
  
  const legendItem = legend
    .selectAll(".legend-item")
    .data(legendData)
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(${i * 220}, 0)`);
  
  legendItem
    .append("rect")
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", d => d.color)
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 1);
  legendItem
    .append("text")
    .attr("x", 26)
    .attr("y", 14)
    .style("fill", "#ffffff")
    .style("font-size", "14px")
    .text(d => d.label);

  // ---- Sorting buttons
          function update(order) {
            const sorted = ratingCounts.slice().sort((a, b) =>
              order === "asc" ? d3.ascending(a.count, b.count) : d3.descending(a.count, b.count)
            );
      
            x.domain(sorted.map(d => d.rating));
      
            xAxis.transition().duration(700)
              .call(d3.axisBottom(x))
              .selectAll("text")
              .attr("transform", "rotate(-40)")
              .style("text-anchor", "end");
      
            bars.data(sorted, d => d.rating)
              .transition().duration(700)
              .attr("x", d => x(d.rating));
          }
      
          const btnAsc = d3.select("#sortAsc");
          const btnDesc = d3.select("#sortDesc");
      
          if (!btnAsc.empty()) btnAsc.on("click", () => update("asc"));
          if (!btnDesc.empty()) btnDesc.on("click", () => update("desc"));
      
          console.log("Viz4: rendered successfully ✅");
        })
        .catch(err => {
          console.error("Viz4 ERROR:", err);
        });
      })();      

});
