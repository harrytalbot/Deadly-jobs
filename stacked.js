/////////////////////////////////////////////////////////////////////////////////////////
var dataset;
var firstCause = 0;

const margin = { top: 20, right: 20, bottom: 30, left: 300 };
const stacked_width = 1000;
const stacked_height = 4000;

/////////////////////////////////////////////////////////////////////////////////////////

var svg_stacked = d3.select('body')
    .select('#svgStacked')
    .attr('width', stacked_width + margin.left + margin.right)
    .attr('height', stacked_height + margin.top + margin.bottom)
    .attr("class", "graph-svg-component"); // BACKGROUND COLOUR

stacked_g = svg_stacked.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// set y scale
var stacked_y = d3.scaleBand().range([0, stacked_height])
// set x scale
var stacked_x = d3.scaleLinear().range([0, stacked_width]);
// set the colors                   
var stacked_z = d3.scaleOrdinal().range([C1, C2, C3, C4, C5, C6, C7]);



/////////////////////////////////////////////////////////////////////////////////////////

// load the csv and create the chart
d3.csv("data/data.csv", function (data, i) {

    // calculate rates per 100k
    data.id = +i;
    data.f_violence_rate = +data.f_violence / +data.totEmp * +100000
    data.f_trans_rate = +data.f_trans / +data.totEmp * +100000
    data.f_fireExp_rate = +data.f_fireExp / +data.totEmp * +100000
    data.f_fallSlipTrip_rate = +data.f_fallSlipTrip / +data.totEmp * +100000
    data.f_exposure_rate = +data.f_exposure / +data.totEmp * +100000
    data.f_contact_rate = +data.f_contact / +data.totEmp * +100000
    data.f_allOther_rate = +data.f_allOther / +data.totEmp * +100000

    data.f_total_rate = +data.f_violence_rate + +data.f_trans_rate + +data.f_fireExp_rate +
        +data.f_fallSlipTrip_rate + +data.f_exposure_rate + +data.f_contact_rate + +data.f_allOther_rate;
    
        data.nf_violence_rate = +data.nf_violence / +data.totEmp * +100000
    data.nf_trans_rate = +data.nf_trans / +data.totEmp * +100000
    data.nf_fireExp_rate = +data.nf_fireExp / +data.totEmp * +100000
    data.nf_fallSlipTrip_rate = +data.nf_fallSlipTrip / +data.totEmp * +100000
    data.nf_exposure_rate = +data.nf_exposure / +data.totEmp * +100000
    data.nf_contact_rate = +data.nf_contact / +data.totEmp * +100000
    data.nf_allOther_rate = +data.nf_allOther / +data.totEmp * +100000

    data.nf_total_rate = +data.nf_violence_rate + +data.nf_trans_rate + +data.nf_fireExp_rate +
        +data.nf_fallSlipTrip_rate + +data.nf_exposure_rate + +data.nf_contact_rate + +data.nf_allOther_rate;


    return data;
}, function (error, data) {
    if (error) throw error;

    // store globally
    dataset = data;

    initData();
    drawStackedChart();
    drawStackedAxis();
    drawStackedLegend();
});

// setup data, scales and filter
function initData() {
    dataset = dataset.filter(function (d) { return (d.end_0 == 'TRUE' && d.end_00 == 'FALSE') })
    // initially sort the data by total descending
    dataset.sort((a, b) => d3.descending(a.f_total_rate, b.f_total_rate));
    
    stacked_y.domain(dataset.map(function (d) { return d.occupation; }));
    stacked_x.domain([0, d3.max(dataset, function (d) { return d.f_total_rate; })]).nice();
    stacked_z.domain(causes);
}

// return a stack order, using the currently selected firstCause
function getStackedOrder(data) {
    var orderNew = [+0, +1, +2, +3, +4, +5, +6];
    if (firstCause == -1) { return orderNew }
    orderNew.splice(firstCause, 1);
    orderNew.unshift(firstCause);
    return orderNew;
}

// update the stacked bar, sorting by a specific cause and running transitions
function sortStackedBar(fCause) {
    firstCause = fCause;
    var sortFn;
    // define the sort function
    if (firstCause !== -1) {
        sortFn = (a, b) => d3.descending(a[causes[firstCause]], b[causes[firstCause]]);
    } else {
        sortFn = (a, b) => d3.descending(a.f_total_rate, b.f_total_rate);
    }
    // sort the y domain by the chosen cause using sortFn
    const yCopy = stacked_y.domain(dataset.sort(sortFn).map(d => d.occupation)).copy();

    const groups = d3.selectAll("g.bar-group")
        .data(d3.stack().keys(causes).order(getStackedOrder)(dataset))
        .attr("fill", function (d) { return stacked_z(d.key); });

    const bars = groups.selectAll(".bar")
        .data(d => d, d => d.data.occupation)
        .sort((a, b) => yCopy(a.data.occupation) - yCopy(b.data.occupation))

    // define what will do the transition
    var t0 = d3.transition().duration(1000);

    // fade out unselected
    t0.selectAll("g.bar-group")
        .duration(1000)
        .attr("opacity", function (d) {
            return (d.key !== causes[firstCause] && firstCause !== -1) ? 0.5 : 1;
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
    t2.select(".axisY")
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
    /*.on("mouseover", function () { tooltip.style("display", null); })
    .on("mouseout", function () { tooltip.style("display", "none"); })
    .on("mousemove", function (d) {
        var xPosition = d3.mouse(this)[0] - 5;
        var yPosition = d3.mouse(this)[1] - 5;
        tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
        tooltip.select("text").text(d[1] - d[0]);
    });*/

}

// add the axis
function drawStackedAxis() {

    stacked_g.append("g")
        .attr("class", "axisY")
        .call(d3.axisLeft(stacked_y));

    stacked_g.append("g")
        .attr("class", "axisY")
        .call(d3.axisBottom(stacked_x))
        .attr("transform", "translate(0," + stacked_height + ")")

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
        .attr("x", stacked_width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", stacked_z);

    legend.append("text")
        .attr("x", stacked_width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .attr("fill", 'white')
        .text(function (d) { return d; });
}

