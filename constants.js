
const causes = ["f_trans_rate", "f_violence_rate", "f_fireExp_rate", "f_fallSlipTrip_rate", "f_exposure_rate", "f_contact_rate", "f_allOther_rate"]
const READABLE_CAUSES = ["Transportation", "Violence", "Fires & Explosions", "Falls, Slips and Trips", "Exposure to Chemicals", "Contact with Equipement", "Other"]

const READABLE_CAUSES_TOP = ["Transportation", "Violence", "Fires &", "Falls, Slips", "Exposure to", "Contact with", "Other"]
const READABLE_CAUSES_BOTTOM = ["Incidents", "or Homicide", "Explosions", "and Trips", "Chemicals", "Equipement", "Events"]

//const STACK_COLOURS = ["#b2182b", "#ef8a62", "#fddbc7", "#f7f7f7", "#d1e5f0", "#67a9cf", "#2166ac"]
// adapted from http://colorbrewer2.org/#type=qualitative&scheme=Set1&n=7
const STACK_COLOURS = ["#377eb8", "#e41a1c", "#ff7f00", "#984ea3", "#ffff33", "#4daf4a", "#e78ac3"]

const DEVICE_WIDTH = screen.width - 100;
const DEVICE_HEIGHT = screen.height;

const VERSUS_LEFT = 100;
const VERSUS_RIGHT = 100;
const VERSUS_TOP = 20;
const VERSUS_BOTTOM = 40;
const VERSUS_HEIGHT = 700;
const VERSUS_WIDTH = DEVICE_WIDTH - VERSUS_LEFT - VERSUS_RIGHT;

const STACKED_LEFT = 500;
const STACKED_RIGHT = 100;
const STACKED_TOP = 20;
const STACKED_BOTTOM = 40;
const STACKED_HEIGHT = 500;
const STACKED_WIDTH = DEVICE_WIDTH - STACKED_LEFT - STACKED_RIGHT;

const SCATTER_LEFT = 100;
const SCATTER_RIGHT = 100;
const SCATTER_TOP = 40;
const SCATTER_BOTTOM = 100;
const SCATTER_HEIGHT = 700;
const SCATTER_WIDTH = DEVICE_WIDTH - SCATTER_LEFT - SCATTER_RIGHT;

const BAR_HEIGHT = 25;

const RED = "#e41a1c";
const BLUE = "";
const GREEN = "";
const PURPLE = "";
const ORANGE = "";
const PINK = "";
const GREY = "";

