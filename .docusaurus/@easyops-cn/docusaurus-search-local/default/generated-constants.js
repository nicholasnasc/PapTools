import lunr from "C:\\Users\\nicholas.souza\\Documents\\Pap\\node_modules\\lunr\\lunr.js";
require("C:\\Users\\nicholas.souza\\Documents\\Pap\\node_modules\\lunr-languages\\lunr.stemmer.support.js")(lunr);
require("C:\\Users\\nicholas.souza\\Documents\\Pap\\node_modules\\lunr-languages\\lunr.pt.js")(lunr);
require("C:\\Users\\nicholas.souza\\Documents\\Pap\\node_modules\\lunr-languages\\lunr.multi.js")(lunr);
export const removeDefaultStopWordFilter = [];
export const language = ["pt","en"];
export const searchIndexUrl = "search-index{dir}.json?_=f30c2351";
export const searchResultLimits = 8;
export const fuzzyMatchingDistance = 1;