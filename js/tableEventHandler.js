import { getLatitude, getLongitude } from "./CoordinatesConverter.js";

class TableEventHandler {
    /**
     * @param {any[]} airportList 
     */
    constructor(airportList) {
        this.airportList = airportList;
        this.filteredAirportList = airportList;
        this.currentPage = 1;
        this.pageSize = 4;
    }
    /**
     * @param {number} newPage 
     */
    setPageSize(pageSize) {
        this.pageSize = pageSize;
    }
    /**
     * @param {number} newPage 
     */
    setCurrentPage(newPage) {
        this.currentPage = newPage;
    }
    goToNextPage() {
        const totalPages = this.getTotalPages();
        if (this.currentPage < totalPages) {
            ++this.currentPage;
        }
    }
    goToPreviousPage() {
        if (this.currentPage > 1) {
            --this.currentPage;
        }
    }
    getTotalPages() {
        return Math.ceil(this.filteredAirportList.length / this.pageSize);
    }
    getPaginationString() {
        const currentPage = this.filteredAirportList.length == 0 ? 0 : this.currentPage;
        return `${currentPage}-${this.getTotalPages(this.pageSize)}`;
    }
    /**
     * @param {any[]} selectedTypes 
     * @param {string} searchString 
     */
    getPaginatedAirports(selectedTypes, searchString) {
        this.filterAirports(selectedTypes, searchString);
        return this.getPaginationSlice();
    }
    /**
     * @param {any[]} selectedTypes 
     * @param {string} searchString 
     */
    filterAirports(selectedTypes, searchString) {
        this.filteredAirportList = this.airportList.filter(airport => this._getFilterCondition(selectedTypes, searchString, airport));
    }
    /**
     * @param {any[]} selectedTypes 
     * @param {string} searchString 
     * @param {any} airport 
     */
    _getFilterCondition(selectedTypes, searchString, airport) {
        if (selectedTypes.length === 0) {
            return this._getFilterBySearchStrCondition(searchString, airport);
        } else {
            return selectedTypes.includes(airport.type) && this._getFilterBySearchStrCondition(searchString, airport);
        }
    }
    _getFilterBySearchStrCondition(searchString, airport) {
        const latitude = getLatitude(airport.latitude);
        const longitude = getLongitude(airport.longitude);
        return [
            airport.name,
            airport.icao,
            airport.iata,
            `${airport.elevation} ft.`,
            latitude,
            longitude
        ].some(val => val != undefined && val.toLowerCase().indexOf(searchString.toLowerCase()) > -1)
    }
    getPaginationSlice() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        return this.filteredAirportList.slice(startIndex, endIndex);
    }
    /**
     * @param {any[]} selectedTypes 
     * @param {string} searchString 
     */
    getFilterdAirports(selectedTypes, searchString) {
        this.setCurrentPage(1);
        return this.getPaginatedAirports(selectedTypes, searchString);
    }
    isPrevBtnDisabled() {
        return this.currentPage <= 1 ? true : false;
    }
    isNextBtnDisabled() {
        return this.currentPage >= this.getTotalPages() ? true : false;
    }
}

export default TableEventHandler;