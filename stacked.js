/////////////////////////////////////////////////////////////////////////////////////////

var stacked_dataset;

var stackedFirstCause = -1;

var stacked = { width: STACKED_WIDTH - STACKED_LEFT - STACKED_RIGHT, height: STACKED_HEIGHT - STACKED_TOP - STACKED_BOTTOM };

// STACKED SETUP ////////////////////////////////////////////////////////////////////////

var svg_stacked = d3.select('body')
    .select('#svgStacked')
    .attr('width', STACKED_WIDTH + STACKED_LEFT + STACKED_RIGHT)
    .attr('height', STACKED_HEIGHT + STACKED_TOP + STACKED_BOTTOM)

stacked_g = svg_stacked.append("g").attr("transform", "translate(" + STACKED_LEFT + "," + (STACKED_TOP - 25) + ")"); //space for label

info_g = svg_stacked.append("g").attr("transform", "translate(" + STACKED_WIDTH + "," + (STACKED_HEIGHT / 3) + ")");

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
    const yCopy = stacked_y.domain(stacked_dataset.sort(sortFn).map(d => d.occupation)).copy();

    var groups;
    if (stackedFirstCause !== -1) {
        groups = d3.selectAll("g.bar-group")
        .data(d3.stack().keys(causes).order(getStackedOrder)(stacked_dataset))
        .attr("fill", function (d) { return stacked_z(d.key); });
    } else {
        groups = d3.selectAll("g.bar-group")
        .data(d3.stack().keys(causes).order(d3.stackOrderAscending)(stacked_dataset))
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
        .data(d3.stack().keys(causes).order(d3.stackOrderAscending)(stacked_dataset))
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

        info_g.append("rect")
            .attr("width", STACKED_WIDTH / 3 + 90)
            .attr("height", STACKED_HEIGHT / 2)
            .attr('stroke', 'white')
            .attr('stroke-width', '5')
            .attr('fill', 'black')
      
        // text for total rate
        info_g.append("text")
            .attr('id', 'info-1')
            .attr("x", 20)
            .attr("y", 50)
            .attr('class', 'stacked_text_info')
            .style('fill', 'white')
            .style('opacity', 1)
            .text("Text text text.") 
        // text for transportation
        info_g.append("text")
            .attr('id', 'info0')
            .attr("x", 20)
            .attr("y", 50)
            .attr('class', 'stacked_text_info')
            .style('fill', 'white')
            .style('opacity', 0)
            .text("More more more")
}

// add the axis
function drawStackedAxis() {

    stacked_g.append("g")
        .attr("class", "axis")
        .call(d3.axisBottom(stacked_x))
        .attr("transform", "translate(0," + STACKED_HEIGHT + ")")
        .append('text') // X-axis Label
            .attr('y', 40)
            .attr('x', STACKED_WIDTH / 2)
            .attr('dy', '.71em')
            .style("text-anchor", "middle")
            .style("font-family", 'Lora')
            .style("font-size", "20px")
            .style('fill', 'white')
            .style('opacity', '1')
            .style('font-weight', '900')
            .text("Fatal Injuries per 100k");

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

function drawStackedButtons() {

    var spaceBetweenCentres = (DEVICE_WIDTH+SCATTER_LEFT+SCATTER_RIGHT-100) / 9;
    var sizeOfBtn = spaceBetweenCentres / 3

    function clickStackedButton(justSelected) {
        //if the btn just clicked is different to the currently selected, fade currently selected
        var fadeLabel = (stackedFirstCause === -1) ? '#f_total_rate' : '#' + causes[stackedFirstCause];
        var visLabel = (justSelected === stackedFirstCause) ? '#f_total_rate' : '#' + causes[justSelected];

        d3.select(fadeLabel + '_btn') // old button
            .transition()
            .duration(100)
            .attr('opacity', 0.5)
            .attr('r', sizeOfBtn)

        d3.select(visLabel + '_btn') // new button
            .transition()
            .duration(100)
            .attr('opacity', 1)
            .attr('r', sizeOfBtn * 1.1)

        d3.selectAll(fadeLabel + '_lbl') // old label
            .transition()
            .duration(100)
            .style('opacity', 0.5)

        d3.selectAll(visLabel + '_lbl') // new label
            .transition()
            .duration(100)
            .style('opacity', 1)
            .attr('r', sizeOfBtn * 1.1)


        // info 
        var t0 = d3.transition().duration(800);
        t0.select('#info' + stackedFirstCause)
            .style('opacity', 0)
            
        var t1 = t0.transition();
        t1.select('#info' + justSelected)
            .style('opacity', 1)

        // sort chart - no need to fade button, will already have been done on mouseOverButton
        sortStackedBar((stackedFirstCause !== justSelected) ? justSelected : -1)

    }

    function mouseOverStackedButton(num) {
        var field = (num === -1) ? '#f_total_rate' : '#' + causes[num];
        // button
        d3.select(field + '_stacked_btn')
            .transition()
            .duration(100)
            .attr('opacity', 1)
            .attr('r', sizeOfBtn * 1.1)
        // label
        d3.selectAll(field + '_stacked_lbl')
            .transition()
            .duration(100)
            .style('opacity', 1)
    }

    function mouseOutStackedButton(num) {
        var field = (num === -1) ? '#f_total_rate' : '#' + causes[num];
        // button
        d3.select(field + '_stacked_btn')
            .transition()
            .duration(100)
            .attr('opacity', function () {
                return (stackedFirstCause == num) ? 1 : 0.5;
            })
            .attr('r', function () {
                return (stackedFirstCause == num) ? sizeOfBtn * 1.1 : sizeOfBtn
            })
        // label
        d3.selectAll(field + '_stacked_lbl')
            .transition()
            .duration(100)
            .style('opacity', function () {
                return (stackedFirstCause == num) ? 1 : 0.5;
            })

    }


    var buttonGroup = d3.select('body')
        .select('#svgStackedSortButton')
        .attr('width', STACKED_WIDTH + STACKED_LEFT + STACKED_RIGHT)
        .attr("class", "background") // SVG BACKGROUND COLOUR

    // Add first for total
    buttonGroup.append('circle')
        .attr('id', 'f_total_rate_stacked_btn')
        .attr('cx', spaceBetweenCentres - (0.5 * sizeOfBtn))
        .attr('cy', 80)
        .attr('r', sizeOfBtn * 1.1)
        .attr('opacity', '1')
        .attr('stroke', 'white')
        .attr('stroke-width', '3')
        .attr('fill', 'white')
        .on("click", function () { clickStackedButton(-1) })
        .on('mouseover', function () { mouseOverStackedButton(-1) })
        .on('mouseout', function () { mouseOutStackedButton(-1) })
    buttonGroup.append('text')
        .attr('id', 'f_total_rate_stacked_lbl')
        .attr('x', spaceBetweenCentres - (0.5 * sizeOfBtn))
        .attr('y', '200')
        .attr("text-anchor", "middle")
        .style("font-family", 'Lora')
        .style("font-size", "25px")
        .style('fill', 'white')
        .style('opacity', '1')
        .style('font-weight', '900')
        .text("Total")
    buttonGroup.append('text')
        .attr('id', 'f_total_rate_stacked_lbl')
        .attr('x', spaceBetweenCentres - (0.5 * sizeOfBtn))
        .attr('y', '230')
        .attr("text-anchor", "middle")
        .style("font-family", 'Lora')
        .style("font-size", "25px")
        .style('fill', 'white')
        .style('opacity', '1')
        .style('font-weight', '900')
        .text("Fatalities")


    // add the rest
    for (let index = 0; index < 7; index++) {
        var field = '#' + causes[index] + '_btn';
        buttonGroup.append('circle')
            .attr('id', causes[index] + '_stacked_btn')
            .attr('cx', (2 * spaceBetweenCentres) + (index * spaceBetweenCentres) - (0.5 * sizeOfBtn))
            .attr('cy', '80')
            .attr('r', sizeOfBtn)
            .attr('opacity', '0.5')
            .attr('stroke', STACK_COLOURS[index])
            .attr('stroke-width', '3')
            .attr('fill', STACK_COLOURS[index])
            .on("click", function () { clickStackedButton(index) })
            .on('mouseover', function () { mouseOverStackedButton(index) })
            .on('mouseout', function () { mouseOutStackedButton(index) })
        buttonGroup.append('text')
            .attr('id', causes[index] + '_stacked_lbl')
            .attr('x', 2 * spaceBetweenCentres + (index * spaceBetweenCentres) - (0.5 * sizeOfBtn))
            .attr('y', '200')
            .attr("text-anchor", "middle")
            .style("font-family", 'Lora')
            .style("font-size", "25px")
            .style("font-family", 'Lora')
            .style("font-size", "25px")
            .style('fill', 'white')
            .style('opacity', '0.5')
            .style('font-weight', '900')
            .text(READABLE_CAUSES_TOP[index])
        buttonGroup.append('text')
            .attr('id', causes[index] + '_stacked_lbl')
            .attr('x', 2 * spaceBetweenCentres + (index * spaceBetweenCentres) - (0.5 * sizeOfBtn))
            .attr('y', '230')
            .attr("text-anchor", "middle")
            .style("font-family", 'Lora')
            .style("font-size", "25px")
            .style("font-family", 'Lora')
            .style("font-size", "25px")
            .style('fill', 'white')
            .style('opacity', '0.5')
            .style('font-weight', '900')
            .text(READABLE_CAUSES_BOTTOM[index])
    }

}