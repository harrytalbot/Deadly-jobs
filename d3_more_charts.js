/*d3.csv("data/birthrates.csv",

  function(error, data) {
    //If there's an error loading the data, print it out, then stop
    if (error){
      console.log("ERROR:");
      console.log(error);
      return;
    }
    */
    d3.queue()
    .defer(d3.csv, "data/birthrates.csv")
    .defer(d3.csv, "data/deathrates.csv")
    .await(function(error, birthrates, deathrates) {
        if (error) {
            console.log(error);
            return;
        }

        var data = [];
        var countryOfInterest = "United Kingdom";

//Get the year, the same way as in Part 1
birthrates.columns.slice(5).forEach(function(year){
  dataPoint = {};
  dataPoint.year = new Date(+year, 0 , 0);

  //Get the birthrate from the country we care about
  //(Yes, this is inefficient, but it's clear!)
  birthrates.forEach(function(d){
    if (countryOfInterest == d["Country Name"]){
      dataPoint.birthrate = +d[year];
  }
});

  //Get the deathrate from the country we care about - note how this pulls from the other file
  deathrates.forEach(function(d){
    if (countryOfInterest == d["Country Name"]){
      dataPoint.deathrate = +d[year];
  }
});
  data.push(dataPoint);
});
  

//Now we'll set up the SVG;
//if you're unsure how this works, refer back to the last lab
var margin = { top: 100, right: 100, bottom: 100, left: 100 };
var width = 800;
var height = 300;

var svg = d3.select('body')
.append('svg')
.attr('width', width + margin.left + margin.right)
.attr('height', height + margin.top + margin.bottom) 
.append('g')
.attr('transform', 'translate(' + margin.left + ',' + margin.top + ")");

 //Now we'll set up the scales;
//if you're unsure how this works, refer back to the last lab
var x = d3.scaleTime()
.domain(d3.extent(data, function(d) { return d.year }))
.range([0, width]);

var combinedValues = data.map(function(d) { return d.birthrate; })
  .concat(data.map(function(d) { return d.deathrate; }));

var y = d3.scaleLinear()
//.domain(d3.extent(data, function(d) { return d.birthrate; }))
.domain(d3.extent(combinedValues))
.range([height, 0]);


//Now to define the line!
// var line = d3.line()
//   .x(function(d) { return x(d.year); })
//   .y(function(d) { return y(d.birthrate); });

// svg.append("path")
//   .datum(data)
//   .attr("fill", "none")
//   .attr("stroke", "steelblue")
//   .attr("stroke-width", 2)
//   .attr("d", line);

var birthsLine = d3.line()
  .x(function(d) { return x(d.year); })
  .y(function(d) { return y(d.birthrate); });

svg.append("path")
  .datum(data)
  .attr("fill", "none")
  .attr("stroke", "steelblue")
  .attr("stroke-width", 2)
  .attr("d", birthsLine)


//Now to define the line!
var deathsLine = d3.line()
  .x(function(d) { return x(d.year); })
  .y(function(d) { return y(d.deathrate); });

svg.append("path")
  .datum(data)
  .attr("fill", "none")
  .attr("stroke", "firebrick")
  .attr("stroke-width", 2)
  .attr("d", deathsLine);


//Add the axis;
//if you're unsure how this works, refer back to the last lab
svg.append("g")
.attr("transform", "translate(0," + height + ")")
.call(d3.axisBottom(x))
  //Append a label
  .append("text")
  .attr("fill", "#000")
  .attr("y", 40)
  .attr("x", width/2)
  .attr("text-anchor", "middle")
  .text("Year");

  svg.append("g")
  .call(d3.axisLeft(y))
  //Append a label
  .append("text")
  .attr("fill", "#000")
  .attr("y", -40)
  .attr("x", -height/2)
  .attr("transform", "rotate(-90)")
  .attr("text-anchor", "middle")
  .text("Average Birthrate (/1000 people)");

  svg.append("text")
  .attr("x", (width / 2))             
  .attr("y", 0 - (margin.top / 2))
  .attr("text-anchor", "middle")  
  .style("font-size", "16px") 
  .style("text-decoration", "underline")  
  .text("Title");

}
);