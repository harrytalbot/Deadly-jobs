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
scatter_z = d3.scaleLinear().range(["LightCyan", "RoyalBlue"]);

var scatter_plotSize = d3.scaleLinear().range([5,12])


/// SCATTER VERSUS SETUP /////////////////////////////////////////////////////////////////

scatter_g_versus = svg_scatter.append("g").attr("transform", "translate(" + (SCATTER_LEFT + SCATTER_VERSUS_LEFT_FROM_AXIS) + "," + SCATTER_VERSUS_TOP + ")");

scatter_g_versus.append("rect")
    .attr('id', 'scatter_versus_back')
    .attr("width", SCATTER_VERSUS_WIDTH + SCATTER_VERSUS_LEFT + SCATTER_VERSUS_RIGHT)
    .attr("height", SCATTER_VERSUS_HEIGHT + SCATTER_VERSUS_BOTTOM + SCATTER_VERSUS_TOP)
    .attr('stroke', 'white')
    .attr('stroke-width', '5')
    .attr('fill', 'transparent')
    .attr('opacity', 0)

scatter_versus_g_nonfatal = scatter_g_versus.append("g").attr("transform", "translate(" + (SCATTER_VERSUS_LEFT + (SCATTER_VERSUS_WIDTH /2)) + "," + (SCATTER_VERSUS_TOP) + ")")

scatter_versus_g_fatal = scatter_g_versus.append("g").attr("transform", "translate(" + (SCATTER_VERSUS_LEFT + (SCATTER_VERSUS_WIDTH /2)) + "," + (SCATTER_VERSUS_TOP) + ")")

const SCATTER_VERSUS_GAP_HALF = 0;

// set versus y scale
scatter_versus_y = d3.scaleBand().range([0, SCATTER_VERSUS_HEIGHT])
// set versus x scale
scatter_versus_x_fatal = d3.scaleLinear().range([0, SCATTER_VERSUS_WIDTH / 3]);
scatter_versus_x_nonfatal = d3.scaleLinear().range([-1 * SCATTER_VERSUS_WIDTH / 3, 0 ])
// set the versus colors                   
scatter_versus_z = d3.scaleOrdinal().range(STACK_COLOURS);

var tooltip;

var scatter_versus_dataset; // the main set
var scatter_versus_dataset_filtered;

var scatter_versus_y_labels;
var scatter_versus_code = '';
var scatter_versus_sort_field = 'f_total_rate'

var scatter_info_code = '';



/////////////////////////////////////////////////////////////////////////////////////////         Mouse over the points to view an occupational comparison per industry.

scatter_chart_info_g = scatter_g_versus.append("g")

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

    const TOOLTIP_WIDTH = 500;
    const TOOLTIP_HEIGHT = 100;
    prepTooltip();

    var circles = scatter_g.selectAll('circle')
        .data(scatter_dataset)
        .enter()
        .append('circle')
        .attr('cx', function (d) { return scatter_x(d.nf_total_rate) })
        .attr('cy', function (d) { return scatter_y(d.f_total_rate) })
        .attr('r', function (d) { return scatter_plotSize(d.totEmp) })
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
            tooltip.transition('scatterTooltip').attr("opacity", 1);

        })
        .on('mouseout', function () {
            // fade it
            tooltip.transition('scatterTooltip').duration(100).attr("opacity", 0);
            // move it so it doesn't get in way of mouseover
            tooltip.transition('scatterTooltip').delay(100).duration(0).attr("transform", "translate(" + 4000 + "," + 0 + ")");
            d3.select(this)
                .transition()
                .duration(200)
                .attr('r', function (d) { return scatter_plotSize(d.totEmp) })
                .attr('stroke-width', 1)
        })

        .on("mousemove", function (d) {
            var xPosition = scatter_x(d.nf_total_rate) + SCATTER_LEFT + 25 + (TOOLTIP_WIDTH * 0.5);
            var yPosition = scatter_y(d.f_total_rate) - 25;
            tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
            tooltip.select('#scatter_tooltext_ind').text("Industry: " + d.majorOccNameGroup)
            tooltip.select('#scatter_tooltext_f').text("Fatal: " + fatalFormatter(d.f_total_rate))
            tooltip.select('#scatter_tooltext_nf').text("Non Fatal: " + nonFatalFormatter(d.nf_total_rate))
        })

    function prepTooltip() {
        // Prep the tooltip bits, initial display is hidden
        tooltip = svg_scatter.append("g").attr('opacity', 0)

        tooltip.append("rect")
            .attr("x", -0.5 * TOOLTIP_WIDTH)
            .attr("width", TOOLTIP_WIDTH)
            .attr("height", TOOLTIP_HEIGHT)
            .attr('stroke', 'white')
            .attr('stroke-width', '5')
            .attr('fill', 'black')

        tooltip.append("text")
            .attr("id", "scatter_tooltext_ind")
            .attr("x", (-0.5 * TOOLTIP_WIDTH) + 10)
            .attr("y", 5)
            .attr("dy", "1.2em")
            .style("text-anchor", "left")
            .attr('class', 'simple_text_info')
            .attr("font-family", "Lora")
            .attr("font-size", "20px")
            .attr("font-weight", "bold")
            .attr("fill", "white")
        tooltip.append("text")
            .attr("id", "scatter_tooltext_f")
            .attr("x", (-0.5 * TOOLTIP_WIDTH) + 10)
            .attr("y", 35)
            .attr("dy", "1.2em")
            .style("text-anchor", "left")
            .attr('class', 'simple_text_info')
            .attr("font-family", "Lora")
            .attr("font-size", "20px")
            .attr("font-weight", "bold")
            .attr("fill", "white")
        tooltip.append("text")
            .attr("id", "scatter_tooltext_nf")
            .attr("x", (-0.5 * TOOLTIP_WIDTH) + 10)
            .attr("y", 65)
            .attr("dy", "1.2em")
            .style("text-anchor", "left")
            .attr('class', 'simple_text_info')
            .attr("font-family", "Lora")
            .attr("font-size", "20px")
            .attr("font-weight", "bold")
            .attr("fill", "white")
    
    
    }

}

function drawScatterEmploymentLegend() {
    var empLegend = svg_scatter.append("g")
}

function drawScatterIncomeLegend() {

}

/////////////////////////////////////////////////////////////////////////////////////////


function drawScatterVersus(){

    // rect appended at start and made invisibe

    // bars
    scatter_versus_g_fatal.append("g")
        .selectAll("g")
        .data(scatter_versus_dataset_filtered)
        .enter().append("rect")
            .attr('class', 'scatter_versus_fatal_rect')
            .attr("fill", function(d){
                return scatter_z(d.salaryMed)
            })
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

    scatter_versus_g_nonfatal.append("g")
        .selectAll("g")
        .data(scatter_versus_dataset_filtered)
        .enter().append("rect")
            .attr('class', 'scatter_versus_nonfatal_rect')
            .attr("fill", function(d){ return scatter_z(d.salaryMed)})
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


    // avg lines
    scatter_versus_g_fatal.append("line")
        .attr('id', 'scatter_versus_fatal_average_line')
        .attr('class', 'scatter_versus_fatal_average')
    scatter_versus_g_fatal.append("text")
        .attr('id', 'scatter_versus_average_text')
        .attr('class', 'scatter_versus_fatal_average')
    scatter_versus_g_nonfatal.append("line")
        .attr('id', 'scatter_versus_nonfatal_average_line')
        .attr('class', 'scatter_versus_nonfatal_average')
    scatter_versus_g_nonfatal.append("text")
        .attr('id', 'scatter_versus_average_text')
        .attr('class', 'scatter_versus_nonfatal_average')
        
}

function drawScatterVersusAxis(){

    // X AXIS

    scatter_versus_g_nonfatal.append("g")
        .attr("class", "axis")
        .call(d3.axisBottom(scatter_versus_x_nonfatal)
            .tickFormat(Math.abs)) // for negative values
        .attr("transform", "translate(-" + SCATTER_VERSUS_GAP_HALF + "," + SCATTER_VERSUS_HEIGHT + ")")
        .attr('opacity', 0)
        .append("text")
        .attr("transform", "translate(-" + ((SCATTER_VERSUS_WIDTH+SCATTER_VERSUS_LEFT)/4) + " ," + 50 + ")")
        .style("text-anchor", "middle")
        .style("font-family", 'Lora')
        .style("font-size", "15px")
        .style('fill', 'white')
        .style('opacity', '1')
        .style('font-weight', '900')
        .text("Non-Fatal Injuries per 100k");


    scatter_versus_g_fatal.append("g")
        .attr("class", "axis")
        .call(d3.axisBottom(scatter_versus_x_fatal))
        .attr("transform", "translate(" + SCATTER_VERSUS_GAP_HALF + "," + SCATTER_VERSUS_HEIGHT + ")")
        .attr('opacity', 0)
        .append("text")
        .attr("transform", "translate(" + ((SCATTER_VERSUS_WIDTH+SCATTER_VERSUS_RIGHT)/4) + " ," + 50 + ")")
        .style("text-anchor", "middle")
        .style("font-family", 'Lora')
        .style("font-size", "15px")
        .style('fill', 'white')
        .style('opacity', '1')
        .style('font-weight', '900')
        .text("Fatal Injuries per 100k");


    // Y AXIS

    var yElements = scatter_versus_g_fatal.append("g")
        .attr("class", "axisScatterVersusY")
        .call(d3.axisLeft(scatter_versus_y))
        .attr("transform", "translate(" + SCATTER_VERSUS_GAP_HALF + ",0)")
        .attr('opacity', 0)


    // Align these labels
    yElements.selectAll("text")
        .attr("transform", function (d) {
            return "translate(-" + (SCATTER_VERSUS_GAP_HALF - 10) + ",0)"
        })
        .style("text-anchor", "middle")

    yElements = scatter_versus_g_nonfatal.append("g")
        .attr("class", "axisScatterVersusY")
        .call(d3.axisRight(scatter_versus_y))
        .attr("transform", "translate(-" + SCATTER_VERSUS_GAP_HALF + ",0)")
        .attr('opacity', 0)

    // Remove these labels
    yElements.selectAll("text").remove();
}

function drawScatterVersusButtons() {

    var spaceBetweenCentres = (400+SCATTER_VERSUS_LEFT+SCATTER_VERSUS_RIGHT) / 4;
    var sizeOfBtn = spaceBetweenCentres / 3

    function clickScatterVersusButton(justSelected) {

        if (scatter_versus_sort_field === justSelected || scatter_versus_code === '') return;

        // which side is selected
        selectedChart = (justSelected === 'f_total_rate') ? scatter_versus_g_fatal : scatter_versus_g_nonfatal;
        otherChart = (justSelected !== 'f_total_rate') ? scatter_versus_g_fatal : scatter_versus_g_nonfatal;
        otherField = (justSelected === 'f_total_rate') ? 'nf_total_rate' : 'f_total_rate';


        selectedChart.selectAll('.scatter_versus_control_' + justSelected)        // new 
            .transition()
            .duration(100)
            .attr('opacity', 1)
            .attr('r', sizeOfBtn * 1.1)

        otherChart.selectAll('.scatter_versus_control_' + otherField)        // new 
            .transition()
            .duration(100)
            .style('opacity', BUTTON_FADED)
            .attr('r', sizeOfBtn)


        sortScatterVersus(justSelected)

    }

    function mouseOverScatterVersusButton(field) {
        // ignore if we're over the already selected one, or have nothing selected
        if (scatter_versus_sort_field === field || scatter_versus_code === '') return;
        chart = (field === 'f_total_rate') ?  scatter_versus_g_fatal : scatter_versus_g_nonfatal;
        chart.selectAll('.scatter_versus_control_' + field)
            .transition()
            .duration(100)
            .attr('opacity', 1)
            .attr('r', sizeOfBtn * 1.1)
            .style('opacity', 1)
    }

    function mouseOutScatterVersusButton(field) {
        if (scatter_versus_sort_field === field || scatter_versus_code === '') return;
        chart = (field === 'f_total_rate') ?  scatter_versus_g_fatal : scatter_versus_g_nonfatal;
        chart.selectAll('.scatter_versus_control_' + field)
            .transition()
            .duration(100)
            .attr('opacity', function () {
                return (scatter_versus_sort_field == field) ? 1 : BUTTON_FADED;
            })
            .attr('r', function () {
                return (scatter_versus_sort_field == field) ? sizeOfBtn * 1.1 : sizeOfBtn
            })
            .style('opacity', function () {
                return (scatter_versus_sort_field == field) ? 1 : BUTTON_FADED;
            })
    }

    var offset = 20;
    // Add first for fatal
    scatter_versus_g_nonfatal.append('circle')
        .attr('class', 'scatter_versus_control_nf_total_rate')
        .attr('id', 'nf_total_rate_scatter_versus_btn')
        .attr('cx', (2* sizeOfBtn) -(SCATTER_VERSUS_WIDTH/2) - offset)
        .attr('cy', 50)
        .attr('r', sizeOfBtn * 1.1)
        .attr('opacity', 0)
        .attr('stroke', NONFATAL_COLOUR)
        .attr('stroke-width', '3')
        .attr('fill', NONFATAL_COLOUR)
        .on("click", function () { clickScatterVersusButton('nf_total_rate') })
        .on('mouseover', function () { mouseOverScatterVersusButton('nf_total_rate') })
        .on('mouseout', function () { mouseOutScatterVersusButton('nf_total_rate') })
    scatter_versus_g_nonfatal.append('text')
        .attr('class', 'scatter_versus_control_nf_total_rate')
        .attr('id', 'nf_total_rate_scatter_versus_lbl')
        .attr('x', (2* sizeOfBtn) -(SCATTER_VERSUS_WIDTH/2) - offset)
        .attr('y', '120')
        .attr("text-anchor", "middle")
        .style("font-family", 'Lora')
        .style("font-size", "20px")
        .style('fill', 'white')
        .style('font-weight', '900')
        .style('opacity', 0)
        .text("Sort by")
    scatter_versus_g_nonfatal.append('text')
        .attr('class', 'scatter_versus_control_nf_total_rate')
        .attr('id', 'nf_total_rate_scatter_versus_lbl')
        .attr('x',(2* sizeOfBtn) -(SCATTER_VERSUS_WIDTH/2) - offset)
        .attr('y', '150')
        .attr("text-anchor", "middle")
        .style("font-family", 'Lora')
        .style("font-size", "20px")
        .style('fill', 'white')
        .style('opacity', 0)
        .style('font-weight', '900')
        .text("Non-Fatal")


    // Add first for fatal
    scatter_versus_g_fatal.append('circle')
        .attr('class', 'scatter_versus_control_f_total_rate')
        .attr('id', 'f_total_rate_scatter_versus_btn')
        .attr('cx', (SCATTER_VERSUS_WIDTH/2) - (2* sizeOfBtn) + offset )
        .attr('cy', 50)
        .attr('r', sizeOfBtn * 1.1)
        .attr('opacity', '0')
        .attr('stroke', FATAL_COLOUR)
        .attr('stroke-width', '3')
        .attr('fill', FATAL_COLOUR)
        .on("click", function () { clickScatterVersusButton('f_total_rate') })
        .on('mouseover', function () { mouseOverScatterVersusButton('f_total_rate') })
        .on('mouseout', function () { mouseOutScatterVersusButton('f_total_rate') })
    scatter_versus_g_fatal.append('text')
        .attr('class', 'scatter_versus_control_f_total_rate')
        .attr('id', 'f_total_rate_scatter_versus_lbl')
        .attr('x', (SCATTER_VERSUS_WIDTH/2) - (2* sizeOfBtn) + offset )
        .attr('y', '120')
        .attr("text-anchor", "middle")
        .style("font-family", 'Lora')
        .style("font-size", "20px")
        .style('fill', 'white')
        .style('opacity', '0')
        .style('font-weight', '900')
        .text("Sort by")
    scatter_versus_g_fatal.append('text')
        .attr('class', 'scatter_versus_control_f_total_rate')
        .attr('id', 'f_total_rate_scatter_versus_lbl')
        .attr('x', (SCATTER_VERSUS_WIDTH/2) - (2* sizeOfBtn) + offset )
        .attr('y', '150')
        .attr("text-anchor", "middle")
        .style("font-family", 'Lora')
        .style("font-size", "20px")
        .style('fill', 'white')
        .style('opacity', '0')
        .style('font-weight', '900')
        .text("Fatal")

   

}

function sortScatterVersus(side) {
    scatter_versus_dataset_filtered.sort(function (a, b) {
        return d3.descending(a[side], b[side])
    })

    scatter_versus_y.domain(scatter_versus_dataset_filtered.map(function (d) { return d.occupation; })).padding(0.2);


    scatter_versus_g_nonfatal.selectAll(".scatter_versus_nonfatal_rect")
        .transition('h')
        .attr("y", function (d) {
            return scatter_versus_y(d.occupation);
        })

    scatter_versus_g_fatal.selectAll(".scatter_versus_fatal_rect")
        .transition('h')
        .attr("y", function (d) {
            return scatter_versus_y(d.occupation);
        })
    

    scatter_versus_sort_field = side;
}

function updateScatterVersus(code) {

    if (scatter_versus_code == code) return;

    var fatalTotal = 0;
    var nonFatalTotal = 0;
    var numBars = 0;
    var chartHeight;

    updateBars();
    updateAxis();
    updateAvgLines();
    showSortButtons();

    function showSortButtons(){
        if (scatter_info_code != '') return;
        // show the buttons
        scatter_versus_g_fatal.selectAll('.scatter_versus_control_f_total_rate')
            .transition()
            .attr('opacity', (scatter_versus_sort_field === 'f_total_rate') ? 1 : BUTTON_FADED)
            .style('opacity', (scatter_versus_sort_field === 'f_total_rate') ? 1 : BUTTON_FADED)
        scatter_versus_g_nonfatal.selectAll('.scatter_versus_control_nf_total_rate')
            .transition()
            .attr('opacity', (scatter_versus_sort_field === 'nf_total_rate') ? 1 : BUTTON_FADED)
            .style('opacity', (scatter_versus_sort_field === 'nf_total_rate') ? 1 : BUTTON_FADED)
    }

    function updateBars(){

        scatter_versus_code = code;
        var oldSize = scatter_versus_dataset_filtered.length;
        // filter the set
        scatter_versus_dataset_filtered = scatter_versus_dataset.filter(function (d) { return (d.majorOccCodeGroup == code) })
        scatter_versus_dataset_filtered.sort(function (a, b) {
            return d3.descending(a[scatter_versus_sort_field], b[scatter_versus_sort_field])
        })
        // get a different chart height if there aren't many items
        chartHeight = (scatter_versus_dataset_filtered.length < 5) ? SCATTER_VERSUS_HEIGHT / 3 * 2 : SCATTER_VERSUS_HEIGHT;
        scatter_versus_y = d3.scaleBand().range([0, chartHeight])
        // uses the stacked dataset for occupations.
        scatter_versus_y.domain(scatter_versus_dataset_filtered.map(function (d) { return d.occupation; })).padding(BAR_PADDING);
        scatter_versus_x_fatal.domain([0, d3.max(scatter_versus_dataset_filtered, function (d) { return d.f_total_rate; })]).nice();
        scatter_versus_x_nonfatal.domain([d3.min(scatter_versus_dataset_filtered, function (d) { return +-1 * d.nf_total_rate; }), 0]).nice();
        
        if (oldSize == 0) { // first time so don't animate height transition
            moveVersusInfo(chartHeight, 0)
            scatter_g_versus.select('#scatter_versus_back')
                .attr("height", chartHeight + SCATTER_VERSUS_BOTTOM + SCATTER_VERSUS_TOP)
                .transition()
                .attr('opacity', 1)
        } else if (oldSize < scatter_versus_dataset_filtered.length) { // if the chart is bigger, make the box bigger first
            scatter_g_versus.select('#scatter_versus_back')
                .transition()
                .attr("height", chartHeight + SCATTER_VERSUS_BOTTOM + SCATTER_VERSUS_TOP)
                .attr('opacity', 1)
            moveVersusInfo(chartHeight, 0);

        }
        //first fatal - go in, change the data, redraw and transition
        var bars = scatter_versus_g_fatal.selectAll(".scatter_versus_fatal_rect")
            .data(scatter_versus_dataset_filtered)
        bars.exit()
            .transition('scatter_versus_bar_trans')
            .duration(400)
            .attr("width", 0)
            .remove()
        // update old bars
        bars.transition('scatter_versus_bar_trans')
            .duration(400)
            .delay(400)
            .attr("y", function (d) { return scatter_versus_y(d.occupation) })
            .attr("x", function (d) { return scatter_versus_x_fatal(0) + SCATTER_VERSUS_GAP_HALF })//+ 3})
            .attr("width", function (d) {
                fatalTotal += d.f_total_rate;
                numBars++; 
                return scatter_versus_x_fatal(d.f_total_rate) 
            })
            .attr("height", scatter_versus_y.bandwidth())
            .attr("fill", function(d){ return scatter_z(d.salaryMed)})
      
            
        // add new bars
        bars.enter()
            .append("rect")
            .attr('class', 'scatter_versus_fatal_rect')
            .attr("y", function (d) { return scatter_versus_y(d.occupation) })
            .attr("x", function (d) { return scatter_versus_x_fatal(0) + SCATTER_VERSUS_GAP_HALF })//+ 3 })
            .attr("height", scatter_versus_y.bandwidth())
            .attr("fill", function(d){ return scatter_z(d.salaryMed)})
            .on("mouseover", function (d) {
                actionMouseOver(.2, 1, d, 'in')
            })
            .on("mouseout", function (d) {
                actionMouseOver(1, 0, d, 'out')
            })
            .transition('scatter_versus_bar_trans')
            .duration(400)
            .delay(1000)
            .attr("width", function (d) {
                fatalTotal += d.f_total_rate;
                numBars++;
                return scatter_versus_x_fatal(d.f_total_rate);
            })
            
      
    
        //then nonfatal - go in, change the data, redraw and transition
        bars = scatter_versus_g_nonfatal.selectAll(".scatter_versus_nonfatal_rect")
            .data(scatter_versus_dataset_filtered)
        bars.exit()
            .transition('scatter_versus_bar_trans')
            .duration(400)
            .attr("width", scatter_versus_x_nonfatal(0))
            .attr("x", -SCATTER_VERSUS_GAP_HALF)
            .remove()
        // update old bars
        bars.transition('scatter_versus_bar_trans')
            .duration(400)
            .attr("width", 0)
            .delay(400)
            .attr("y", function (d) { return scatter_versus_y(d.occupation) })
            .attr("x", function (d) { return scatter_versus_x_nonfatal(-d.nf_total_rate) - SCATTER_VERSUS_GAP_HALF })//- 2.25})
            .attr("width", function (d) {
                nonFatalTotal += d.nf_total_rate; 
                return scatter_versus_x_nonfatal(d.nf_total_rate) 
            })
            .attr("height", scatter_versus_y.bandwidth())
            .attr("fill", function(d){ return scatter_z(d.salaryMed)})

        // add new bars
        bars.enter()
            .append("rect")
            .attr('class', 'scatter_versus_nonfatal_rect')
            .attr("y", function (d) { return scatter_versus_y(d.occupation) })
            .attr("height", scatter_versus_y.bandwidth())
            .attr("fill", function(d){ return scatter_z(d.salaryMed)})
            .on("mouseover", function (d) {
                actionMouseOver(.2, 1, d, 'in')
            })
            .on("mouseout", function (d) {
                actionMouseOver(1, 0, d, 'out')
            })
            .transition('scatter_versus_bar_trans')
            .duration(400)
            .delay(1000)
            .attr("width", function (d) {
                nonFatalTotal += d.nf_total_rate; 
                return scatter_versus_x_nonfatal(d.nf_total_rate) 
            })
            // need to transition x so they don't draw the wrong way round
            .attr("x", function (d) { return scatter_versus_x_nonfatal(-d.nf_total_rate) - SCATTER_VERSUS_GAP_HALF })//- 2.25 })
            

        // add mouseovers    

        // if the chart is smaller, make the box smaller last
        if (oldSize > scatter_versus_dataset_filtered.length) {
            scatter_g_versus.select('#scatter_versus_back')
                .transition()
                .delay(800)
                .attr("height", chartHeight + SCATTER_VERSUS_BOTTOM + SCATTER_VERSUS_TOP);
            moveVersusInfo(chartHeight, 800);

        }
    
    }

    function updateAxis(){
        // fade old axis. remove y so it is redrawn over the bars 
        scatter_versus_g_fatal.selectAll(".axisScatterVersusY")
            .transition('scatter_versus_y_trans')
            .attr('opacity', 0)
            .remove()
        scatter_versus_g_nonfatal.selectAll(".axisScatterVersusY")
            .transition('scatter_versus_y_trans')
            .attr('opacity', 0)
            .remove()
        scatter_versus_g_nonfatal.select(".axis")
            .transition()
            .attr('opacity', 0)
        scatter_versus_g_fatal.select(".axis")
            .transition()
            .attr('opacity', 0)
        scatter_versus_g_nonfatal.selectAll(".scatter_versus_nonfatal_average")
            .transition('scatter_versus_y_trans')
            .attr('opacity', 0)
            .remove()
        scatter_versus_g_fatal.selectAll(".scatter_versus_fatal_average")
            .transition('scatter_versus_y_trans')
            .attr('opacity', 0)
            .remove()
        
        // Y AXIS

        var yElements = scatter_versus_g_fatal.append("g")
            .attr("class", "axisScatterVersusY")
            .call(d3.axisLeft(scatter_versus_y))
            .attr("transform", "translate(" + SCATTER_VERSUS_GAP_HALF + ",0)")
            .attr('opacity', 0)
        yElements.selectAll("text").remove()     // Remove these labels

        yElements.transition('scatter_versus_y_trans').delay(800).attr('opacity', 1)

        yElements = scatter_versus_g_nonfatal.append("g")
            .attr("class", "axisScatterVersusY")
            .call(d3.axisRight(scatter_versus_y))
            .attr("transform", "translate(-" + SCATTER_VERSUS_GAP_HALF + ",0)")
            .attr('opacity', 0)
        yElements.selectAll("text").remove()     // Remove these labels

        yElements.transition('scatter_versus_y_trans').delay(800).attr('opacity', 1)

        // X AXIS

        scatter_versus_g_nonfatal.select(".axis")
            .call(d3.axisBottom(scatter_versus_x_nonfatal)
                .tickFormat(Math.abs) // for negative values
                .ticks(3))
                .attr("transform", "translate(-" + SCATTER_VERSUS_GAP_HALF + "," + chartHeight + ")")
                .attr('opacity', 0)
                .transition('fader')
                .delay(800)
                .attr('opacity', 1)

        scatter_versus_g_fatal.select(".axis")
            .call(d3.axisBottom(scatter_versus_x_fatal)
                .ticks(5)) 
            .attr("transform", "translate(" + SCATTER_VERSUS_GAP_HALF + "," + chartHeight + ")")
            .attr('opacity', 0)
            .transition()
            .delay(800)
            .attr('opacity', 1)
    }    

    function updateAvgLines(){
        // avg lines

        scatter_versus_g_fatal.append("line")
            .attr('id', 'scatter_versus_fatal_average_line')
            .attr('class', 'scatter_versus_fatal_average')
            .attr('opacity', 0)
            .attr("x1", scatter_versus_x_fatal(fatalTotal / numBars) + SCATTER_VERSUS_GAP_HALF)
            .attr("y1", 0)
            .attr("x2", scatter_versus_x_fatal(fatalTotal / numBars) + SCATTER_VERSUS_GAP_HALF)
            .attr("y2", chartHeight)
            .transition('scatter_versus_y_trans')
            .delay(810)
            .style("stroke", "white")
            .attr('stroke-width', '3')
            .attr('opacity', 0.5)


        scatter_versus_g_fatal.append("text")
            .attr('id', 'scatter_versus_average_text')
            .attr('class', 'scatter_versus_fatal_average')
            .attr('opacity', 0)
            .attr("transform", "translate(" + (scatter_versus_x_fatal(fatalTotal / numBars) + SCATTER_VERSUS_GAP_HALF + 10) + "," + (chartHeight - 10) + ")")
            .transition('scatter_versus_y_trans')
            .delay(810)
            .text("Average: " + fatalFormatter(fatalTotal / numBars))
            .attr("font-family", "Lora")
            .attr("font-size", "20px")
            .attr("font-weight", "bold")
            .attr("fill", "white")
            .attr('opacity', 1)

        // avg lines
        scatter_versus_g_nonfatal.append("line")
            .attr('id', 'scatter_versus_nonfatal_average_line')
            .attr('class', 'scatter_versus_nonfatal_average')
            .attr('opacity', 0)
            .attr("x1", -scatter_versus_x_nonfatal(nonFatalTotal / numBars) - SCATTER_VERSUS_GAP_HALF)
            .attr("y1", 0)
            .attr("x2", -scatter_versus_x_nonfatal(nonFatalTotal / numBars) - SCATTER_VERSUS_GAP_HALF)
            .attr("y2", chartHeight)
            .transition('scatter_versus_y_trans')
            .delay(810)
            .style("stroke", "white")
            .attr('stroke-width', '3')
            .attr('opacity', 0.5)


        scatter_versus_g_nonfatal.append("text")
            .attr('id', 'scatter_versus_average_text')
            .attr('class', 'scatter_versus_nonfatal_average')
            .attr("transform", "translate(" + (-scatter_versus_x_nonfatal(nonFatalTotal / numBars) - SCATTER_VERSUS_GAP_HALF - 10) + "," + (chartHeight - 10) + ")")
            .attr('opacity', 0)
            .transition('scatter_versus_y_trans')
            .delay(810)
            .text("Average: " + nonFatalFormatter(nonFatalTotal / numBars))
            .attr("font-family", "Lora")
            .attr("font-size", "20px")
            .attr("font-weight", "bold")
            .attr("fill", "white")
            .attr("text-anchor", "end")
            .attr('opacity', 1)
    }

    function actionMouseOver(fadeOut, fadeIn, d, event) {
        if (event === 'in'){
            updateVersusInfo(d);
        } else {
            //hideVersusInfo();
        }
        fadeOutVersus('.scatter_versus_fatal_rect', fadeOut, d);
        fadeOutVersus('.scatter_versus_nonfatal_rect', fadeOut, d);
        fadeInVersus(".scatter_versus_bar_label", fadeIn, d);
        d3.selectAll('.scatter_versus_average_text').transition().style("opacity", fadeOut);

    }

    
}

/////////////////////////////////////////////////////////////////////////////////////////

function drawScatterVersusInfo() {

    // rect for the info
    info = scatter_chart_info_g.append("rect")
        .attr('id', 'scatter_versus_info_rect')
        .attr("transform", "translate(0," + (SCATTER_VERSUS_HEIGHT) + ")")
        .attr("width", SCATTER_VERSUS_WIDTH + SCATTER_VERSUS_LEFT + SCATTER_VERSUS_RIGHT)
        .attr("height", SCATTER_TOP)
        .attr('stroke', 'white')
        .attr('stroke-width', '5')
        .attr('fill', 'transparent')
        .attr('opacity', 0)

        info.append("text")
        .attr("id", "scatter_versus_info_occ")
        .attr("x", (-0.5 * SCATTER_VERSUS_WIDTH + SCATTER_VERSUS_LEFT + SCATTER_VERSUS_RIGHT) + 10)
        .attr("y", 5)
        .attr("dy", "1.2em")
        .style("text-anchor", "left")
        .attr('class', 'simple_text_info')
        .attr("font-family", "Lora")
        .attr("font-size", "25px")
        .attr("font-weight", "bold")
        .attr("fill", "white")
        info.append("text")
        .attr("id", "scatter_versus_info_f")
        .attr("x", (-0.5 * SCATTER_VERSUS_WIDTH + SCATTER_VERSUS_LEFT + SCATTER_VERSUS_RIGHT) + 10)
        .attr("y", 45)
        .attr("dy", "1.2em")
        .style("text-anchor", "left")
        .attr('class', 'simple_text_info')
        .attr("font-family", "Lora")
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .attr("fill", "white")
        info.append("text")
        .attr("id", "scatter_versus_info_nf")
        .attr("x", (-0.5 * SCATTER_VERSUS_WIDTH + SCATTER_VERSUS_LEFT + SCATTER_VERSUS_RIGHT) + 10)
        .attr("y", 75)
        .attr("dy", "1.2em")
        .style("text-anchor", "left")
        .attr('class', 'simple_text_info')
        .attr("font-family", "Lora")
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .attr("fill", "white")

        info.append("text")
        .attr("id", "scatter_versus_info_tEmp")
        .attr("x", (-0.5 * SCATTER_VERSUS_WIDTH + SCATTER_VERSUS_LEFT + SCATTER_VERSUS_RIGHT) + 10)
        .attr("y", 75)
        .attr("dy", "1.2em")
        .style("text-anchor", "left")
        .attr('class', 'simple_text_info')
        .attr("font-family", "Lora")
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .attr("fill", "white")
    
        scatter_chart_info_g.append("text")
        .attr("id", "scatter_versus_info_mSal")
        .attr("x", (-0.5 * SCATTER_VERSUS_WIDTH + SCATTER_VERSUS_LEFT + SCATTER_VERSUS_RIGHT) + 10)
        .attr("y", 0)
        .attr("dy", "1.2em")
        .style("text-anchor", "left")
        .attr('class', 'simple_text_info')
        .attr("font-family", "Lora")
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .attr("fill", "white")

}

function hideVersusInfo(){
    var infobox = scatter_g_versus.select('#scatter_versus_info_rect');

    infobox.transition('versusBox')
            .delay(5000)
            .attr("opacity", 0);
    
}

function moveVersusInfo(chartHeight, delay){
    scatter_g_versus.select('#scatter_versus_info_rect')
        .transition()
        .delay(delay)
        .attr("transform", "translate(0," + (-chartHeight + SCATTER_VERSUS_BOTTOM + SCATTER_VERSUS_TOP) + ")")  
}

function updateVersusInfo(d) {

    var infobox = scatter_g_versus.select('#scatter_versus_info_rect');

    if (scatter_info_code === '') {
        infobox.transition('versusBox')
            .attr("opacity", 1);
    }

    var lineSpacing = 10;
    var yOffset = 0;
    var xOffset = (-0.5 * TOOLTIP_WIDTH) + 20
    var fontSize = 25;

    function getLineY(index){ return yOffset + ((index + 1) * (fontSize + lineSpacing)) }


    scatter_g_versus.select('#scatter_versus_info_mSal').text(d.salaryMed)

    console.log(d.occupation)
    // show the box
    scatter_info_code = d.occCode;

    
}


