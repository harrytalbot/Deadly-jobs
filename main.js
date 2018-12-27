/////////////////////////////////////////////////////////////////////////////////////////


var dataset;

const causes = ["f_trans_rate", "f_violence_rate", "f_fireExp_rate", "f_fallSlipTrip_rate", "f_exposure_rate", "f_contact_rate", "f_allOther_rate"]
var firstCause = 0;

const margin = { top: 20, right: 20, bottom: 30, left: 300 };
const width = 1000;
const height = 10000;

//Colours

const RED = "#e41a1c";
const BLUE = "";
const GREEN = "";
const PURPLE = "";
const ORANGE = "";
const PINK = "";
const GREY = "";

const C1 = "#b2182b"
const C2 = "#ef8a62"
const C3 = "#fddbc7"
const C4 = "#f7f7f7"
const C5 = "#d1e5f0"
const C6 = "#67a9cf"
const C7 = "#2166ac"

/////////////////////////////////////////////////////////////////////////////////////////

svg = d3.select('body')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .attr("class", "graph-svg-component"); // BACKGROUND COLOUR


g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// set y scale
var y = d3.scaleBand().range([0, height])
// set x scale
var x = d3.scaleLinear().range([0, width]);
// set the colors                   
var z = d3.scaleOrdinal().range([C1, C2, C3, C4, C5, C6, C7]);
                                  

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

    return data;
}, function (error, data) {

    if (error) throw error;

    // initially sort the data by total descending
    data.sort((a, b) => d3.descending(a.f_total_rate, b.f_total_rate));
    y.domain(data.map(function (d) { return d.occupation; }));
    x.domain([0, d3.max(data, function (d) { return d.f_total_rate; })]).nice();
    z.domain(causes);

    dataset = data;

    drawChart();
    drawAxis();
    drawLegend();
});

// function to return an order, using the currently selected firstCause
function order(data) {
    var orderNew = [+0, +1, +2, +3, +4, +5, +6];
    orderNew.splice(firstCause, 1);
    orderNew.unshift(firstCause);
    return orderNew;
}

// Method to update the stacked bar, sorting by a specific cause and running transitions
function sortStackedBar(fCause) {
    firstCause = fCause;
    dataset = [...dataset];
    
    // define the sort function
    var sortFn = (a, b) => d3.descending(a[causes[firstCause]], b[causes[firstCause]]);
    // sort the y domain by the chosen cause using sortFn
    const yCopy = y.domain(dataset.sort(sortFn).map(d => d.occupation)).copy();

    const groups = d3.selectAll("g.bar-group")
        .data(d3.stack().keys(causes).order(order)(dataset))
        .attr("fill", function (d) { return z(d.key); });

    const bars = groups.selectAll(".bar")
        .data(d => d, d => d.data.occupation)
        .sort((a, b) => yCopy(a.data.occupation) - yCopy(b.data.occupation))

    // define what will do the transition
    var t0 = d3.transition().duration(1000);

    // fade out unselected
    t0.selectAll("g.bar-group")
        .duration(1000)
        .attr("opacity", function (d) {
            return (d.key !== causes[firstCause]) ? 0.5 : 1;
        })

    var t1 = t0.transition();
    // sort order of stack
    t1.selectAll("g.bar-group")
        .selectAll(".bar")
        .attr("x", function (d) {
            return x(d[0]);
        })

    var t2 = t1.transition();
    // sort data y axis - needs seperate transition so stack sort happens first
    t2.selectAll("g.bar-group")
        .selectAll(".bar")
        .attr("y", function (d) { return yCopy(d.data.occupation) })

    // sort label y axis
    t2.select(".axisY")
        .call(d3.axisLeft(y))
        .selectAll("g")
}

// Method to initially draw the chart
function drawChart() {
    console.log(dataset)
    g.append("g")
        .selectAll("g")
        .data(d3.stack().keys(causes).order(d3.stackOrderAscending)(dataset))
        .enter().append("g")
            .classed("bar-group", true)
            .attr("fill", function (d) { return z(d.key); })
            .attr("opacity", 1)
        .selectAll("rect")
            .data(function (d) { return d; })
            .enter().append("rect")
            .classed("bar", true)
            .attr("cause-type", function(d,i) { return 'hello'; })
            .attr("y", function (d) {
                return y(d.data.occupation);
            })
            .attr("x", function (d) {
                return x(d[0]);
            })
            .attr("width", function (d) {
                return x(d[1]) - x(d[0]);
            })
            .attr("height", y.bandwidth())
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
function drawAxis() {

    g.append("g")
        .attr("class", "axisY")
        .call(d3.axisLeft(y));

    g.append("g")
        .attr("class", "axisY")
        .call(d3.axisBottom(x))
        .attr("transform", "translate(0," + height + ")")

    }

// add the legend
function drawLegend() {
    var legend = g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(causes.slice().reverse())
        .enter().append("g")
        .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", z);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .attr("fill", 'white')
        .text(function (d) { return d; });
}

