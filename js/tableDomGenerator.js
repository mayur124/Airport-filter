import { getLatitude, getLongitude } from "./CoordinatesConverter.js";

function _getTableCell(value) {
    const td = document.createElement("td");
    td.textContent = value ? value : "";
    return td;
};

function _getTableRow(airport) {
    const tr = document.createElement("tr");
    tr.className = "airport-row";
    const valuesToDisplay = [
        airport.name,
        airport.icao,
        airport.iata,
        `${airport.elevation} ft.`,
        getLatitude(airport.latitude),
        getLongitude(airport.longitude),
        airport.type,
    ];
    valuesToDisplay.forEach((value) => {
        tr.appendChild(_getTableCell(value));
    });
    return tr;
};

/**
 * @param {any[]} filteredAirports
 */
export function getTableRows(filteredAirports) {
    return filteredAirports.map((airport) => _getTableRow(airport));
};
