/////////////////////////////////////////////////////////////////////////////////////////

var stacked_dataset;

var stackedFirstCause = -1;
var stackedIndusty = '';
var stackedYTicks;

var stacked = { width: STACKED_WIDTH - STACKED_LEFT - STACKED_RIGHT, height: STACKED_HEIGHT - STACKED_TOP - STACKED_BOTTOM };

// STACKED SETUP ////////////////////////////////////////////////////////////////////////

var svg_stacked = d3.select('body')
    .select('#svgStacked')
    .attr('width', STACKED_WIDTH + STACKED_LEFT + STACKED_RIGHT)
    .attr('height', STACKED_HEIGHT + STACKED_TOP + STACKED_BOTTOM)

stacked_g = svg_stacked.append("g").attr("transform", "translate(" + STACKED_LEFT + "," + (STACKED_TOP - 25) + ")"); //space for label

info_g = svg_stacked.append("g").attr("transform", "translate(" + (STACKED_WIDTH -100)+ ",100)");

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
        sortFn = (a, b) => d3.descending(a[FATAL_CAUSE_RATES[stackedFirstCause]], b[FATAL_CAUSE_RATES[stackedFirstCause]]);
    } else {
        sortFn = (a, b) => d3.descending(a.f_total_rate, b.f_total_rate);
    }
    // sort the y domain by the chosen cause using sortFn
    const yCopy = stacked_y.domain(stacked_dataset.sort(sortFn).map(d => d.occupation)).copy();

    var groups;
    if (stackedFirstCause !== -1) {
        groups = d3.selectAll("g.stacked-bar-group")
        .data(d3.stack().keys(FATAL_CAUSE_RATES).order(getStackedOrder)(stacked_dataset))
        .attr("fill", function (d) { return stacked_z(d.key); });
    } else {
        groups = d3.selectAll("g.stacked-bar-group")
        .data(d3.stack().keys(FATAL_CAUSE_RATES).order(d3.stackOrderAscending)(stacked_dataset))
        .attr("fill", function (d) { return stacked_z(d.key); });

    }

    const bars = groups.selectAll(".bar")
        .data(d => d, d => d.data.occupation)
        .sort((a, b) => yCopy(a.data.occupation) - yCopy(b.data.occupation))

    // define what will do the transition
    var t0 = d3.transition('stackedSortFade').duration(1000);

    // fade out unselected
    t0.selectAll("g.stacked-bar-group")
        .duration(1000)
        .attr("opacity", function (d) {
            return (d.key !== FATAL_CAUSE_RATES[stackedFirstCause] && stackedFirstCause !== -1) ? 0.25 : 1;
        })

    var t1 = t0.transition('stackedSortStackOrder');
    // sort order of stack
    t1.selectAll("g.stacked-bar-group")
        .selectAll(".bar")
        .attr("x", function (d) {
            return stacked_x(d[0]);
        })

    var t2 = t1.transition('stackedSortOccupations');
    // sort data y axis - needs seperate transition so stack sort happens first
    t2.selectAll("g.stacked-bar-group")
        .selectAll(".bar")
        .attr("y", function (d) { return yCopy(d.data.occupation) })

    // sort label y axis
    t2.selectAll(".axisStackedY")
        .call(d3.axisLeft(stacked_y))
        .selectAll("g")
}

// initially draw the chart
function drawStackedChart() {

    const TOOLTIP_WIDTH = 600;
    const TOOLTIP_HEIGHT = 100;
    const TOOLTIP_ROW_HEIGHT = 30;
    // Prep the tooltip bits, initial display is hidden
    var tooltip = svg_stacked.append("g").attr('opacity', 0)

    tooltip.append("rect")
        .attr('id', 'stacked_tooltip_rect')
        .attr("x", -0.5 * TOOLTIP_WIDTH)
        .attr("width", TOOLTIP_WIDTH)
        .attr("height", 30 + (FATAL_CAUSE_RATES.length + 3) * TOOLTIP_ROW_HEIGHT)
        .attr('stroke', 'white')
        .attr('stroke-width', '5')
        .attr('fill', 'black')
    
    // avg lines
    tooltip.append("line")
        .style("stroke", "white")
        .attr('stroke-width', '3')
        .attr("x1", -0.5 * TOOLTIP_WIDTH + 10)
        .attr("y1", 45)
        .attr("x2", 0.5 * TOOLTIP_WIDTH - 10)
        .attr("y2", 45);


    tooltip.append("text")
        .attr("id", "stacked_tooltext_occ")
        .attr("x", (-0.5 * TOOLTIP_WIDTH) + 10)
        .attr("y", 5)
        .attr("dy", "1.2em")
        .style("text-anchor", "left")
        .attr('class', 'simple_text_info')
        .attr("font-family", "Lora")
        .attr("font-size", "25px")
        .attr("font-weight", "bold")
        .attr("fill", "white")
    tooltip.append("text")
        .attr("id", "stacked_tooltext_ind")
        .attr("x", (-0.5 * TOOLTIP_WIDTH) + 10)
        .attr("y", 45)
        .attr("dy", "1.2em")
        .style("text-anchor", "left")
        .attr('class', 'simple_text_info')
        .attr("font-family", "Lora")
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .attr("fill", "white")
    tooltip.append("text")
        .attr("id", "stacked_tooltext_tEmp")
        .attr("x", (-0.5 * TOOLTIP_WIDTH) + 10)
        .attr("y", 75)
        .attr("dy", "1.2em")
        .style("text-anchor", "left")
        .attr('class', 'simple_text_info')
        .attr("font-family", "Lora")
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .attr("fill", "white")

    for (let index = 0; index < FATAL_CAUSE_RATES.length; index++) {
        tooltip.append("text")
            .attr("id", "stacked_tooltext_" + FATAL_CAUSE_RATES[index])
            .attr("x", (-0.5 * TOOLTIP_WIDTH) + 10)
            .attr("y", 75 + ((index+1) * TOOLTIP_ROW_HEIGHT))
            .attr("dy", "1.2em")
            .style("text-anchor", "left")
            .attr('class', 'simple_text_info')
            .attr("font-family", "Lora")
            .attr("font-size", "20px")
            .attr("font-weight", "bold")
            .attr("fill", "white")
            .text('jsdn')
    }


    
    stacked_g.append("g")
        .selectAll("g")
        .data(d3.stack().keys(FATAL_CAUSE_RATES).order(d3.stackOrderAscending)(stacked_dataset))
        .enter().append("g")
            .classed("stacked-bar-group", true)
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
            .on("mouseover", function (d) {
                tooltip.transition('stackedTooltipMouseOver').attr("opacity", 1);    
                stackedIndusty =  d.data.majorOccCodeGroup; 
                shouldColor = [];
                for (let index = 0; index < d3.select(this.parentNode).datum().length; index++) {
                    shouldColor[index] = (d3.select(this.parentNode).datum()[index].data.majorOccCodeGroup === stackedIndusty) ? 'red' : 'white' 
                }
                stackedYTicks.selectAll("text")
                    .transition('stackedTextHighlight')
                    .style('fill', function (n, i) {
                        return shouldColor[i]
                    })      
            })
            .on("mouseout", function () { 
                tooltip.transition('stackedTooltipMouseOut')
                    .attr("opacity", 0);
                stackedYTicks.selectAll("text")
                    .transition('stackedTextReturnToWhite')
                    .style('fill', 'white')
            })
            .on("mousemove", function (d) {
                var xPosition = stacked_x(d.data.f_total_rate) + STACKED_LEFT + (TOOLTIP_WIDTH / 2) + 5;
                var yPosition = stacked_y(d.data.occupation) + 8;
                //if the bar is too long, put it under it
                if (xPosition > STACKED_WIDTH + STACKED_LEFT + STACKED_RIGHT){
                    xPosition = stacked_x(d.data.f_total_rate) + STACKED_LEFT - (TOOLTIP_WIDTH / 2) - 2.5// - (TOOLTIP_WIDTH /2)
                    var yPosition = stacked_y(d.data.occupation) + 24;
                }

                tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
                tooltip.select('#stacked_tooltext_occ').text(d.data.occupation.trim())
                tooltip.select('#stacked_tooltext_ind').text("Industry: " + d.data.majorOccNameGroup)
                tooltip.select('#stacked_tooltext_tEmp').text("Total Emp: " + d.data.totEmp)
                var rows = 4;
                for (let index = 0; index < FATAL_CAUSE_RATES.length; index++) {
                    var rate = d3.format(".3n")(d.data[FATAL_CAUSE_RATES[index]]);
                    tooltip.select('#stacked_tooltext_' + FATAL_CAUSE_RATES[index])
                         .text(READABLE_CAUSES[index] + ": " + rate)
                }

            })         
}

function drawStackedInfoTexts() {
    var lineSpacing = 10;
    var yOffset = 10;
    var fontSize = 25;

    function getLineY(index){ return yOffset + ((index + 1) * (fontSize + lineSpacing)) }

    //TODO: Loop this. really don't have time right now 

    // main box
    info_g.append("rect")
        .attr("width", STACKED_WIDTH / 3 + 120)
        .attr("height", STACKED_HEIGHT / 2 )
        .attr('stroke', 'white')
        .attr('stroke-width', '5')
        .attr('fill', 'black')
  
    // text for total rate
    var texts = info_g.append('g').attr('id', 'info-1')
    for (let index = 0; index < STACKED_INFO_TEXTS_TOTAL.length; index++) {
        texts.append("text")
            .attr("x", 20)
            .attr("y", getLineY(index))
            .attr('class', 'stacked_text_info')
            .style('fill', 'white')
            .style('opacity', 1)
            .text(STACKED_INFO_TEXTS_TOTAL[index]) 
    }
    // text for trans rate
    texts = info_g.append('g').attr('id', 'info0')
    for (let index = 0; index < STACKED_INFO_TEXTS_TRANS.length; index++) {
        texts.append("text")
            .attr("x", 20)
            .attr("y", getLineY(index))
            .attr('class', 'stacked_text_info')
            .style('fill', 'white')
            .style('opacity', 0)
            .text(STACKED_INFO_TEXTS_TRANS[index]) 
    }
    // text for violence rate
    texts = info_g.append('g').attr('id', 'info1')
    for (let index = 0; index < STACKED_INFO_TEXTS_VIOLENCE.length; index++) {
        texts.append("text")
            .attr("x", 20)
            .attr("y", getLineY(index))
            .attr('class', 'stacked_text_info')
            .style('fill', 'white')
            .style('opacity', 0)
            .text(STACKED_INFO_TEXTS_VIOLENCE[index]) 
    }
    // text for f&e rate
    texts = info_g.append('g').attr('id', 'info2')
    for (let index = 0; index < STACKED_INFO_TEXTS_FEXP.length; index++) {
        texts.append("text")
            .attr("x", 20)
            .attr("y", getLineY(index))
            .attr('class', 'stacked_text_info')
            .style('fill', 'white')
            .style('opacity', 0)
            .text(STACKED_INFO_TEXTS_FEXP[index]) 
    }
    // text for fst rate
    texts = info_g.append('g').attr('id', 'info3')
    for (let index = 0; index < STACKED_INFO_TEXTS_FST.length; index++) {
        texts.append("text")
            .attr("x", 20)
            .attr("y", getLineY(index))
            .attr('class', 'stacked_text_info')
            .style('fill', 'white')
            .style('opacity', 0)
            .text(STACKED_INFO_TEXTS_FST[index]) 
    }
    // text for exposure rate
    texts = info_g.append('g').attr('id', 'info4')
    for (let index = 0; index < STACKED_INFO_TEXTS_EXPO.length; index++) {
        texts.append("text")
            .attr("x", 20)
            .attr("y", getLineY(index))
            .attr('class', 'stacked_text_info')
            .style('fill', 'white')
            .style('opacity', 0)
            .text(STACKED_INFO_TEXTS_EXPO[index]) 
    }
    // text for contact rate
    texts = info_g.append('g').attr('id', 'info5')
    for (let index = 0; index < STACKED_INFO_TEXTS_CONTACT.length; index++) {
        texts.append("text")
            .attr("x", 20)
            .attr("y", getLineY(index))
            .attr('class', 'stacked_text_info')
            .style('fill', 'white')
            .style('opacity', 0)
            .text(STACKED_INFO_TEXTS_CONTACT[index]) 
    }
    // text for all other rate
    texts = info_g.append('g').attr('id', 'info6')
    for (let index = 0; index < STACKED_INFO_TEXTS_OTHER.length; index++) {
        texts.append("text")
            .attr("x", 20)
            .attr("y", getLineY(index))
            .attr('class', 'stacked_text_info')
            .style('fill', 'white')
            .style('opacity', 0)
            .text(STACKED_INFO_TEXTS_OTHER[index]) 
    }
        

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

    stackedYTicks = stacked_g.append("g")
        .attr("class", "axisStackedY")
        .call(d3.axisLeft(stacked_y))       

}

// add the legend - not used
function drawStackedLegend() {
    var legend = stacked_g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(FATAL_CAUSE_RATES.slice().reverse())
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

    var spaceBetweenCentres = (STACKED_WIDTH+STACKED_RIGHT+STACKED_LEFT) / 25 * 3 ;
    var sizeOfBtn = spaceBetweenCentres / 3

    function clickStackedButton(justSelected, d) {
        //if the btn just clicked is different to the currently selected, fade currently selected
        var fadeLabel = (stackedFirstCause === -1) ? '#f_total_rate' : '#' + FATAL_CAUSE_RATES[stackedFirstCause];
        var visLabel = (justSelected === stackedFirstCause) ? '#f_total_rate' : '#' + FATAL_CAUSE_RATES[justSelected];

        d3.select(fadeLabel + '_stacked_btn') // old button
            .transition('fadeStackedButton')
            .duration(100)
            .attr('opacity', BUTTON_FADED)
            .attr('r', sizeOfBtn)

        d3.select(visLabel + '_stacked_btn') // new button
            .transition('visStackedButton')
            .duration(100)
            .attr('opacity', 1)
            .attr('r', sizeOfBtn * 1.1)

        d3.selectAll(fadeLabel + '_stacked_lbl') // old label
            .transition('fadeStackedLbl')
            .duration(100)
            .style('opacity', BUTTON_FADED)

        d3.selectAll(visLabel + '_stacked_lbl') // new label
            .transition('visStackedLbl')
            .duration(100)
            .style('opacity', 1)
            .attr('r', sizeOfBtn * 1.1)


        // info 
        var t0 = d3.transition('fadestackedInfo').duration(800);
        t0.select('#info' + stackedFirstCause).selectAll('.stacked_text_info')
            .style('opacity', 0)
            
        var t1 = t0.transition('visStackedInfo');
        t1.select('#info' + justSelected).selectAll('.stacked_text_info')
            .style('opacity', 1)

        // sort chart - no need to fade button, will already have been done on mouseOverButton
        sortStackedBar((stackedFirstCause !== justSelected) ? justSelected : -1)

    }

    function mouseOverStackedButton(num) {
        var field = (num === -1) ? '#f_total_rate' : '#' + FATAL_CAUSE_RATES[num];
        // button
        d3.select(field + '_stacked_btn')
            .transition('stackedButonMouseOver')
            .duration(100)
            .attr('opacity', 1)
            .attr('r', sizeOfBtn * 1.1)
        // label
        d3.selectAll(field + '_stacked_lbl')
            .transition('stackedLblMouseOver')
            .duration(100)
            .style('opacity', 1)
    }

    function mouseOutStackedButton(num) {
        var field = (num === -1) ? '#f_total_rate' : '#' + FATAL_CAUSE_RATES[num];
        // button
        d3.select(field + '_stacked_btn')
            .transition('stackedButonMouseOut')
            .duration(100)
            .attr('opacity', function () {
                return (stackedFirstCause == num) ? 1 : BUTTON_FADED;
            })
            .attr('r', function () {
                return (stackedFirstCause == num) ? sizeOfBtn * 1.1 : sizeOfBtn
            })
        // label
        d3.selectAll(field + '_stacked_lbl')
            .transition('stackedLblMouseOut')
            .duration(100)
            .style('opacity', function () {
                return (stackedFirstCause == num) ? 1 : BUTTON_FADED;
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
        .on("click", function () { clickStackedButton(-1, this) })
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
        buttonGroup.append('circle')
            .attr('id', FATAL_CAUSE_RATES[index] + '_stacked_btn')
            .attr('cx', (2 * spaceBetweenCentres) + (index * spaceBetweenCentres) - (0.5 * sizeOfBtn))
            .attr('cy', '80')
            .attr('r', sizeOfBtn)
            .attr('opacity', BUTTON_FADED)
            .attr('stroke', STACK_COLOURS[index])
            .attr('stroke-width', '3')
            .attr('fill', STACK_COLOURS[index])
            .on("click", function () { clickStackedButton(index, this) })
            .on('mouseover', function () { mouseOverStackedButton(index) })
            .on('mouseout', function () { mouseOutStackedButton(index) })
        buttonGroup.append('text')
            .attr('id', FATAL_CAUSE_RATES[index] + '_stacked_lbl')
            .attr('x', 2 * spaceBetweenCentres + (index * spaceBetweenCentres) - (0.5 * sizeOfBtn))
            .attr('y', '200')
            .attr("text-anchor", "middle")
            .style("font-family", 'Lora')
            .style("font-size", "25px")
            .style("font-family", 'Lora')
            .style("font-size", "25px")
            .style('fill', 'white')
            .style('opacity', BUTTON_FADED)
            .style('font-weight', '900')
            .text(READABLE_CAUSES_TOP[index])
        buttonGroup.append('text')
            .attr('id', FATAL_CAUSE_RATES[index] + '_stacked_lbl')
            .attr('x', 2 * spaceBetweenCentres + (index * spaceBetweenCentres) - (0.5 * sizeOfBtn))
            .attr('y', '230')
            .attr("text-anchor", "middle")
            .style("font-family", 'Lora')
            .style("font-size", "25px")
            .style("font-family", 'Lora')
            .style("font-size", "25px")
            .style('fill', 'white')
            .style('opacity', BUTTON_FADED)
            .style('font-weight', '900')
            .text(READABLE_CAUSES_BOTTOM[index])
    }

}