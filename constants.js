
const FATAL_CAUSE_RATES = ["f_trans_rate", "f_violence_rate", "f_fireExp_rate", "f_fallSlipTrip_rate", "f_exposure_rate", "f_contact_rate", "f_allOther_rate"]
const READABLE_CAUSES = ["Transportation", "Violence", "Fires & Explosions", "Falls, Slips and Trips", "Exposure to Chemicals", "Contact with Equipment", "Other"]

// for the stacked bar buttons
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

const FATAL_COLOUR = 'Gold';
const NONFATAL_COLOUR = 'MediumOrchid'
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

// INFO SCREENS

const STACKED_INFO_TEXTS_TOTAL = [
    'Forestry, Conservation and Logging workers were',
    'involved in 5 times more fatal accidents than',
    'the second most dangerous job in 2016.',
    '',
    'Police, Firefighters and Lawyers were all less likely',
    'to die at work than Agricultural and Construction',
    'workers - but it\'s the Healthcare Practitioners',
    'who are the safest.' 
     ]
const STACKED_INFO_TEXTS_TRANS = [
    'Transportation-related deaths rose by 7% to 1,338 ',
    'in 2016. Despite the safety of modern aviation,',
    'air transportation workers have the highest fatality',
    'rate in their industy, reporting 130 cases.',
    '',
    '60% of transport deaths involved a vehicle - 628',
    'fatalities involved more than one vehicle, and 342',
    'involved a vehicle and a roadside object.']
const STACKED_INFO_TEXTS_VIOLENCE = [
    'Unsurprisingly, Law enforcement workers are most',
    'at risk of fatal violence at work, with the figure',
    'rising 32% from 2015.',
    '',
    'And while sales work might seem a safe job, ',
    'supervisors of sales workers are 4.7x more likely',
    'to be involved in a fatal violent attack than their',
    'supervisee.'
    ]
const STACKED_INFO_TEXTS_FEXP = [
    'Your chances of being involved in a deadly fire or',
    'explosion are the slimmest of all the causes listed',
    '- only 4% of jobs have a fatality rate higher than ',
    '1 in 100,000.',
    '',
    'In 2016, it was cited as the cause of death in 88',
    'cases - down 28% from 2015, and 38% from 2011.'
    ]
const STACKED_INFO_TEXTS_FST = [
    'Most common in construction or maintanance ',
    'roles, there were 849 reported cases of ',
    'fatal falls, slips or trips, up 24.7% from 2011.',
    '',
    'Surprisingly, religious workers are more',
    ' likely to fall, slip or trip to their death than',
    'Entertainers, Logging Workers or Mechanics.',
    ]
const STACKED_INFO_TEXTS_EXPO = [
    'Exposure to harmful substances or environments',
    'accounted for 9.9% of workplace deaths in 2016, ',
    'with Electricity accounting for 154 cases (5.1%)',
    'and Extreme Temperature 48 cases (0.92%).',
    '',
    'Overdoses from the non-medical use of drugs or',
    'alcohol while at work increased by 32% from 165 ',
    'in 2015 to 217 in 2016.', 
    ]
const STACKED_INFO_TEXTS_CONTACT = [
    '72.6% of Forestry, Conservation and Logging ',
    'fatalities were caused by contact with objects ',
    'or equipment.',
    ]
const STACKED_INFO_TEXTS_OTHER = [
    'On occasion accidents cannot be classified into',
    'existing categories.'
]


const BAR_PADDING = 0.2;
const BAR_HEIGHT = 25;
const BUTTON_FADED = 0.7;

// MARGIN BITS

const DEVICE_WIDTH = screen.width;
const DEVICE_HEIGHT = window.innerHeight;

const VERSUS_LEFT = 150;
const VERSUS_RIGHT = 150;
const VERSUS_TOP = 40;
const VERSUS_BOTTOM = 60;
const VERSUS_HEIGHT = 600;
const VERSUS_WIDTH = DEVICE_WIDTH - VERSUS_LEFT - VERSUS_RIGHT;

const SIMPLEBAR_LEFT = 150;
const SIMPLEBAR_RIGHT = 150;
const SIMPLEBAR_TOP = 95;
const SIMPLEBAR_BOTTOM = 100;
const SIMPLEBAR_HEIGHT = 100;
const SIMPLEBAR_WIDTH = DEVICE_WIDTH - SIMPLEBAR_LEFT - SIMPLEBAR_RIGHT;

const STACKED_LEFT = 450;
const STACKED_RIGHT = 100;
const STACKED_TOP = 30;
const STACKED_BOTTOM = 40;
const STACKED_HEIGHT =  screen.height - 350 //800;
const STACKED_WIDTH = DEVICE_WIDTH - STACKED_LEFT - STACKED_RIGHT;



const SCATTER_LEFT = 100;
const SCATTER_RIGHT = 500;
const SCATTER_TOP = 50;
const SCATTER_BOTTOM = 100;
const SCATTER_HEIGHT = 650;
const SCATTER_WIDTH = DEVICE_WIDTH - SCATTER_LEFT - SCATTER_RIGHT;



const SCATTER_VERSUS_WIDTH = (SCATTER_WIDTH / 2) + 40;
const SCATTER_VERSUS_HEIGHT = SCATTER_HEIGHT / 2;
const SCATTER_VERSUS_LEFT = 10;
const SCATTER_VERSUS_RIGHT = 10;
const SCATTER_VERSUS_TOP = 10;
const SCATTER_VERSUS_BOTTOM = 70;

