/////////////////////////////////////////////////////////////////////////////////////////

var age_dataset;


// AGE SETUP ////////////////////////////////////////////////////////////////////////

const GAP = 120;


var svg_age = d3.select('body')
    .select('#svgAge')
    .attr('width', AGE_BAR_WIDTH + AGE_BAR_LEFT + AGE_BAR_RIGHT)
    .attr('height', AGE_BAR_HEIGHT + AGE_BAR_TOP + AGE_BAR_BOTTOM)

var age_g = svg_age.append("g").attr("transform", "translate(" + AGE_BAR_LEFT + "," + AGE_BAR_TOP + ")")

age_g_rate = svg_age.append("g").attr("transform", "translate(" + AGE_BAR_LEFT + "," + AGE_BAR_TOP + ")");

age_g_case = svg_age.append("g").attr("transform", "translate(" + AGE_BAR_LEFT + "," + (AGE_BAR_TOP + GAP) + ")");

// set age y scale
age_y_rate = d3.scaleLinear().range([AGE_BAR_HEIGHT, 0]);

age_y_case = d3.scaleLinear().range([AGE_BAR_HEIGHT, 0]);
//age_y_case = d3.scaleLinear().range([AGE_BAR_HEIGHT, AGE_BAR_HEIGHT / 2 + AGE_BAR_TOP]);

// set age x scale
age_x = d3.scaleBand().range([0, AGE_BAR_WIDTH])



function drawAgeChart() {
    // bars
    /*age_g_rate.selectAll('rect')
        .data(age_dataset)
        .enter()
        .append("rect")
        .attr("y", function (d) {
            return age_y_rate(d.rate_2016);
        })
        .attr("x", function (d) {
            return age_x(d.age)
        })
        .attr("width", function (d) {
            return age_x.bandwidth()
        })
        .attr("height", function (d) {
            return AGE_BAR_HEIGHT / 2 - age_y_rate(d.rate_2016) //age_y(d.rate_2016)
        })
        .attr("fill", FATAL_COLOUR)
        .on("mouseover", function (d) {
            // make all bars opaque
            fadeOutVersus('#age_rect', .2, d);
            fadeInVersus("#age_bar_label", 1, d);
            d3.selectAll('#age_average_text').transition().style("opacity", 0.2);
        })
        .on("mouseout", function (d) {
            fadeOutVersus('#age_rect', 1, d);
            fadeInVersus("#age_bar_label", 0, d);
            d3.selectAll('#age_average_text').transition().style("opacity", 1);
        });
*/
    var line = d3.line()
        .x(function (d, i) {
            return age_x(d.age) + (age_x.bandwidth() / 2)
        })
        .y(function (d, i) { return age_y_rate(d.rate_2016); })






    /*age_g_rate.append("g")
        .selectAll("g")
        .data(age_dataset)
        .enter()
        .append("text")
        .style("text-anchor", "centre")
        .attr('id', 'age_bar_label')
        .text(function (d) { return fatalFormatter(d.rate_2016) })
        .attr("y", function (d) {
            return age_y_rate(d.rate_2016) - 10;
        })
        .attr("x", function (d) {
            return age_x(d.age)
        })
        .attr("dx", ".25em")
        .attr('class', 'stacked_text_info')
        .style('fill', 'white')
        .style('opacity', 0)
*/
    age_g_case.selectAll('rect')
        .data(age_dataset)
        .enter()
        .append("rect")
        .attr("y", function (d) {
            return age_y_case(d.case_2016);
        })
        .attr("x", function (d) {
            return age_x(d.age)
        })
        .attr("width", function (d) {
            return age_x.bandwidth()
        })
        .attr("height", function (d) {
            return (AGE_BAR_HEIGHT) - age_y_case(d.case_2016) //age_y(d.rate_2016)
        })
        .attr("fill", FATAL_COLOUR)
        .on("mouseover", function (d) {
            // make all bars opaque
            fadeOutVersus('#age_rect', .2, d);
            fadeInVersus("#age_bar_label", 1, d);
            d3.selectAll('#age_average_text').transition().style("opacity", 0.2);
        })
        .on("mouseout", function (d) {
            fadeOutVersus('#age_rect', 1, d);
            fadeInVersus("#age_bar_label", 0, d);
            d3.selectAll('#age_average_text').transition().style("opacity", 1);
        });

    age_g_case.append("g")
        .selectAll("g")
        .data(age_dataset)
        .enter()
        .append("text")
        .style("text-anchor", "middle")
        .attr('id', 'age_bar_label')
        .text(function (d) { return d.case_2016 })
        .attr("y", function (d) {
            return age_y_case(d.case_2016) - 10;
        })
        .attr("x", function (d) {
            return age_x(d.age)+ (age_x.bandwidth() / 2)
        })
        .attr('class', 'stacked_text_info')
        .style('fill', 'white')
        .style('opacity', 0)

    age_g_case.selectAll('path')
        .data([age_dataset])
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("stroke", "white")
        .attr("stroke-width", "3px")
        .attr("fill", 'transparent')
        .attr("d", function (d) { return line(d) })
        .attr("pointer-events", "none")



}
function drawAgeAxis() {

    // right axis
    age_g_case.append("g")
        .attr("class", "axis")
        .call(d3.axisRight(age_y_rate)
            .ticks(5))
        .attr("transform", "translate(" + AGE_BAR_WIDTH + ",0)")
        .append("text")
        .text('Fatalities per 100k')
        .style("text-anchor", "middle")
        .style("font-family", 'Lora')
        .style('font-weight', '900')
        .style("font-size", "20px")
        .attr('y', -50)
        .attr('x', (AGE_BAR_HEIGHT/2) )
        .attr("transform", "rotate(90)")

    // bottom axis
    age_g_case.append("g")
        .attr("class", "axis")
        .call(d3.axisBottom(age_x))
        .attr("transform", "translate(0," + (AGE_BAR_HEIGHT) + ")")
        .selectAll("text")
        .style("text-anchor", "middle")
        .attr("y", +15)

    age_g_case.append("text")
        .text('Employee Age')
        .attr('y', AGE_BAR_HEIGHT + 60)
        .attr('x', (AGE_BAR_WIDTH / 2))
        .style("font-family", 'Lora')
        .style('font-weight', '900')
        .style("font-size", "20px")
        .style('fill', 'white')
        .style('opacity', '1')
        .style("text-anchor", "middle")

    age_g_case.append("text")
        .text('Mouse over the bars to view the case count.')
        .attr('y', -60)
        .attr('x', (AGE_BAR_WIDTH / 2))
        .style("font-family", 'Lora')
        .style('font-weight', '900')
        .style("font-size", "20px")
        .style('fill', 'white')
        .style('opacity', '1')
        .style("text-anchor", "middle")


    // left axis
    age_g_case.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(age_y_case)
            .ticks(5))
        .append("text")
        .text('Fatalities (Cases)')
        .style("text-anchor", "middle")
        .style("font-family", 'Lora')
        .style('font-weight', '900')
        .style("font-size", "20px")
        .attr('y', -60)
        .attr('x', -(AGE_BAR_HEIGHT/2) )
        .attr("transform", "rotate(270)")
};
function drawAgeInfo() { };