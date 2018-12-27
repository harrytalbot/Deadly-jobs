var causes = ["f_violence", "f_trans", "f_fireExp", "f_fallSlipTrip", "f_exposure", "f_contact"]

var margin = { top: 20, right: 20, bottom: 30, left: 300 };
var width = 1000;
var height = 10000;

svg = d3.select('body')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)

g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// set y scale
var y = d3.scaleBand()
    .range([0, height])

// set x scale
var x = d3.scaleLinear()
    .range([0, width]);

// set the colors
var z = d3.scaleOrdinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    
// load the csv and create the chart
d3.csv("data/data.csv", function (d, i) {
    for (i = 1, t = 0; i < causes.length; ++i) {
        t += d[causes[i]] = +d[causes[i]];
    }
    d.total = t;
    console.log(d.total)
    return d;
}, function (error, data) {

    if (error) throw error;

    data.sort((a, b) => d3.descending(a.total, b.total));
    y.domain(data.map(function (d) { return d.occupation; }));
    x.domain([0, d3.max(data, function (d) { return d.total; })]).nice();
    z.domain(causes);

    g.append("g")
        .selectAll("g")
        .data(d3.stack().keys(causes)(data))
        .enter().append("g")
        .attr("fill", function (d) { return z(d.key); })
        .selectAll("rect")
        .data(function (d) { return d; })
        .enter().append("rect")
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
        .on("mouseover", function () { tooltip.style("display", null); })
        .on("mouseout", function () { tooltip.style("display", "none"); })
        .on("mousemove", function (d) {
            var xPosition = d3.mouse(this)[0] - 5;
            var yPosition = d3.mouse(this)[1] - 5;
            tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
            tooltip.select("text").text(d[1] - d[0]);
        });

    g.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y));

    g.append("g")
        .attr("class", "axis")
        .call(d3.axisBottom(x))
        .attr("transform", "translate(0," + height + ")")


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
        .text(function (d) { return d; });
});

// Prep the tooltip bits, initial display is hidden
var tooltip = svg.append("g")
  .attr("class", "tooltip")
  .style("display", "none");
    
tooltip.append("rect")
  .attr("width", 30)
  .attr("height", 20)
  .attr("fill", "white")
  .style("opacity", 0.5);

tooltip.append("text")
  .attr("x", margin.left)
  .attr("dy", "1.2em")
  .style("text-anchor", "middle")
  .attr("font-size", "12px")
  .attr("font-weight", "bold");