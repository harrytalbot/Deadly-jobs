
// DATA

const f_trans_cases = +10;
const f_violence_cases = +10;
const f_fireExp_cases = +10;
const f_fallSlipTrip_cases = +10;
const f_exposure_cases = +10;
const f_contact_cases = +10;
const f_allOther_cases = +10;
const f_total_cases = +10;//f_trans_cases + f_violence_cases + f_fireExp_cases + f_fallSlipTrip_cases + f_exposure_cases + f_contact_cases + f_allOther_cases;

const nf_trans_cases = 10;
const nf_violence_cases = 10;
const nf_fireExp_cases  = 10;
const nf_fallSlipTrip_cases = 10;
const nf_exposure_cases = 10;
const nf_contact_cases = 10;
const nf_allOther_cases = 10;
const nf_total_cases = nf_trans_cases + nf_violence_cases + nf_fireExp_cases + nf_fallSlipTrip_cases + nf_exposure_cases + nf_contact_cases + nf_allOther_cases;

const causes = ["f_trans_rate", "f_violence_rate", "f_fireExp_rate", "f_fallSlipTrip_rate", "f_exposure_rate", "f_contact_rate", "f_allOther_rate"]
const READABLE_CAUSES = ["Transportation", "Violence", "Fires & Explosions", "Falls, Slips and Trips", "Exposure to Chemicals", "Contact with Equipment", "Other"]

const READABLE_CAUSES_TOP = ["Transportation", "Violence", "Fires &", "Falls, Slips", "Exposure to", "Contact with", "Other"]
const READABLE_CAUSES_BOTTOM = ["Incidents", "or Homicide", "Explosions", "and Trips", "Chemicals", "Equipment", "Events"]

const SIMPLE_CAUSES = ["trans_cases", "violence_cases", "fireExp_cases", "fallSlipTrip_cases", "exposure_cases", "contact_cases", "overextertion_cases", "allOther_cases"]

//const STACK_COLOURS = ["#b2182b", "#ef8a62", "#fddbc7", "#f7f7f7", "#d1e5f0", "#67a9cf", "#2166ac"]
// adapted from http://colorbrewer2.org/#type=qualitative&scheme=Set1&n=7
const STACK_COLOURS = ["#377eb8", "#e41a1c", "#ff7f00", "#984ea3", "#ffff33", "#4daf4a", "#e78ac3"]
const STACK_COLOURS_EXTRA = ["#377eb8", "#e41a1c", "#ff7f00", "#984ea3", "#ffff33", "#4daf4a","#fff8dc", "#e78ac3"]


// MARGIN BITS

const DEVICE_WIDTH = window.innerWidth - 100;
const DEVICE_HEIGHT = window.innerHeight;

const VERSUS_LEFT = 150;
const VERSUS_RIGHT = 150;
const VERSUS_TOP = 20;
const VERSUS_BOTTOM = 40;
const VERSUS_HEIGHT = 700;
const VERSUS_WIDTH = DEVICE_WIDTH - VERSUS_LEFT - VERSUS_RIGHT;

const SIMPLEBAR_LEFT = 100;
const SIMPLEBAR_RIGHT = 100;
const SIMPLEBAR_TOP = 100;
const SIMPLEBAR_BOTTOM = 100;
const SIMPLEBAR_HEIGHT = 100;
const SIMPLEBAR_WIDTH = DEVICE_WIDTH - SIMPLEBAR_LEFT - SIMPLEBAR_RIGHT;

const STACKED_LEFT = 500;
const STACKED_RIGHT = 100;
const STACKED_TOP = 20;
const STACKED_BOTTOM = 40;
const STACKED_HEIGHT = 2000;
const STACKED_WIDTH = DEVICE_WIDTH - STACKED_LEFT - STACKED_RIGHT;

const SCATTER_LEFT = 100;
const SCATTER_RIGHT = 100;
const SCATTER_TOP = 40;
const SCATTER_BOTTOM = 100;
const SCATTER_HEIGHT = 700;
const SCATTER_WIDTH = DEVICE_WIDTH - SCATTER_LEFT - SCATTER_RIGHT;

const BAR_HEIGHT = 25;
