/////////////////////////////////////////////////////////////////////////////////////////

var stackedFirstCause = -1;

var stacked = { width: STACKED_WIDTH - STACKED_LEFT - STACKED_RIGHT, height: STACKED_HEIGHT - STACKED_TOP - STACKED_BOTTOM };

// STACKED SETUP ////////////////////////////////////////////////////////////////////////

var svg_stacked = d3.select('body')
    .select('#svgStacked')
    .attr('width', STACKED_WIDTH + STACKED_LEFT + STACKED_RIGHT)
    .attr('height', STACKED_HEIGHT + STACKED_TOP + STACKED_BOTTOM)
    .attr("class", "background"); // SVG BACKGROUND COLOUR

stacked_g = svg_stacked.append("g").attr("transform", "translate(" + STACKED_LEFT + "," + STACKED_TOP + ")");

// set stacked y scale
stacked_y = d3.scaleBand().range([0, STACKED_HEIGHT])
// set stacked x scale
stacked_x = d3.scaleLinear().range([0, STACKED_WIDTH]);
// set the stacked colors                   
stacked_z = d3.scaleOrdinal().range(STACK_COLOURS);

/////////////////////////////////////////////////////////////////////////////////////////

// return a stack order, using the currently selected firstCause
function getStackedOrder(data) {
    var orderNew = [+0, +1, +2, +3, +4, +5, +6];
    if (stackedFirstCause === -1) { return orderNew }
    orderNew.splice(stackedFirstCause, 1);
    orderNew.unshift(stackedFirstCause);
    return orderNew;
}

// update the stacked bar, sorting by a specific cause and running transitions
function sortStackedBar(fCause) {
    stackedFirstCause = fCause;

    var sortFn;
    // define the sort function
    if (stackedFirstCause !== -1) {
        sortFn = (a, b) => d3.descending(a[causes[stackedFirstCause]], b[causes[stackedFirstCause]]);
    } else {
        sortFn = (a, b) => d3.descending(a.f_total_rate, b.f_total_rate);
    }
    // sort the y domain by the chosen cause using sortFn
    const yCopy = stacked_y.domain(dataset.sort(sortFn).map(d => d.occupation)).copy();

    var groups;
    if (stackedFirstCause !== -1) {
        groups = d3.selectAll("g.bar-group")
        .data(d3.stack().keys(causes).order(getStackedOrder)(dataset))
        .attr("fill", function (d) { return stacked_z(d.key); });
    } else {
        groups = d3.selectAll("g.bar-group")
        .data(d3.stack().keys(causes).order(d3.stackOrderAscending)(dataset))
        .attr("fill", function (d) { return stacked_z(d.key); });

    }

    const bars = groups.selectAll(".bar")
        .data(d => d, d => d.data.occupation)
        .sort((a, b) => yCopy(a.data.occupation) - yCopy(b.data.occupation))

    // define what will do the transition
    var t0 = d3.transition().duration(1000);

    // fade out unselected
    t0.selectAll("g.bar-group")
        .duration(1000)
        .attr("opacity", function (d) {
            return (d.key !== causes[stackedFirstCause] && stackedFirstCause !== -1) ? 0.25 : 1;
        })

    var t1 = t0.transition();
    // sort order of stack
    t1.selectAll("g.bar-group")
        .selectAll(".bar")
        .attr("x", function (d) {
            return stacked_x(d[0]);
        })

    var t2 = t1.transition();
    // sort data y axis - needs seperate transition so stack sort happens first
    t2.selectAll("g.bar-group")
        .selectAll(".bar")
        .attr("y", function (d) { return yCopy(d.data.occupation) })

    // sort label y axis
    t2.selectAll(".axisStackedY")
        .call(d3.axisLeft(stacked_y))
        .selectAll("g")
}

// initially draw the chart
function drawStackedChart() {
    stacked_g.append("g")
        .selectAll("g")
        .data(d3.stack().keys(causes).order(d3.stackOrderAscending)(dataset))
        .enter().append("g")
        .classed("bar-group", true)
        .attr("fill", function (d) { return stacked_z(d.key); })
        .attr("opacity", 1) // so first fade animation is smooth
        .selectAll("rect")
        .data(function (d) { return d; })
        .enter().append("rect")
        .classed("bar", true)
        .attr("y", function (d) {
            return stacked_y(d.data.occupation);
        })
        .attr("x", function (d) {
            return stacked_x(d[0]);
        })
        .attr("width", function (d) {
            return stacked_x(d[1]) - stacked_x(d[0]);
        })
        .attr("height", stacked_y.bandwidth())
}

// add the axis
function drawStackedAxis() {

    stacked_g.append("g")
        .attr("class", "axis")
        .call(d3.axisBottom(stacked_x))
        .attr("transform", "translate(0," + STACKED_HEIGHT + ")")


    stacked_g.append("g")
        .attr("class", "axisStackedY")
        .call(d3.axisLeft(stacked_y))

}

// add the legend
function drawStackedLegend() {
    var legend = stacked_g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(causes.slice().reverse())
        .enter().append("g")
        .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", STACKED_WIDTH - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", stacked_z);

    legend.append("text")
        .attr("x", STACKED_WIDTH - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .attr("fill", 'white')
        .text(function (d) { return d; });
}

function drawButtons() {

    var spaceBetweenCentres = DEVICE_WIDTH / 9;
    var sizeOfBtn = spaceBetweenCentres / 3

    function clickButton(num) {
        //if the btn just clicked is different to the currently selected, fade currently selected
        if (stackedFirstCause !== num) {
            var field = (stackedFirstCause === -1) ? '#f_total_rate' : '#' + causes[stackedFirstCause];
            // button
            d3.select(field + '_btn') // old
                .transition()
                .duration(100)
                .attr('opacity', 0.5)
                .attr('r', sizeOfBtn)
            d3.select(causes[num] + '_btn') // resize new
                .attr('r', sizeOfBtn * 1.1)
            // label
            d3.select(field + '_lbl') // old
                .transition()
                .duration(100)
                .style('opacity', 0.5)
        }
        // sort chart - no need to fade button, will already have been done on mouseOverButton
        sortStackedBar(num)
    }

    function mouseOverButton(num) {
        var field = (num === -1) ? '#f_total_rate' : '#' + causes[num];
        // button
        d3.select(field + '_btn')
            .transition()
            .duration(100)
            .attr('opacity', 1)
            .attr('r', sizeOfBtn * 1.1)
        // label
        d3.select(field + '_lbl')
            .transition()
            .duration(100)
            .style('opacity', 1)
    }

    function mouseOutButton(num) {
        var field = (num === -1) ? '#f_total_rate' : '#' + causes[num];
        // button
        d3.select(field + '_btn')
            .transition()
            .duration(100)
            .attr('opacity', function () {
                return (stackedFirstCause == num) ? 1 : 0.5;
            })
            .attr('r', function () {
                return (stackedFirstCause == num) ? sizeOfBtn * 1.1 : sizeOfBtn
            })
        // label
        d3.select(field + '_lbl')
            .transition()
            .duration(100)
            .style('opacity', function () {
                return (stackedFirstCause == num) ? 1 : 0.5;
            })

    }


    var buttonGroup = d3.select('body')
        .select('#svgSortButton')
        .attr('width', STACKED_WIDTH + STACKED_LEFT + STACKED_RIGHT)
        .attr("class", "background") // SVG BACKGROUND COLOUR

    // Add first for total
    buttonGroup.append('circle')
        .attr('id', 'f_total_rate_btn')
        .attr('cx', spaceBetweenCentres - (0.5 * sizeOfBtn))
        .attr('cy', '150')
        .attr('r', sizeOfBtn)
        .attr('opacity', '1')
        .attr('stroke', 'white')
        .attr('stroke-width', '3')
        .attr('fill', 'white')
        .on("click", function () { clickButton(-1) })
        .on('mouseover', function () { mouseOverButton(-1) })
        .on('mouseout', function () { mouseOutButton(-1) })
    buttonGroup.append('text')
        .attr('id', 'f_total_rate_lbl')
        .style('fill', 'white')
        .style('opacity', '1')
        .attr('x', spaceBetweenCentres - (0.5 * sizeOfBtn))
        .attr('y', '250')
        .attr("text-anchor", "middle")
        .style("font-family", 'Lora')
        .style("font-size", "25px")
        .text("Total Fatalities")

    // add the rest
    for (let index = 0; index < 7; index++) {
        var field = '#' + causes[index] + '_btn';
        buttonGroup.append('circle')
            .attr('id', causes[index] + '_btn')
            .attr('cx', 2 * spaceBetweenCentres + (index * spaceBetweenCentres) - (0.5 * sizeOfBtn))
            .attr('cy', '150')
            .attr('r', sizeOfBtn)
            .attr('opacity', '0.5')
            .attr('stroke', STACK_COLOURS[index])
            .attr('stroke-width', '3')
            .attr('fill', STACK_COLOURS[index])
            .on("click", function () { clickButton(index) })
            .on('mouseover', function () { mouseOverButton(index) })
            .on('mouseout', function () { mouseOutButton(index) })
        buttonGroup.append('text')
            .attr('id', causes[index] + '_lbl')
            .style('fill', 'white')
            .style('opacity', '0.5')
            .attr('x', 2 * spaceBetweenCentres + (index * spaceBetweenCentres) - (0.5 * sizeOfBtn))
            .attr('y', '250')
            .attr("text-anchor", "middle")
            .style("font-family", 'Lora')
            .style("font-size", "25px")
            .text(READABLE_CAUSES[index])
    }

}