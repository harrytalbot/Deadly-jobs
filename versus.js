/////////////////////////////////////////////////////////////////////////////////////////

var versus_dataset;

var versus = { width: VERSUS_WIDTH - VERSUS_LEFT - VERSUS_RIGHT, height: VERSUS_HEIGHT - VERSUS_TOP - VERSUS_BOTTOM };

var versus_y_labels;

var versusSortField = 'f_total_rate'


// VERSUS SETUP ////////////////////////////////////////////////////////////////////////

var svg_versus = d3.select('body')
    .select('#svgVersus')
    .attr('width', VERSUS_WIDTH + VERSUS_LEFT + VERSUS_RIGHT)
    .attr('height', VERSUS_HEIGHT + VERSUS_TOP + VERSUS_BOTTOM )

versus_g_nonfatal = svg_versus.append("g").attr("transform", "translate(" + (VERSUS_LEFT + (VERSUS_WIDTH /2)) + "," + (VERSUS_TOP - 20) + ")");

versus_g_fatal = svg_versus.append("g").attr("transform", "translate(" + (VERSUS_LEFT + (VERSUS_WIDTH /2)) + "," + (VERSUS_TOP - 20) + ")");

const VERSUS_GAP_HALF = 235;

// set versus y scale
versus_y = d3.scaleBand().range([0, VERSUS_HEIGHT])

// set versus x scale
versus_x_fatal = d3.scaleLinear().range([0, VERSUS_WIDTH / 3]);
versus_x_nonfatal = d3.scaleLinear().range([-1 * VERSUS_WIDTH / 3, 0 ])
// set the versus colors                   
versus_z = d3.scaleOrdinal().range(STACK_COLOURS);

/////////////////////////////////////////////////////////////////////////////////////////

// initially draw the chart
function drawVersusChart() {

    var fatalTotal = 0;
    var nonFatalTotal = 0;
    var numBars = 0;
    
    // bars
    versus_g_fatal.append("g")
        .attr("fill", FATAL_COLOUR)
        .selectAll("g")
        .data(versus_dataset)
        .enter().append("rect")
            .attr('id', 'versus_rect')
            .classed("bar", true)
            .attr("class", "bar")
            .attr("y", function (d) {
                return versus_y(d.occupation);
            })
            .attr("x", function (d) {
                
                return versus_x_fatal(0) + VERSUS_GAP_HALF;
            })
            .attr("width", function (d) {
                fatalTotal += d.f_total_rate;
                numBars++;
                return versus_x_fatal(d.f_total_rate);
            })
            .attr("height", versus_y.bandwidth())
            .on("mouseover", function (d) {
                // make all bars opaque
                fadeOutVersus('#versus_rect', .2, d);
                fadeInVersus("#versus_bar_label", 1, d);
                d3.selectAll('#versus_average_text').transition().style("opacity", 0.2);
            })
            .on("mouseout", function (d) {
                fadeOutVersus('#versus_rect', 1, d);
                fadeInVersus("#versus_bar_label", 0, d);
                d3.selectAll('#versus_average_text').transition().style("opacity", 1);


            });

    versus_g_fatal.append("g")
        .selectAll("g")
        .data(versus_dataset)
        .enter()
        .append("text")
            .attr('id', 'versus_bar_label')
            .text(function (d) { return fatalFormatter(d.f_total_rate) + " | " + d.f_total })
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
        .attr("fill", NONFATAL_COLOUR)
        .selectAll("g")
        .data(versus_dataset)
        .enter().append("rect")
            .attr('id', 'versus_rect')
            .classed("bar", true)
            .attr("y", function (d) {
                return versus_y(d.occupation);
            })
            .attr("x", function (d) {
                return versus_x_nonfatal(-d.nf_total_rate) - VERSUS_GAP_HALF;
            })
            .attr("width", function (d) {
                nonFatalTotal += d.nf_total_rate;
                return versus_x_nonfatal(d.nf_total_rate);
            })
            .attr("height", versus_y.bandwidth())
            .on("mouseover", function (d) {
                fadeOutVersus('#versus_rect', .2, d);
                fadeInVersus("#versus_bar_label", 1, d);
                d3.selectAll('#versus_average_text').transition().style("opacity", 0.2);
            })
            .on("mouseout", function (d) {
                fadeOutVersus('#versus_rect', 1, d);
                fadeInVersus("#versus_bar_label", 0, d);
                d3.selectAll('#versus_average_text').transition().style("opacity", 1);
            });

    versus_g_nonfatal.append("g")
        .selectAll("g")
        .data(versus_dataset)
        .enter()
        .append("text")
            .attr('id', 'versus_bar_label')
            .text(function (d) { return nonFatalFormatter(d.nf_total_rate) + " | " + d.nf_total})
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
    

    // avg lines
    versus_g_fatal.append("line")
        .attr('id', 'versus_fatal_average_line')
        .attr('class', 'versus_average_text')
        .style("stroke", "white")
        .attr('stroke-width', '3')
        .attr('opacity', 0.5)
        .attr("x1", versus_x_fatal(fatalTotal / numBars) + VERSUS_GAP_HALF)
        .attr("y1", 0)
        .attr("x2", versus_x_fatal(fatalTotal / numBars) + VERSUS_GAP_HALF)
        .attr("y2", VERSUS_HEIGHT);
    
    versus_g_fatal.append("text")
        //.attr("x", versus_x_fatal(fatalTotal / numBars) + VERSUS_GAP_HALF)
        //.attr("y", VERSUS_HEIGHT)
        .attr('id', 'versus_average_text')
        .attr('class', 'versus_average_text')
        .attr("transform", "translate("+ (versus_x_fatal(fatalTotal / numBars) + VERSUS_GAP_HALF + 10) + ","+ (VERSUS_HEIGHT- 10) + ")")
        .text("Average: " +  fatalFormatter(fatalTotal / numBars))
        .attr("font-family", "Lora")
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .attr("fill", "white")

        // avg lines
    versus_g_nonfatal.append("line")
        .attr('id', 'versus_nonfatal_average_line')
        .attr('class', 'versus_average_text')
        .style("stroke", "white")
        .attr('stroke-width', '3')
        .attr('opacity', 0.5)
        .attr("x1", -versus_x_nonfatal(nonFatalTotal / numBars) - VERSUS_GAP_HALF)
        .attr("y1", 0)
        .attr("x2", -versus_x_nonfatal(nonFatalTotal / numBars) - VERSUS_GAP_HALF)
        .attr("y2", VERSUS_HEIGHT);

    versus_g_nonfatal.append("text")
        //.attr("x", versus_x_fatal(fatalTotal / numBars) + VERSUS_GAP_HALF)
        //.attr("y", VERSUS_HEIGHT)
        .attr('id', 'versus_average_text')
        .attr('class', 'versus_average_text')
        .attr("transform", "translate("+ (-versus_x_nonfatal(nonFatalTotal / numBars) - VERSUS_GAP_HALF - 10) + ","+ (VERSUS_HEIGHT - 10) + ")")
        .text("Average: " + nonFatalFormatter(nonFatalTotal / numBars) )
        .attr("font-family", "Lora")
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .attr("fill", "white")
        .attr("text-anchor", "end")
}

function drawVersusButtons() {

    var spaceBetweenCentres = (VERSUS_LEFT + VERSUS_RIGHT) * .8;
    var sizeOfBtn = (spaceBetweenCentres / 3)
    var CY = 140;
    var firstLine = CY + sizeOfBtn + 50;
    var secondLine = firstLine + 45;

    function clickVersusButton(justSelected) {
        //if the btn just clicked is different to the currently selected, fade currently selected
        var fadeLabel = versusSortField
        var visLabel = justSelected;

        if (justSelected == versusSortField) { return;}

        d3.select('#' + fadeLabel + '_versus_btn') // old button
            .transition()
            .duration(100)
            .attr('opacity', BUTTON_FADED)
            .attr('r', sizeOfBtn)

        d3.select('#' + visLabel + '_versus_btn') // new button
            .transition()
            .duration(100)
            .attr('opacity', 1)
            .attr('r', sizeOfBtn * 1.1)

        d3.selectAll('#' + fadeLabel + '_versus_lbl') // old label
            .transition()
            .duration(100)
            .style('opacity', BUTTON_FADED)

        d3.selectAll('#' + visLabel + '_versus_lbl') // new label
            .transition()
            .duration(100)
            .style('opacity', 1)
            .attr('r', sizeOfBtn * 1.1)

        sortVersus(justSelected)

    }

    function mouseOverVersusButton(field) {
        // button
        d3.select('#' + field + '_versus_btn')
            .transition()
            .duration(100)
            .attr('opacity', 1)
            .attr('r', sizeOfBtn * 1.1)
        // label
        d3.selectAll('#' + field + '_versus_lbl')
            .transition()
            .duration(100)
            .style('opacity', 1)
    }

    function mouseOutVersusButton(field) {
        d3.select('#' + field + '_versus_btn')
            .transition()
            .duration(100)
            .attr('opacity', function () {
                return (versusSortField == field) ? 1 : BUTTON_FADED;
            })
            .attr('r', function () {
                return (versusSortField == field) ? sizeOfBtn * 1.1 : sizeOfBtn
            })
        // label
        d3.selectAll('#' + field + '_versus_lbl')
            .transition()
            .duration(100)
            .style('opacity', function () {
                return (versusSortField == field) ? 1 : BUTTON_FADED;
            })

    }


    var button_x_offset = 0; //VERSUS_WIDTH / 5 * 4;

    var buttonGroup = d3.select('body')
        .select('#svgVersusSortButton')
        .attr('width', VERSUS_WIDTH + VERSUS_LEFT + VERSUS_RIGHT)
        .attr('height', secondLine )
        .attr("transform", "translate(" + (VERSUS_WIDTH / 5 * 4 * 0 ) + ",0)")
        //.attr("class", "background") // SVG BACKGROUND COLOUR

     // Add first for fatal
    buttonGroup.append('circle')
     .attr('id', 'nf_total_rate_versus_btn')
     .attr('cx', spaceBetweenCentres - (0.5 * sizeOfBtn) + button_x_offset)
     .attr('cy', CY)
     .attr('r', sizeOfBtn * 1.1)
     .attr('opacity', BUTTON_FADED)
     .attr('stroke', NONFATAL_COLOUR)
     .attr('stroke-width', '3')
     .attr('fill', NONFATAL_COLOUR)
     .on("click", function () { clickVersusButton('nf_total_rate') })
     .on('mouseover', function () { mouseOverVersusButton('nf_total_rate') })
     .on('mouseout', function () { mouseOutVersusButton('nf_total_rate') })
 buttonGroup.append('text')
     .attr('id', 'nf_total_rate_versus_lbl')
     .attr('x', spaceBetweenCentres - (0.5 * sizeOfBtn) + button_x_offset)
     .attr('y', firstLine)
     .attr("text-anchor", "middle")
     .style("font-family", 'Lora')
     .style("font-size", "35px")
     .style('fill', 'white')
     .style('opacity', BUTTON_FADED)
     .style('font-weight', '900')
     .text("Sort by")
 buttonGroup.append('text')
     .attr('id', 'nf_total_rate_versus_lbl')
     .attr('x', spaceBetweenCentres - (0.5 * sizeOfBtn) + button_x_offset)
     .attr('y', secondLine)
     .attr("text-anchor", "middle")
     .style("font-family", 'Lora')
     .style("font-size", "35px")
     .style('fill', 'white')
     .style('opacity', BUTTON_FADED)
     .style('font-weight', '900')
     .text("Non-Fatal")


    // Add first for fatal
    buttonGroup.append('circle')
        .attr('id', 'f_total_rate_versus_btn')
        .attr('cx', 2 * spaceBetweenCentres - (0.5 * sizeOfBtn) + button_x_offset)
        .attr('cy', CY)
        .attr('r', sizeOfBtn * 1.1)
        .attr('opacity', '1')
        .attr('stroke', FATAL_COLOUR)
        .attr('stroke-width', '3')
        .attr('fill', FATAL_COLOUR)
        .on("click", function () { clickVersusButton('f_total_rate') })
        .on('mouseover', function () { mouseOverVersusButton('f_total_rate') })
        .on('mouseout', function () { mouseOutVersusButton('f_total_rate') })
    buttonGroup.append('text')
        .attr('id', 'f_total_rate_versus_lbl')
        .attr('x', 2 * spaceBetweenCentres - (0.5 * sizeOfBtn) + button_x_offset)
        .attr('y', firstLine)
        .attr("text-anchor", "middle")
        .style("font-family", 'Lora')
        .style("font-size", "35px")
        .style('fill', 'white')
        .style('opacity', '1')
        .style('font-weight', '900')
        .text("Sort by")
    buttonGroup.append('text')
        .attr('id', 'f_total_rate_versus_lbl')
        .attr('x', 2 * spaceBetweenCentres - (0.5 * sizeOfBtn) + button_x_offset)
        .attr('y', secondLine)
        .attr("text-anchor", "middle")
        .style("font-family", 'Lora')
        .style("font-size", "35px")
        .style('fill', 'white')
        .style('opacity', '1')
        .style('font-weight', '900')
        .text("Fatal")

   

}

function fadeOutVersus(tag, opacity, d) {
    d3.selectAll(tag)
        .filter(function (e) { return e !== d; })
        .transition()
        .style("opacity", opacity);
}

function fadeInVersus(tag, opacity, d) {
    d3.selectAll(tag)
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
        .attr('id', 'versus_y_labels')
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

function sortVersus(side) {
    versus_dataset.sort(function (a, b) {
        return d3.descending(a[side], b[side])
    })

    versus_y.domain(versus_dataset.map(function (d) { return d.occupation; })).padding(0.2);

    var t0 = d3.transition('versus_transition').duration(1000);

    t0.selectAll("#versus_rect")
        .attr("y", function (d) {
            return versus_y(d.occupation);
        })
    t0.selectAll("#versus_bar_label")
        .attr("y", function (d) {
            return versus_y(d.occupation);
        })

    t0.selectAll("#versus_y_labels")
        .call(d3.axisLeft(versus_y))
    

    versusSortField = side;
}


