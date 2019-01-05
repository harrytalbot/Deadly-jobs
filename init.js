var dataset;

var simpleBar_y;
var simpleBar_x_fatal;
var simpleBar_x_nonfatal;
var simpleBar_z;

var versus_y;
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

// load the first csv
d3.csv("data/dataWithCodes.csv", function (data, i) {

    // calculate rates per 100k
    data.f_violence_rate = +data.f_violence / +data.totEmp * +100000
    data.f_trans_rate = +data.f_trans / +data.totEmp * +100000
    data.f_fireExp_rate = +data.f_fireExp / +data.totEmp * +100000
    data.f_fallSlipTrip_rate = +data.f_fallSlipTrip / +data.totEmp * +100000
    data.f_exposure_rate = +data.f_exposure / +data.totEmp * +100000
    data.f_contact_rate = +data.f_contact / +data.totEmp * +100000
    data.f_allOther_rate = +data.f_allOther / +data.totEmp * +100000

    data.f_total_rate = +data.f_total / +data.totEmp * +100000
    
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
});

// load the second csv (this is just some case counts)
d3.csv("data/dataForSimpleBar.csv", function (data, i) {

    data.violence_cases = +data.violence_cases
    data.trans_cases = +data.trans_cases
    data.fireExp_cases = +data.fireExp_cases
    data.fallSlipTrip_cases = +data.fallSlipTrip_cases
    data.exposure_cases = +data.exposure_cases
    data.contact_cases = +data.contact_cases
    data.overextertion_cases = +data.overextertion_cases
    data.allOther_cases = +data.allOther_cases


    return data;
}, function (error, data) {
    simpleBar_dataset = data;
    
    if (error) throw error;
    begin();

});


function begin(){

    // initially sort the data by total descending
    dataset.sort((a, b) => d3.descending(a.f_total_rate, b.f_total_rate));
    // each have their own copy
    //simpleBar_dataset = dataset;
    stacked_dataset = dataset;
    scatter_dataset = dataset;
    versus_dataset = dataset;   
    
    stacked_dataset = stacked_dataset.filter(function (d) { return (d.end_00 == 'FALSE' && d.end_0 == 'TRUE' && d.totEmp > +50000 && d.f_total_rate >1) })
    //stacked_dataset = stacked_dataset.filter(function (d) { return (d.end_0 == 'FALSE' && d.totEmp < +300000 && d.totEmp > +50000 && d.f_total_rate >0.5) })
    scatter_dataset = scatter_dataset.filter(function (d) { return (d.end_0000 == 'TRUE') })
    versus_dataset = scatter_dataset.filter(function (d) { return (d.end_0000 == 'TRUE') })

    // now do the pre and 
    initDomains();

    drawSimpleBarChart();
    drawSimpleBarAxis();

    drawVersusChart();
    drawVersusAxis();
    drawVersusButtons();

    drawStackedChart();
    drawStackedAxis();
    drawStackedButtons();

    drawScatterPlot();
    drawScatterAxis();
}

// setup data, scales and filter
function initDomains() {

    versus_y.domain(versus_dataset.map(function (d) { return d.occupation; }))    .padding(0.2);
    versus_x_fatal.domain([0, d3.max(versus_dataset, function (d) { return d.f_total_rate; })]).nice();
    versus_x_nonfatal.domain([d3.min(versus_dataset, function (d) { return +-1 * d.nf_total_rate; }), 0]).nice();

    simpleBar_y.domain(simpleBar_dataset.map(function (d) { return d.outcome; }))    .padding(0.2);
    simpleBar_x.domain([0, +100])
    simpleBar_z.domain(STACK_COLOURS_EXTRA)
    
    stacked_y.domain(stacked_dataset.map(function (d) { return d.occupation; })) .padding(0.2);
    stacked_x.domain([0, d3.max(stacked_dataset, function (d) { return d.f_total_rate; })]).nice();
    stacked_z.domain(causes);

    scatter_y.domain([0, d3.max([0, d3.max(scatter_dataset, function (d) { return d.f_total_rate })]) + 1]).nice();
    scatter_x.domain([0, d3.max([0, d3.max(scatter_dataset, function (d) { return d.nf_total_rate })]) + 1]).nice();
    scatter_z.domain([0, d3.max([0, d3.max(scatter_dataset, function (d) {return d.salaryMed})])])
    scatter_plotSize.domain([0, d3.max([0, d3.max(scatter_dataset, function (d) {return d.totEmp})])])

}
