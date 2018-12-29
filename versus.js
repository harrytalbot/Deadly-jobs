/////////////////////////////////////////////////////////////////////////////////////////

var versus = { width: VERSUS_WIDTH - VERSUS_LEFT - VERSUS_RIGHT, height: VERSUS_HEIGHT - VERSUS_TOP - VERSUS_BOTTOM };

// VERSUS SETUP ////////////////////////////////////////////////////////////////////////

var svg_versus = d3.select('body')
    .select('#svgVersus')
    .attr('width', VERSUS_WIDTH + VERSUS_LEFT + VERSUS_RIGHT)
    .attr('height', VERSUS_HEIGHT + VERSUS_TOP + VERSUS_BOTTOM)
    .attr("class", "background"); // SVG BACKGROUND COLOUR

versus_g = svg_versus.append("g").attr("transform", "translate(" + 1000  + "," + VERSUS_TOP + ")");

// set stacked y scale
versus_y = d3.scaleBand().range([0, VERSUS_HEIGHT])
// set stacked x scale
versus_x = d3.scaleLinear().range([-1 * VERSUS_WIDTH / 2, VERSUS_WIDTH / 2 ]);
versus_x_fatal = d3.scaleLinear().range([0, VERSUS_WIDTH / 2]);
versus_x_nonfatal = d3.scaleLinear().range([-1 * VERSUS_WIDTH / 2, 0 ]);
// set the stacked colors                   
versus_z = d3.scaleOrdinal().range(STACK_COLOURS);

/////////////////////////////////////////////////////////////////////////////////////////

// initially draw the chart
function drawVersusChart() {
    versus_g.append("g")
        .attr("fill", "steelblue")

        .selectAll("g")
        .data(dataset)
        .enter().append("rect")
        .classed("bar", true)
        .attr("y", function (d) {
            return versus_y(d.occupation);
        })
        .attr("x", function (d) {
            return versus_x_fatal(0);
        })
        .attr("width", function (d) {
            return versus_x_fatal(d.f_total_rate);
        })
        .attr("height", versus_y.bandwidth())

    versus_g.append("g")
        .attr("fill", "orange")
        .selectAll("g")
        .data(dataset)
        .enter().append("rect")
        .classed("bar", true)
        .attr("y", function (d) {
            return versus_y(d.occupation);
        })
        .attr("x", function (d) {
            return versus_x_nonfatal(-d.nf_total_rate);
        })
        .attr("width", function (d) {
            return Math.abs( versus_x_nonfatal(d.nf_total_rate) - versus_x_nonfatal(0));
        })
        .attr("height", versus_y.bandwidth())
}

// add the axis
function drawVersusAxis() {

    versus_g.append("g")
        .attr("class", "axis")
        .call(d3.axisBottom(versus_x))
        .attr("transform", "translate(0," + VERSUS_HEIGHT + ")")

    versus_g.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(versus_y))

}

// add the legend
function drawStackedLegend() {
    var legend = versus_g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(causes.slice().reverse())
        .enter().append("g")
        .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", VERSUS_WIDTH - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", versus_z);

    legend.append("text")
        .attr("x", VERSUS_WIDTH - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .attr("fill", 'white')
        .text(function (d) { return d; });
}
