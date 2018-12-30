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
            .text("Fatal Injuries per 100k");

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
            .text("Non-Fatal Injuries per 100k");

}

function drawScatterPlot() {

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
            .on('mouseover', function () {
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
            })
}

