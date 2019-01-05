/////////////////////////////////////////////////////////////////////////////////////////

var simpleBar_dataset;

var simpleBar_tooltip;

var simpleBarFirstCause = -1;

var simpleBar = { width: SIMPLEBAR_WIDTH - SIMPLEBAR_LEFT - SIMPLEBAR_RIGHT, height: SIMPLEBAR_HEIGHT - SIMPLEBAR_TOP - SIMPLEBAR_BOTTOM };

// SIMPLEBAR SETUP ////////////////////////////////////////////////////////////////////////

var svg_simpleBar = d3.select('body')
    .select('#svgSingleBar')
    .attr('width', SIMPLEBAR_WIDTH + SIMPLEBAR_LEFT + SIMPLEBAR_RIGHT)
    .attr('height', SIMPLEBAR_HEIGHT + SIMPLEBAR_TOP + SIMPLEBAR_BOTTOM)

simpleBar_g = svg_simpleBar.append("g").attr("transform", "translate(" + SIMPLEBAR_LEFT + "," + (SIMPLEBAR_TOP - 25) + ")"); //space for label

info_g = svg_simpleBar.append("g").attr("transform", "translate(" + SIMPLEBAR_WIDTH + "," + (SIMPLEBAR_HEIGHT / 3) + ")");


// set simpleBar y scale
simpleBar_y = d3.scaleBand().range([0, SIMPLEBAR_HEIGHT])
// set simpleBar x scale
simpleBar_x = d3.scaleLinear().range([0, SIMPLEBAR_WIDTH]);
// set the simpleBar colors                   
simpleBar_z = d3.scaleOrdinal().range(STACK_COLOURS_EXTRA);

/////////////////////////////////////////////////////////////////////////////////////////

// initially draw the chart
function drawSimpleBarChart() {
    simpleBar_g.append("g")
        .selectAll("g")
        .data(d3.stack().keys(SIMPLE_CAUSES)(simpleBar_dataset))
        .enter().append("g")
            .classed("simple-bar-group", true)
            .attr("fill", function (d) { return simpleBar_z(d.key); })
            .attr("opacity", 1) // so first fade animation is smooth
        .selectAll("rect")
        .data(function (d) { return d; })
        .enter().append("rect")
            .classed("bar", true)
            .attr("y", function (d) {
                return simpleBar_y(d.data.outcome);
            })
            .attr("x", function (d) {
                return simpleBar_x(d[0]);
            })
            .attr("width", function (d) {
                return simpleBar_x(d[1]) - simpleBar_x(d[0]);
            })
            .attr("height", simpleBar_y.bandwidth())
            .on("mouseover", function (d) {
                fadeInSimpleBar("#simple_bar_label", 1, d); // ALREADY DEFINED IN VERSUS
            })
            .on("mouseout", function (d, i) {
                console.log(d)
                var id = '#simple_bar_label_' + d3.format(".3n")(d[1] - d[0])
                fadeOutSimpleBar(id, 0, d);
            });
        
    simpleBar_g.append("g")
        .selectAll("g")
        .data(d3.stack().keys(SIMPLE_CAUSES)(simpleBar_dataset))
        .enter().append("g")
            .classed("simple-bar-group", true)
            .attr("fill", function (d) { return simpleBar_z(d.key); })
            .attr("opacity", 1) // so first fade animation is smooth
        .selectAll("rect")
        .data(function (d) { return d; })
        .enter().append("text")
            .attr('id', function (d) {
                'simple_bar_label_' + d3.format(".3n")(d[1] - d[0])
            }) //use the valu
            .text(function (d) { return d3.format(".3n")(d[1] - d[0])})
            .attr("x", function (d) {
                return simpleBar_x(d[0]) + ((simpleBar_x(d[1]) - simpleBar_x(d[0])) / 2)
            })
            .attr("y", function (d) {
                var offset = (d.data.outcome === 'Fatal') ? -50 : +100
                return (simpleBar_y(d.data.outcome) + offset);
            })
            .style("text-anchor", "middle")
            .attr("dy", ".75em")
            .attr('class', 'simple_text_info')
            .attr("font-family", "sans-serif")
            .attr("font-size", "15px")
            .attr("font-weight", "bold")
            .attr("fill", "white")
            .style('opacity', 1)
        }

function fadeOutSimpleBar(tag, opacity, d) {
    d3.selectAll(tag)
        .filter(function (e) { return e.data !== d.data; })
        .transition()
        .style("opacity", opacity);
}

function fadeInSimpleBar(tag, opacity, d) {
    d3.selectAll(tag)
        .filter(function (e) { return e.data === d.data; })
        .transition()
        .style("opacity", opacity);
}

// add the axis
function drawSimpleBarAxis() {

    simpleBar_g.append("g")
        .attr("class", "axis")
        .call(d3.axisBottom(simpleBar_x))
        .attr("transform", "translate(0," + SIMPLEBAR_HEIGHT + ")")
        .append('text') // X-axis Label
            .attr('y', 40)
            .attr('x', SIMPLEBAR_WIDTH / 2)
            .attr('dy', '.71em')
            .style("text-anchor", "middle")
            .style("font-family", 'Lora')
            .style("font-size", "20px")
            .style('fill', 'white')
            .style('opacity', '1')
            .style('font-weight', '900')
            .text("Cause of accident (%)");

    //simpleBar_g.append("g")
    //    .attr("class", "axisStackedY")
    //    .call(d3.axisLeft(simpleBar_y))

}
