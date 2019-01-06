/////////////////////////////////////////////////////////////////////////////////////////

var scatter_dataset;

var scatter = { width: SCATTER_WIDTH - SCATTER_LEFT - SCATTER_RIGHT, height: SCATTER_HEIGHT - STACKED_TOP - STACKED_BOTTOM};

/// SCATTER SETUP ///////////////////////////////////////////////////////////////////////

var svg_scatter = d3.select('body')
    .select('#svgScatter')
    .attr('width', SCATTER_WIDTH + SCATTER_LEFT + SCATTER_RIGHT)
    .attr('height', SCATTER_HEIGHT + SCATTER_TOP + SCATTER_BOTTOM)

scatter_g = svg_scatter.append("g").attr("transform", "translate(" + SCATTER_LEFT + "," + SCATTER_TOP + ")");

// set scatter y scale
scatter_y = d3.scaleLinear().range([SCATTER_HEIGHT, 0])
// set scatter x scale
scatter_x = d3.scaleLinear().range([0, SCATTER_WIDTH])
// set the scatter_x colors                   
scatter_z = d3.scaleLinear().range(["LightBlue ", "SteelBlue "]);

var scatter_plotSize = d3.scaleLinear().range([5,12])

/////////////////////////////////////////////////////////////////////////////////////////

var scatter_versus_dataset; // the main set
var scatter_versus_dataset_filtered;


var scatter_versus_y_labels;

/// SCATTER VERSUS SETUP /////////////////////////////////////////////////////////////////

scatter_g_versus = svg_scatter.append("g").attr("transform", "translate(" + (SCATTER_LEFT + 70) + "," + SCATTER_TOP + ")");

scatter_g_versus.append("rect")
    .attr("width", SCATTER_VERSUS_WIDTH + SCATTER_VERSUS_LEFT +SCATTER_VERSUS_RIGHT)
    .attr("height", SCATTER_VERSUS_HEIGHT + SCATTER_VERSUS_BOTTOM + SCATTER_VERSUS_TOP)
    .attr('stroke', 'white')
    .attr('stroke-width', '5')
    .attr('fill', 'black')

scatter_versus_g_nonfatal = scatter_g_versus.append("g").attr("transform", "translate(" + (SCATTER_VERSUS_LEFT + (SCATTER_VERSUS_WIDTH /2)) + "," + (SCATTER_VERSUS_TOP) + ")")

scatter_versus_g_fatal = scatter_g_versus.append("g").attr("transform", "translate(" + (SCATTER_VERSUS_LEFT + (SCATTER_VERSUS_WIDTH /2)) + "," + (SCATTER_VERSUS_TOP) + ")")

const SCATTER_VERSUS_GAP_HALF = 20;

// set versus y scale
scatter_versus_y = d3.scaleBand().range([0, SCATTER_VERSUS_HEIGHT])
// set versus x scale
scatter_versus_x_fatal = d3.scaleLinear().range([0, SCATTER_VERSUS_WIDTH / 3]);
scatter_versus_x_nonfatal = d3.scaleLinear().range([-1 * SCATTER_VERSUS_WIDTH / 3, 0 ])
// set the versus colors                   
scatter_versus_z = d3.scaleOrdinal().range(STACK_COLOURS);

/////////////////////////////////////////////////////////////////////////////////////////

function drawScatterAxis() {
    // X-axis
    scatter_g.append('g')
        .attr("class", "axis")
        .call(d3.axisBottom(scatter_x))
        .attr('transform', 'translate(0,' + SCATTER_HEIGHT + ')')

        .append('text') // X-axis Label
            .attr('class', 'label')
            .attr('y', 50)
            .attr('x', SCATTER_WIDTH / 2)
            .attr('dy', '.71em')
            .style("text-anchor", "middle")
            .style("font-family", 'Lora')
            .style("font-size", "20px")
            .style('fill', 'white')
            .style('opacity', '1')
            .style('font-weight', '900')
            .text("Non-Fatal Injuries per 100k");

    // Y-axis
    scatter_g.append('g')
        .attr("class", "axis")
        .call(d3.axisLeft(scatter_y))

        .append('text') // y-axis Label
            .attr('class', 'label')
            .attr('x', -(SCATTER_HEIGHT / 2))
            .attr('transform', 'rotate(-90)')
            .attr('y', -60)
            .attr('dy', '.71em')
            .style("text-anchor", "middle")
            .style("font-family", 'Lora')
            .style("font-size", "20px")
            .style('fill', 'white')
            .style('opacity', '1')
            .style('font-weight', '900')
            .text("Fatal Injuries per 100k");

}

function drawScatterPlot() {

    drawScatterVersus();
    //drawScatterVersusAxis();

    var circles = scatter_g.selectAll('circle')
        .data(scatter_dataset)
        .enter()
        .append('circle')
            .attr('cx', function (d) { return scatter_x(d.nf_total_rate) })
            .attr('cy', function (d) { return scatter_y(d.f_total_rate) })
            .attr('r', function (d) { return scatter_plotSize(d.totEmp)})
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('fill', function (d, i) { return scatter_z(d.salaryMed) })
            .on('mouseover', function (d) {

                updateScatterVersus(d.majorOccCodeGroup);
                
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('r', 20)
                    .attr('stroke-width', 3)
            })
            .on('mouseout', function () {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('r', function (d) { return scatter_plotSize(d.totEmp)})
                    .attr('stroke-width', 1)
            })
            .append('title') // Tooltip
            .text(function (d) {
                return d.occupation.trim() +
                    '\nNon-Fatal: ' + d.nf_total_rate +
                    '\nFatal.: ' + d.f_total_rate
            });

        
}

function drawScatterVersus(){

    var fatalTotal = 0;
    var nonFatalTotal = 0;
    var numBars = 0;
    
    // bars
    scatter_versus_g_fatal.append("g")
        .attr("fill", "steelblue")
        .selectAll("g")
        .data(scatter_versus_dataset_filtered)
        .enter().append("rect")
            .attr('id', 'scatter_versus_fatal_rect')
            .classed("bar", true)
            .attr("class", "bar")
            .attr("y", function (d) {
                return scatter_versus_y(d.occupation);
            })
            .attr("x", function (d) {
                return scatter_versus_x_fatal(0) + SCATTER_VERSUS_GAP_HALF;
            })
            .attr("width", function (d) {
                fatalTotal += d.f_total_rate;
                numBars++;
                return scatter_versus_x_fatal(d.f_total_rate);
            })
            .attr("height", scatter_versus_y.bandwidth())
            .on("mouseover", function (d) {
                // make all bars opaque
                fadeOutVersus('#scatter_versus_rect', .2, d);
                fadeInVersus("#scatter_versus_bar_label", 1, d);
                d3.selectAll('#scatter_versus_average_text').transition().style("opacity", 0.2);
            })
            .on("mouseout", function (d) {
                fadeOutVersus('#scatter_versus_rect', 1, d);
                fadeInVersus("#scatter_versus_bar_label", 0, d);
                d3.selectAll('#scatter_versus_average_text').transition().style("opacity", 1);


            });

    scatter_versus_g_fatal.append("g")
        .selectAll("g")
        .data(scatter_versus_dataset_filtered)
        .enter()
        .append("text")
            .attr('id', 'scatter_versus_bar_label')
            .text(function (d) { return d3.format(".3n")(d.f_total_rate) + " | " + d.f_total })
            .attr("x", function (d) {
                return scatter_versus_x_fatal(d.f_total_rate) + SCATTER_VERSUS_GAP_HALF + 10;
            })
            .attr("y", function (d) {
                return scatter_versus_y(d.occupation);
            })
            .attr("dy", ".75em")
            .attr('class', 'stacked_text_info')
            .style('fill', 'white')
            .style('opacity', 0)
            

    scatter_versus_g_nonfatal.append("g")
        .attr("fill", "orange")
        .selectAll("g")
        .data(scatter_versus_dataset_filtered)
        .enter().append("rect")
            .attr('id', 'scatter_versus_nonfatal_rect')
            .classed("bar", true)
            .attr("y", function (d) {
                return scatter_versus_y(d.occupation);
            })
            .attr("x", function (d) {
                return scatter_versus_x_nonfatal(-d.nf_total_rate) - SCATTER_VERSUS_GAP_HALF;
            })
            .attr("width", function (d) {
                nonFatalTotal += d.nf_total_rate;
                return scatter_versus_x_nonfatal(d.nf_total_rate);
            })
            .attr("height", scatter_versus_y.bandwidth())
            .on("mouseover", function (d) {
                fadeOutVersus('#scatter_versus_rect', .2, d);
                fadeInVersus("#scatter_versus_bar_label", 1, d);
                d3.selectAll('#scatter_versus_average_text').transition().style("opacity", 0.2);

            })
            .on("mouseout", function (d) {
                fadeOutVersus('#scatter_versus_rect', 1, d);
                fadeInVersus("#scatter_versus_bar_label", 0, d);
                d3.selectAll('#scatter_versus_average_text').transition().style("opacity", 1);


            });

    scatter_versus_g_nonfatal.append("g")
        .selectAll("g")
        .data(scatter_versus_dataset_filtered)
        .enter()
        .append("text")
            .attr('id', 'scatter_versus_bar_label')
            .text(function (d) { return d3.format(",.2f")(d.nf_total_rate) + " | " + d.nf_total})
            .attr("x", function (d) {
                return scatter_versus_x_nonfatal(-d.nf_total_rate) - SCATTER_VERSUS_GAP_HALF - 10;
            })
            .attr("y", function (d) {
                return scatter_versus_y(d.occupation);
            })
            .attr('text-anchor', 'end')
            .attr("dy", ".75em")
            .attr('class', 'stacked_text_info')
            .style('fill', 'white')
            .style('opacity', 0)
    /*

    // avg lines
    scatter_versus_g_fatal.append("line")
        .attr('id', 'scatter_versus_fatal_average_line')
        .style("stroke", "white")
        .attr('stroke-width', '3')
        .attr('opacity', 0.5)
        .attr("x1", scatter_versus_x_fatal(fatalTotal / numBars) + SCATTER_VERSUS_GAP_HALF)
        .attr("y1", 0)
        .attr("x2", scatter_versus_x_fatal(fatalTotal / numBars) + SCATTER_VERSUS_GAP_HALF)
        .attr("y2", SCATTER_VERSUS_HEIGHT);
    
    scatter_versus_g_fatal.append("text")
        .attr('id', 'scatter_versus_average_text')
        .attr('class', 'scatter_versus_average_text')
        .attr("transform", "translate("+ (scatter_versus_x_fatal(fatalTotal / numBars) + SCATTER_VERSUS_GAP_HALF + 10) + ","+ (SCATTER_VERSUS_HEIGHT- 10) + ")")
        .text("Average: " +  d3.format(".3n")(fatalTotal / numBars))
        .attr("font-family", "Lora")
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .attr("fill", "white")

        // avg lines
    scatter_versus_g_nonfatal.append("line")
        .attr('id', 'scatter_versus_nonfatal_average_line')
        .style("stroke", "white")
        .attr('stroke-width', '3')
        .attr('opacity', 0.5)
        .attr("x1", -scatter_versus_x_nonfatal(nonFatalTotal / numBars) - SCATTER_VERSUS_GAP_HALF)
        .attr("y1", 0)
        .attr("x2", -scatter_versus_x_nonfatal(nonFatalTotal / numBars) - SCATTER_VERSUS_GAP_HALF)
        .attr("y2", SCATTER_VERSUS_HEIGHT);

    scatter_versus_g_nonfatal.append("text")
        .attr('id', 'scatter_versus_average_text')
        .attr('class', 'scatter_versus_average_text')
        .attr("transform", "translate("+ (-scatter_versus_x_nonfatal(nonFatalTotal / numBars) - SCATTER_VERSUS_GAP_HALF - 10) + ","+ (SCATTER_VERSUS_HEIGHT - 10) + ")")
        .text("Average: " + d3.format(",.2f")(nonFatalTotal / numBars) )
        .attr("font-family", "Lora")
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .attr("fill", "white")
        .attr("text-anchor", "end")
        */
}

function drawScatterVersusAxis(){

    // X AXIS

    scatter_versus_g_nonfatal.append("g")
        .attr("class", "axis")
        .call(d3.axisBottom(scatter_versus_x_nonfatal)
            .tickFormat(Math.abs)) // for negative values
        .attr("transform", "translate(-" + SCATTER_VERSUS_GAP_HALF + "," + SCATTER_VERSUS_HEIGHT + ")")
        /*.append("text")
        .attr("transform", "translate(-" + SCATTER_VERSUS_GAP_HALF + " ," + 50 + ")")
        .style("text-anchor", "middle")
        .style("font-family", 'Lora')
        .style("font-size", "20px")
        .style('fill', 'white')
        .style('opacity', '1')
        .style('font-weight', '900')
        .text("Non-Fatal Injuries per 100k");*/


    scatter_versus_g_fatal.append("g")
        .attr("class", "axis")
        .call(d3.axisBottom(scatter_versus_x_fatal))
        .attr("transform", "translate(" + SCATTER_VERSUS_GAP_HALF + "," + SCATTER_VERSUS_HEIGHT + ")")
        /*.append("text")
        .attr("transform", "translate(" + SCATTER_VERSUS_GAP_HALF + " ," + 50 + ")")
        .style("text-anchor", "middle")
        .style("font-family", 'Lora')
        .style("font-size", "20px")
        .style('fill', 'white')
        .style('opacity', '1')
        .style('font-weight', '900')
        .text("Fatal Injuries per 100k");*/


    // Y AXIS

    var yElements = scatter_versus_g_fatal.append("g")
        .attr("class", "axis")
        .attr('id', 'versus_y_labels')
        .call(d3.axisLeft(scatter_versus_y))
        .attr("transform", "translate(" + SCATTER_VERSUS_GAP_HALF + ",0)")

    // Align these labels
    yElements.selectAll("text")
        .attr("transform", function (d) {
            return "translate(-" + (SCATTER_VERSUS_GAP_HALF - 10) + ",0)"
        })
        .style("text-anchor", "middle")

    yElements = scatter_versus_g_nonfatal.append("g")
        .attr("class", "axis")
        .call(d3.axisRight(scatter_versus_y))
        .attr("transform", "translate(-" + SCATTER_VERSUS_GAP_HALF + ",0)")

    // Remove these labels
    yElements.selectAll("text").remove();
}

function updateScatterVersus(code){
    // filter the set
    scatter_versus_dataset_filtered = scatter_versus_dataset.filter(function (d) { return (d.majorOccCodeGroup == code) })
    // uses the stacked dataset for occupations.
    scatter_versus_y.domain(scatter_versus_dataset_filtered.map(function (d) { return d.occupation; })).padding(BAR_PADDING);
    scatter_versus_x_fatal.domain([0, d3.max(scatter_versus_dataset_filtered, function (d) { return d.f_total_rate; })]).nice();
    scatter_versus_x_nonfatal.domain([d3.min(scatter_versus_dataset_filtered, function (d) { return +-1 * d.nf_total_rate; }), 0]).nice();

    var bars = d3.selectAll("#scatter_versus_fatal_rect")
        .data(scatter_versus_dataset_filtered)
    bars.exit()
        .remove()
    bars.transition()
        .duration(600)
        .attr("y", function (d) {
            return scatter_versus_y(d.occupation);
        })
        .attr("x", function (d) {
            return scatter_versus_x_fatal(0) + SCATTER_VERSUS_GAP_HALF;
        })
        .attr("width", function (d) {
            return scatter_versus_x_fatal(d.f_total_rate);
        })
        .attr("height", scatter_versus_y.bandwidth())
    
    bars.enter()
        .append("rect")
        .attr('id', 'scatter_versus_fatal_rect')
        .classed("bar", true)
        .attr("y", function (d) {
            return scatter_versus_y(d.occupation);
        })
        .attr("x", function (d) {
            return scatter_versus_x_fatal(0) + SCATTER_VERSUS_GAP_HALF;
        })
        .attr("width", function (d) {
            return scatter_versus_x_fatal(d.f_total_rate);
        })
        .attr("height", scatter_versus_y.bandwidth())

    //then nonfatal - go in, change the data, redraw and transition
    bars = d3.selectAll("#scatter_versus_nonfatal_rect")
        .data(scatter_versus_dataset_filtered)
    bars.exit()
        .remove()
    bars.enter()
        .append("rect")
        .attr('id', 'scatter_versus_nonfatal_rect')
        .classed("bar", true)
        .attr("y", function (d) {
            return scatter_versus_y(d.occupation);
        })
        .attr("x", function (d) {
            return scatter_versus_x_nonfatal(-d.nf_total_rate) - SCATTER_VERSUS_GAP_HALF;
        })
        .attr("width", function (d) {
            return scatter_versus_x_nonfatal(d.nf_total_rate);
        })
        .attr("height", scatter_versus_y.bandwidth())

    bars.transition()
        .duration(600)
        .attr("y", function (d) {
            return scatter_versus_y(d.occupation);
        })
        .attr("x", function (d) {
            return scatter_versus_x_nonfatal(-d.nf_total_rate) - SCATTER_VERSUS_GAP_HALF;
        })
        .attr("width", function (d) {
            return scatter_versus_x_nonfatal(d.nf_total_rate);
        })
        .attr("height", scatter_versus_y.bandwidth())
    }