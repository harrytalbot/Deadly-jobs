var dataset;
d3.select('body').attr("class", "background"); // PAGE BACKGROUND COLOUR


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

    data.nf_total_rate = +data.nf_total / +data.totEmp * +100000
    
   // data.nf_total_rate = +data.nf_violence_rate + +data.nf_trans_rate + +data.nf_fireExp_rate +
     //   +data.nf_fallSlipTrip_rate + +data.nf_exposure_rate + +data.nf_contact_rate + +data.nf_allOther_rate;


    return data;
}, function (error, data) {
    if (error) throw error;

    // store globally
    dataset = data;

    initData();

    drawStackedChart();
    drawStackedAxis();
    //drawStackedLegend();

    drawScatterPlot();
    drawScatterAxis();
});

// setup data, scales and filter
function initData() {
    dataset = dataset.filter(function (d) { return (d.end_0000 == 'TRUE') })
    //dataset = dataset.filter(function (d) { return (d.end_0 == 'TRUE' && d.end_00 == 'FALSE') })

    // initially sort the data by total descending
    dataset.sort((a, b) => d3.descending(a.f_total_rate, b.f_total_rate));
    
    stacked_y.domain(dataset.map(function (d) { return d.occupation; }));
    stacked_x.domain([0, d3.max(dataset, function (d) { return d.f_total_rate; })]).nice();
    
    stacked_z.domain(causes);

    scatter_y.domain([0, d3.max([0, d3.max(dataset, function (d) { return d.f_total_rate })]) + 1]).nice();
    scatter_x.domain([0, d3.max([0, d3.max(dataset, function (d) { return d.nf_total_rate })]) + 1]).nice();
    scatter_z.domain([0, d3.max([0, d3.max(dataset, function (d) {return d.salaryMed})])])
    scatter_plotSize.domain([0, d3.max([0, d3.max(dataset, function (d) {return d.totEmp})])])

}
