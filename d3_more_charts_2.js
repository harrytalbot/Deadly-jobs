//We're only going to look at the birthrates for now
d3.csv("data/birthrates.csv",

function(error, data) {
    //If there's an error loading the data, print it out, then stop
    if (error){
        console.log("ERROR:");
        console.log(error);
        return;
    }

    //We're going to pre-process the data here
    var countriesOfInterest = ["United Kingdom", "Brazil", "India", "Germany", "Japan"];

    //This is where we'll store the processed data
    var countries = [];

    data.forEach(function(d){

      if (countriesOfInterest.indexOf(d["Country Name"]) > -1){

        //Each datapoint will contain the country's name, and a list of years *and*
        //the corresponding birthrate for that year
        country = {};

        country.countryName = d["Country Name"];
        country.birthrates = [];

        data.columns.slice(5).forEach(function(year){
            var datum = {}
            datum.year = new Date(+year, 0 , 1);
            datum.birthrate = +d[year];
            country.birthrates.push(datum);
        });
        countries.push(country);
      }
    });

    //Let's check what the data contains
    console.log("Our data contains:")
    console.log(countries);

    var margin = { top: 100, right: 100, bottom: 100, left: 100 };
    var width = 800;
    var height = 300;

    var svg = d3.select('body')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom) 
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ")");


    //Our scales are a little more complicated this time
    //Because we have an array of arrays, we need to call d3.min and d3.max *twice*
    var x = d3.scaleTime()
     .domain([
       d3.min(countries, function(c) { return d3.min(c.birthrates, function(d) { return d.year; }); }),
       d3.max(countries, function(c) { return d3.max(c.birthrates, function(d) { return d.year; }); })
     ])
    .range([0, width]);

    var y = d3.scaleLinear()
    .domain([
      d3.min(countries, function(c) { return d3.min(c.birthrates, function(d) { return d.birthrate; }); }),
      d3.max(countries, function(c) { return d3.max(c.birthrates, function(d) { return d.birthrate; }); })
    ])
    .range([height, 0]);

    //We're also going to define a colourscheme;
    //refer back to the previous lab if you don't remember how
    var colourScheme = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(countries.map(function(d) { return d.countryName; }));

    //Now to define the line: this looks similar to how we did it previously,
    //but pay attention to how we use it below!
    var line = d3.line()
      .x(function(d) { return x(d.year); })
      .y(function(d) { return y(d.birthrate); });

    //We use selectAll to create (and manipulate) a number of
    //groups at once
    var country = svg.selectAll(".country")
      .data(countries)
      .enter().append("g")
      .attr("class", "country");

    //We then add a path to *every* "country" group at once
    country.append("path")
      .attr("class", "line")
      //Remember I said we were doing to use the line differently?
      //This time, when we create the line, we pass the array of birthrates
      //for each country directly to it as a *parameter*
      .attr("d", function(d) { return line(d.birthrates); })
      .attr("fill", "none")
      .attr("stroke-width", 2)
      //Finally, we set the colour based on the scheme
      .style("stroke", function(d) { return colourScheme(d.countryName); });         

    //Add the x axis
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .append("text")
      .attr("fill", "#000")
      .attr("y", 40)
      .attr("x", width/2)
      .attr("text-anchor", "middle")
      .text("Year");

    //Add the y axis
    svg.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("fill", "#000")
      .attr("y", -40)
      .attr("x", -height/2)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .text("Average Birthrate");

      //For every line
    country.append("text")
      //Get the *last* data value for each line, so we know where to position the text
      .attr("transform", function(d) {
        var lastValue = d.birthrates[d.birthrates.length - 1];
        return "translate(" + x(lastValue.year) + "," + y(lastValue.birthrate) + ")";
      })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif")
      .text(function(d) { return d.countryName; });                                                                                           

});