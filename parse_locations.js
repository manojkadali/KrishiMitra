const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'state and districts list.csv');
const outputPath = path.join(__dirname, 'client', 'src', 'data', 'locations.json');

// Ensure data dir exists
const dataDir = path.dirname(outputPath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const fileContent = fs.readFileSync(csvPath, 'utf8');

function toTitleCase(str) {
    if (!str) return "";
    return str.trim().split(' ').map(w => {
        if (!w) return "";
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    }).join(' ');
}

// Simple CSV parser to handle quoted strings
function parseCSVRow(text) {
    let ret = [];
    let inQuote = false;
    let value = '';
    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        if (inQuote) {
            if (char === '"') {
                if (i + 1 < text.length && text[i + 1] === '"') {
                    value += '"'; i++;
                } else {
                    inQuote = false;
                }
            } else {
                value += char;
            }
        } else {
            if (char === '"') {
                inQuote = true;
            } else if (char === ',') {
                ret.push(value);
                value = '';
            } else {
                value += char;
            }
        }
    }
    ret.push(value);
    return ret;
}

const lines = fileContent.split('\n').filter(line => line.trim() !== '');
const headers = parseCSVRow(lines[0]).map(h => h.trim());
const stateIdx = headers.indexOf('state_name_english');
const distIdx = headers.indexOf('district_name_english');

const locationMap = {};

for (let i = 1; i < lines.length; i++) {
    const row = parseCSVRow(lines[i]);
    if (row.length <= Math.max(stateIdx, distIdx)) continue;
    
    let stateName = toTitleCase(row[stateIdx]);
    let distName = toTitleCase(row[distIdx]);
    
    if (!stateName || !distName) continue;

    if (!locationMap[stateName]) {
        locationMap[stateName] = {};
    }
    
    if (!locationMap[stateName][distName]) {
        // District -> Sub-district list. The CSV doesn't have sub-districts.
        locationMap[stateName][distName] = [];
    }
}

// Sort alphabetically
const sortedMap = {};
const sortedStates = Object.keys(locationMap).sort();

for (const state of sortedStates) {
    sortedMap[state] = {};
    const sortedDistricts = Object.keys(locationMap[state]).sort();
    for (const dist of sortedDistricts) {
        sortedMap[state][dist] = locationMap[state][dist].sort();
    }
}

fs.writeFileSync(outputPath, JSON.stringify(sortedMap, null, 2));
console.log("Successfully generated optimized locations.json");
