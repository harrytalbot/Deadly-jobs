
const FATAL_CAUSE_RATES = ["f_trans_rate", "f_violence_rate", "f_fireExp_rate", "f_fallSlipTrip_rate", "f_exposure_rate", "f_contact_rate", "f_allOther_rate"]
const READABLE_CAUSES = ["Transportation", "Violence", "Fires & Explosions", "Falls, Slips and Trips", "Exposure to Chemicals", "Contact with Equipment", "Other"]

// for the stacked bar button
const READABLE_CAUSES_TOP = ["Transportation", "Violence", "Fires and", "Falls, Slips", "Exposure to", "Contact with", "All Other"]
const READABLE_CAUSES_BOTTOM = ["Incidents", "or Homicide", "Explosions", "and Trips", "Substances", "Equipment", "Causes"]

// for the simple bar chart that includes overextertion
const SIMPLE_CAUSES = ["trans_cases", "violence_cases", "fireExp_cases", "fallSlipTrip_cases", "exposure_cases", "contact_cases", "overextertion_cases", "allOther_cases"]
// map of keys to readable names
const CAUSES_MAP = new Map();
CAUSES_MAP.set("trans_cases", 'Transportation Incidents')
CAUSES_MAP.set("violence_cases", 'Violence and Injury by Person or Animals')
CAUSES_MAP.set("fireExp_cases", 'Fires and Explosions')
CAUSES_MAP.set("fallSlipTrip_cases", 'Falls, Slips and Trips')
CAUSES_MAP.set("exposure_cases", 'Exposure to Harmful Substances or Environments')
CAUSES_MAP.set("contact_cases", 'Contact with Objects or Equipment')
CAUSES_MAP.set("overextertion_cases", 'Overextertion and Bodily Reaction')
CAUSES_MAP.set("allOther_cases", 'All Other Causes')

//const STACK_COLOURS = ["#b2182b", "#ef8a62", "#fddbc7", "#f7f7f7", "#d1e5f0", "#67a9cf", "#2166ac"]
// adapted from http://colorbrewer2.org/#type=qualitative&scheme=Set1&n=7

const TRANS_BLUE = "#377eb8";
const VIOLENCE_RED = "#e41a1c";
const FIRE_ORANGE = "#ff7f00";
const FALLS_PURP = "#984ea3";
const EXP_YELL = "#ffff33";
const CONTACT_GREEN = "#4daf4a";
const OVER_BEIGE = "#f0b27a";
const OTHER_PINK = "#e78ac3";
const STACK_COLOURS = [TRANS_BLUE, VIOLENCE_RED, FIRE_ORANGE, FALLS_PURP, EXP_YELL, CONTACT_GREEN, OTHER_PINK]
const STACK_COLOURS_EXTRA = [TRANS_BLUE, VIOLENCE_RED, FIRE_ORANGE, FALLS_PURP, EXP_YELL, CONTACT_GREEN, OVER_BEIGE, OTHER_PINK]

const BAR_PADDING = 0.2;

// MARGIN BITS

const DEVICE_WIDTH = window.innerWidth - 100;
const DEVICE_HEIGHT = window.innerHeight;

const VERSUS_LEFT = 150;
const VERSUS_RIGHT = 150;
const VERSUS_TOP = 40;
const VERSUS_BOTTOM = 50;
const VERSUS_HEIGHT = 600;
const VERSUS_WIDTH = DEVICE_WIDTH - VERSUS_LEFT - VERSUS_RIGHT;

const SIMPLEBAR_LEFT = 175;
const SIMPLEBAR_RIGHT = 100;
const SIMPLEBAR_TOP = 120;
const SIMPLEBAR_BOTTOM = 75;
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

const SCATTER_VERSUS_WIDTH = SCATTER_WIDTH / 2;
const SCATTER_VERSUS_HEIGHT = SCATTER_HEIGHT / 2;
const SCATTER_VERSUS_LEFT = 10;
const SCATTER_VERSUS_RIGHT = 10;
const SCATTER_VERSUS_TOP = 10;
const SCATTER_VERSUS_BOTTOM = 30;

const BAR_HEIGHT = 25;
