/////////////////////////////////////////////////////////////////////////////////////////

var versus_dataset;

var versus = { width: VERSUS_WIDTH - VERSUS_LEFT - VERSUS_RIGHT, height: VERSUS_HEIGHT - VERSUS_TOP - VERSUS_BOTTOM };

// VERSUS SETUP ////////////////////////////////////////////////////////////////////////

var svg_versus = d3.select('body')
    .select('#svgVersus')
    .attr('width', VERSUS_WIDTH + VERSUS_LEFT + VERSUS_RIGHT)
    .attr('height', VERSUS_HEIGHT + VERSUS_TOP + VERSUS_BOTTOM )

versus_g_nonfatal = svg_versus.append("g").attr("transform", "translate(" + (VERSUS_LEFT + (VERSUS_WIDTH /2) + 25) + "," + (VERSUS_TOP - 20) + ")");

versus_g_fatal = svg_versus.append("g").attr("transform", "translate(" + (VERSUS_LEFT + (VERSUS_WIDTH /2) + 25) + "," + (VERSUS_TOP - 20) + ")");

const VERSUS_GAP_HALF = 250;

// set versus y scale
versus_y = d3.scaleBand().range([0, VERSUS_HEIGHT])

// set versus x scale
versus_x = d3.scaleLinear().range([-1 * VERSUS_WIDTH, VERSUS_WIDTH / 2 ]);
versus_x_fatal = d3.scaleLinear().range([0, VERSUS_WIDTH / 3]);
versus_x_nonfatal = d3.scaleLinear().range([-1 * VERSUS_WIDTH / 3, 0 ])
// set the versus colors                   
versus_z = d3.scaleOrdinal().range(STACK_COLOURS);

/////////////////////////////////////////////////////////////////////////////////////////

// initially draw the chart
function drawVersusChart() {
    versus_g_fatal.append("g")
        .attr("fill", "steelblue")
        .selectAll("g")
        .data(versus_dataset)
        .enter().append("rect")
            .classed("bar", true)
            .attr("class", "bar")
            .attr("y", function (d) {
                return versus_y(d.occupation);
            })
            .attr("x", function (d) {
                return versus_x_fatal(0) + VERSUS_GAP_HALF;
            })
            .attr("width", function (d) {
                return versus_x_fatal(d.f_total_rate);
            })
            .attr("height", versus_y.bandwidth())
            .on("mouseover", function (d) {
                // make all bars opaque
                fadeRect(.2, d);
                fadeText(1, d);
            })
            .on("mouseout", function (d) {
                fadeRect(1, d);
                fadeText(0, d);
            })

    versus_g_fatal.append("g")
        .selectAll("g")
        .data(versus_dataset)
        .enter()
        .append("text")
        .text(function (d) { return d3.format(".3n")(d.f_total_rate) })
        .attr("x", function (d) {
            return versus_x_fatal(d.f_total_rate) + VERSUS_GAP_HALF + 10;
        })
        .attr("y", function (d) {
            return versus_y(d.occupation);
        })
        .attr("dy", ".75em")
        .attr('class', 'stacked_text_info')
        .style('fill', 'white')
        .style('opacity', 0)
        

    versus_g_nonfatal.append("g")
        .attr("fill", "orange")
        .selectAll("g")
        .data(versus_dataset)
        .enter().append("rect")
        .classed("bar", true)
        .attr("y", function (d) {
            return versus_y(d.occupation);
        })
        .attr("x", function (d) {
            return versus_x_nonfatal(-d.nf_total_rate) - VERSUS_GAP_HALF;
        })
        .attr("width", function (d) {
            return Math.abs(versus_x_nonfatal(d.nf_total_rate) - versus_x_nonfatal(0));
        })
        .attr("height", versus_y.bandwidth())
        .on("mouseover", function (d) {
            // make all bars opaque
            fadeRect(.2, d);
            fadeText(1, d);
        })
        .on("mouseout", function (d) {
            fadeRect(1, d);
            fadeText(0, d);
        });

    versus_g_nonfatal.append("g")
        .selectAll("g")
        .data(versus_dataset)
        .enter()
        .append("text")
        .text(function (d) { return d3.format(",.2f")(d.nf_total_rate) })
        .attr("x", function (d) {
            return versus_x_nonfatal(-d.nf_total_rate) - VERSUS_GAP_HALF - 10;
        })
        .attr("y", function (d) {
            return versus_y(d.occupation);
        })
        .attr('text-anchor', 'end')
        .attr("dy", ".75em")
        .attr('class', 'stacked_text_info')
        .style('fill', 'white')
        .style('opacity', 0)
}

function fadeRect(opacity, d) {
    d3.selectAll("rect")
        .filter(function (e) { return e !== d; })
        .transition()
        .style("opacity", opacity);
}

function fadeText(opacity, d) {
    d3.selectAll("text")
    .filter(function (e) { return e === d; })
    .transition()
    .style("opacity", opacity);
}

// add the axis
function drawVersusAxis() {


    // X AXIS

    versus_g_nonfatal.append("g")
            .attr("class", "axis")
            .call(d3.axisBottom(versus_x_nonfatal)
                .tickFormat(Math.abs)) // for negative values
            .attr("transform", "translate(-" + VERSUS_GAP_HALF + "," + VERSUS_HEIGHT + ")")
        .append("text")
            .attr("transform", "translate(-" + VERSUS_GAP_HALF + " ," + 50 + ")")
            .style("text-anchor", "middle")
            .style("font-family", 'Lora')
            .style("font-size", "20px")
            .style('fill', 'white')
            .style('opacity', '1')
            .style('font-weight', '900')
            .text("Non-Fatal Injuries per 100k");

    
    versus_g_fatal.append("g")
            .attr("class", "axis")
            .call(d3.axisBottom(versus_x_fatal))
            .attr("transform", "translate(" + VERSUS_GAP_HALF + "," + VERSUS_HEIGHT + ")")
        .append("text")
            .attr("transform", "translate(" + VERSUS_GAP_HALF + " ," + 50 + ")")
            .style("text-anchor", "middle")
            .style("font-family", 'Lora')
            .style("font-size", "20px")
            .style('fill', 'white')
            .style('opacity', '1')
            .style('font-weight', '900')
            .text("Fatal Injuries per 100k");


    // Y AXIS

    var yElements = versus_g_fatal.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(versus_y))
        .attr("transform", "translate(" + VERSUS_GAP_HALF + ",0)")
    
    // Align these labels
    yElements.selectAll("text")
        .attr("transform", function (d) {
            return "translate(-" + (VERSUS_GAP_HALF - 10) + ",0)"
        })
        .style("text-anchor", "middle")

    yElements = versus_g_nonfatal.append("g")
        .attr("class", "axis")
        .call(d3.axisRight(versus_y))
        .attr("transform", "translate(-" + VERSUS_GAP_HALF + ",0)")

    // Remove these labels
    yElements.selectAll("text").remove();


}
