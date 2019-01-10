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

var scatter_versus_y;
var scatter_versus_x;
var scatter_versus_z;

var currentPagePos = 0;

var fatalFormatter = d3.format(".3n");
var nonFatalFormatter = d3.format(",.2f");
var moneyFormatter = d3.format("($,.4r");
var empFormatter = d3.format(",");


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
    dataset.sort((a, b) => d3.descending(+a.f_total_rate, +b.f_total_rate));
    // initially sort the data by total descending
    // each have their own copy
    //simpleBar_dataset = dataset;
    stacked_dataset = dataset;
    scatter_dataset = dataset;
    versus_dataset = dataset;
    scatter_versus_dataset = dataset; 

    stacked_dataset = stacked_dataset.filter(function (d) { return (d.end_0000 == 'FALSE' && d.end_00 == 'TRUE' && d.totEmp > +50000 && d.f_total_rate >1 && !(d.occupation.trim().startsWith('Other')))})
    scatter_dataset = scatter_dataset.filter(function (d) { return (d.end_0000 == 'TRUE') })
    versus_dataset = versus_dataset.filter(function (d) { return (d.end_0000 == 'TRUE') })
    scatter_versus_dataset = scatter_versus_dataset.filter(function (d) { return (d.end_00 == 'FALSE' && d.end_0 == 'TRUE') })
    scatter_versus_dataset_filtered = scatter_versus_dataset.filter(function (d) { return (d.majorOccCodeGroup == '')})

    versus_y.domain(versus_dataset.map(function (d) { return d.occupation; })).padding(BAR_PADDING);
    versus_x_fatal.domain([0, d3.max(versus_dataset, function (d) { return d.f_total_rate; })]).nice();
    versus_x_nonfatal.domain([d3.min(versus_dataset, function (d) { return +-1 * d.nf_total_rate; }), 0]).nice();
    
    stacked_y.domain(stacked_dataset.map(function (d) { return d.occupation; })).padding(BAR_PADDING);
    stacked_x.domain([0, d3.max(stacked_dataset, function (d) { return d.f_total_rate; })]).nice();
    stacked_z.domain(FATAL_CAUSE_RATES);

    scatter_y.domain([0, 20])//d3.max([0, d3.max(scatter_dataset, function (d) { return d.f_total_rate })]) + 1]).nice();
    scatter_x.domain([0, 600])//d3.max([0, d3.max(scatter_dataset, function (d) { return d.nf_total_rate })]) + 1]).nice();
    scatter_z.domain([0, d3.max([0, d3.max(scatter_dataset, function (d) {return d.salaryMed})])])
    scatter_plotSize.domain([0, d3.max([0, d3.max(scatter_dataset, function (d) {return d.totEmp})])])  

    // uses the stacked dataset for occupations.
    scatter_versus_y.domain(scatter_versus_dataset_filtered.map(function (d) { return d.occupation; })).padding(BAR_PADDING);
    scatter_versus_x_fatal.domain([0, d3.max(scatter_versus_dataset_filtered, function (d) { return d.f_total_rate; })]).nice();
    scatter_versus_x_nonfatal.domain([d3.min(scatter_versus_dataset_filtered, function (d) { return +-1 * d.nf_total_rate; }), 0]).nice();
    scatter_versus_z.domain([0, d3.max([0, d3.max(scatter_versus_dataset_filtered, function (d) {return d.salaryMed})])])

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
    if (error) throw error;

    simpleBar_dataset = data;

    simpleBar_y.domain(simpleBar_dataset.map(function (d) { return d.outcome; }))    .padding(BAR_PADDING);
    simpleBar_x.domain([0, +100])
    simpleBar_z.domain(STACK_COLOURS_EXTRA)
    
    
    begin();

});


function begin(){

    drawSimpleBarChart();
    drawSimpleBarAxis();

    drawVersusChart();
    drawVersusAxis();
    drawVersusButtons();

    drawStackedChart();
    drawStackedAxis();
    drawStackedInfoTexts();
    drawStackedButtons();

    drawScatterPlot();
    drawScatterAxis();
    drawScatterEmploymentLegend();
    drawScatterIncomeLegend();

    drawScatterVersus();
    drawScatterVersusAxis();
    drawScatterVersusButtons();

    drawScatterVersusInfo();

    //var top = document.getElementById("articleTop"); top.scrollIntoView();
    // keypress
    document.onkeypress = KeyPressHappened;

}

function KeyPressHappened(e){

    // sections to scroll to
    var sections = ["#articleTop", "#svgVersusSortButton", "#infoBarText", "#svgStackedSortButton", "#svgScatter", "#svgScatter"    ]

    var code = ((e.charCode) && (e.keyCode==0)) ? e.charCode : e.keyCode; 
    

    switch (code) {

        case 37: // 37 = LEFT
            currentPagePos = (currentPagePos - 1 <= 0) ? 0 : currentPagePos - 1; 
            break;
        case 38: // 38 = UP
            currentPagePos = (currentPagePos - 1 <= 0) ? 0 : currentPagePos - 1; 
            break;
        case 39: // 39 = RIGHT
            currentPagePos = (currentPagePos + 1 >= sections.length) ? sections.length - 1 :currentPagePos + 1; 
            break;
        case 40: // 40 = DOWN
            currentPagePos = (currentPagePos + 1 >= sections.length) ? sections.length - 1 : currentPagePos + 1; 
            break;
        default:
            // 1 to 6
            if (code > 47 && code < 55) currentPagePos = (code - 49);
            break;        
    }

    if (currentPagePos == 4 || currentPagePos == 5){
        //update scatter viewport
        scatter_y.domain([0, (currentPagePos == 4) ? 20 : d3.max([0, d3.max(scatter_dataset, function (d) { return d.f_total_rate } )]) + 1]).nice();
        scatter_x.domain([0, (currentPagePos == 4) ? 600: d3.max([0, d3.max(scatter_dataset, function (d) { return d.nf_total_rate })]) + 1]).nice();
        updateScatterViewPort();
        // update text

        var text;
        if (currentPagePos == 4){
            text = "intro into stacked bar,mention comp sci occupations being low risk and high reward!"
        } else {
            text = "how generally more dangerous occupations have lower employment, and the salary does not often reflect this "
        }
        var t0 = d3.transition('fadeText').duration(400);
        t0.select('#svgScatterRightText').style('opacity', 0)
        var t1 = t0.transition('visText');
        t1.select('#svgScatterTopRightText').text(text)
        t1.select('#svgScatterBottomRightText').text("hi")
        t1.select('#svgScatterRightText').style('opacity', 1)


    }


    $('html, body').animate({
        scrollTop: $(sections[currentPagePos]).offset().top
    }, 1000);


}
