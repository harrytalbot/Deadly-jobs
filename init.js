var dataset;

var versus_y;
var versus_x;
var versus_x_fatal;
var versus_x_nonfatal;
var versus_z;

var stacked_y;
var stacked_x;
var stacked_z;

var scatter_y;
var scatter_x;
var scatter_z;


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


    return data;
}, function (error, data) {
    if (error) throw error;

    // store globally
    dataset = data;

    initData();

    drawVersusChart();
    drawVersusAxis();

    drawStackedChart();
    drawStackedAxis();
    //drawStackedLegend();
    drawButtons();

    drawScatterPlot();
    drawScatterAxis();
});

// setup data, scales and filter
function initData() {
   

    // initially sort the data by total descending
    dataset.sort((a, b) => d3.descending(a.f_total_rate, b.f_total_rate));

    stacked_dataset = dataset;
    scatter_dataset = dataset;
    versus_dataset = dataset;   
    
    stacked_dataset = stacked_dataset.filter(function (d) { return (d.end_0000 === 'TRUE' && d.f_total_rate > 1) })
    scatter_dataset = scatter_dataset.filter(function (d) { return (d.end_0000 == 'TRUE') })
    versus_dataset = scatter_dataset.filter(function (d) { return (d.end_0000 == 'TRUE') })

    versus_x.domain([
        d3.min(versus_dataset, function (d) { return +-1 * d.nf_total_rate; }),
        d3.max(versus_dataset, function (d) { return d.f_total_rate; })
    ]).nice();


    versus_y.domain(versus_dataset.map(function (d) { return d.occupation; }))    .padding(0.2);
    versus_x_fatal.domain([0, d3.max(versus_dataset, function (d) { return d.f_total_rate; })]).nice();
    versus_x_nonfatal.domain([d3.min(versus_dataset, function (d) { return +-1 * d.nf_total_rate; }), 0]).nice();

    stacked_y.domain(stacked_dataset.map(function (d) { return d.occupation; })) .padding(0.2);
    stacked_x.domain([0, d3.max(stacked_dataset, function (d) { return d.f_total_rate; })]).nice();
    stacked_z.domain(causes);

    scatter_y.domain([0, d3.max([0, d3.max(scatter_dataset, function (d) { return d.f_total_rate })]) + 1]).nice();
    scatter_x.domain([0, d3.max([0, d3.max(scatter_dataset, function (d) { return d.nf_total_rate })]) + 1]).nice();
    scatter_z.domain([0, d3.max([0, d3.max(scatter_dataset, function (d) {return d.salaryMed})])])
    scatter_plotSize.domain([0, d3.max([0, d3.max(scatter_dataset, function (d) {return d.totEmp})])])

}
