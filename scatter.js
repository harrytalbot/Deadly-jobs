
/// SCATTER SETUP ///////////////////////////////////////////////////////////////////////

var svg_scatter = d3.select('body')
    .select('#svgScatter')
    .attr('width', SCATTER_WIDTH + SCATTER_LEFT + SCATTER_RIGHT)
    .attr('height', SCATTER_HEIGHT + SCATTER_TOP + SCATTER_BOTTOM)
    .attr("class", "background"); // SVG BACKGROUND COLOUR

scatter_g = svg_scatter.append("g").attr("transform", "translate(" + SCATTER_LEFT + "," + SCATTER_TOP + ")");

// set scatter y scale
var scatter_y = d3.scaleLinear().range([SCATTER_HEIGHT, 0])
// set scatter x scale
var scatter_x = d3.scaleLinear().range([0, SCATTER_WIDTH])
// set the scatter_x colors                   
var scatter_z = d3.scaleLinear().range(["white", "steelblue"]);

var scatter_plotSize = d3.scaleLinear().range([4,8])

/////////////////////////////////////////////////////////////////////////////////////////

function drawScatterAxis() {
    // X-axis
    scatter_g.append('g')
        .attr("class", "axis")
        .call(d3.axisBottom(scatter_x))
        .attr('transform', 'translate(0,' + SCATTER_HEIGHT + ')')

        .append('text') // X-axis Label
            .attr('class', 'label')
            .attr('y', 40)
            .attr('x', SCATTER_WIDTH / 2)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text('Fatality per 100k')

    // Y-axis
    scatter_g.append('g')
        .attr("class", "axis")
        .call(d3.axisLeft(scatter_y))

        .append('text') // y-axis Label
            .attr('class', 'label')
            .attr('x', -(SCATTER_HEIGHT / 2))
            .attr('transform', 'rotate(-90)')
            .attr('y', -40)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text('Injury per 100k')
}

function drawScatterPlot() {

    var circles = scatter_g.selectAll('circle')
        .data(dataset)
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
                return d.occupation +
                    '\nReturn: ' + d.nf_total_rate +
                    '\nStd. Dev.: ' + d.f_total_rate
            })
}

