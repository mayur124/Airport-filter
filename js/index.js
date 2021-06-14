import TableEventHandler from "./tableEventHandler.js";
import { getTableRows } from "./tableDomGenerator.js";

/**
 * @type {TableEventHandler}
 */
let tableEventHandler;
let selectedTypeFilters = [];

/**
 * @type {Cache}
 */
let cache;
const airportCacheRequest = new Request('/airports.json');
const CACHE_KEY = 'airports-cache';

const typeFilters = document.querySelectorAll("input[type='checkbox'][name='type']");
const searchFilterInput = document.getElementById('filter-input');
const previousPageBtn = document.getElementById('prev-page-btn');
const nextPageBtn = document.getElementById('next-page-btn');
const pageSizeChangeDropdown = document.getElementById('page-size');
const tableBody = document.getElementById('airport-table').getElementsByTagName('tbody')[0];
const loaderRow = document.getElementById('loader-row');
const pageNumberString = document.getElementById('page-number');
const totalRowsString = document.getElementById('total-rows');

initFetchData();

async function getCachedResponse() {
    cache = await caches.open(CACHE_KEY);
    return (await caches.match(airportCacheRequest))?.json();
}

async function fetchAirports() {
    const airportPromise = await fetch('/airports.json');
    return await airportPromise?.json();
}

async function initFetchData() {
    try {
        if ('caches' in window) {
            await getCachedResponse().then(cachedAirports => {
                if (cachedAirports) {
                    init(cachedAirports);
                } else {
                    fetchAirports()
                        .then(airports => {
                            init(airports);
                            addAirportsToCache(airports);
                        });
                }
            });
        } else {
            await fetchAirports()
                .then(airports => {
                    init(airports);
                });
        }
    } catch (error) {
        console.log('Error occurred while fetching airports > ', error);
        toggleLoader();
    }
};

/**
 * @param {any[]} airports 
 */
async function addAirportsToCache(airports) {
    cache = await caches.open(CACHE_KEY);
    cache.put(airportCacheRequest, new Response(JSON.stringify(airports)));
}

function init(airports) {
    tableEventHandler = new TableEventHandler(airports);
    _setSessionStorageDataToElements();
    setDisableStatusOfPageBtns();
    if (tableEventHandler.currentPage > 1) {
        changeTablePage();
    } else {
        updateTableDom();
    }
    setPaginationText();
    toggleLoader();
    bindEventsToElements();
}

function _getSessionStorageData() {
    const typeFilters = JSON.parse(sessionStorage.getItem('selectedTypeFiltes'));
    const filterText = sessionStorage.getItem('filterStr');
    const currentPage = sessionStorage.getItem('currentPage');
    const pageSize = sessionStorage.getItem('pageSize');
    return { typeFilters, filterText, currentPage, pageSize };
}

function _setSessionStorageDataToElements() {
    const { typeFilters, filterText, currentPage, pageSize } = _getSessionStorageData();
    if (typeFilters?.length > 0) {
        selectedTypeFilters = typeFilters;
        _checkSelectedTypes();
    }
    if (filterText?.trim().length > 0) {
        searchFilterInput.value = filterText;
    }
    if (+currentPage) {
        tableEventHandler.setCurrentPage(+currentPage);
    }
    if (+pageSize) {
        tableEventHandler.setPageSize(+pageSize);
        pageSizeChangeDropdown.value = pageSize;
    }
}

function _checkSelectedTypes() {
    typeFilters.forEach(type => {
        if (selectedTypeFilters.includes(type.value)) {
            type.checked = true;
        }
    })
}

/**
 * @param {HTMLElement} btn
 * @param {boolean} isDisabled 
 */
function checkAndSetBtnDisableStatus(btn, isDisabled) {
    if (isDisabled) {
        btn.setAttribute('disabled', isDisabled);
        btn.className = 'disabled';
        btn.classList.remove('cursor-pointer');
    } else {
        btn.removeAttribute('disabled');
        btn.classList.remove('disabled');
        btn.classList.add('cursor-pointer');
    }
}

function setDisableStatusOfPageBtns() {
    const isPrevBtnDisabled = tableEventHandler.isPrevBtnDisabled();
    const isNextBtnDisabled = tableEventHandler.isNextBtnDisabled();
    checkAndSetBtnDisableStatus(previousPageBtn, isPrevBtnDisabled);
    checkAndSetBtnDisableStatus(nextPageBtn, isNextBtnDisabled);
}

function setPaginationText() {
    pageNumberString.textContent = tableEventHandler.getPaginationString();
    totalRowsString.textContent = tableEventHandler.filteredAirportList.length;
}

function toggleLoader() {
    loaderRow.classList.toggle('d-none');
}

function bindEventsToElements() {
    bindEventsToTypeFilters();
    bindEventToFilterInput();
    bindEventToPrevPageBtn();
    bindEventToNextPageBtn();
    bindEventToPageSizeDropdown();
}

function bindEventsToTypeFilters() {
    typeFilters.forEach(filter => {
        filter.addEventListener('change', (event) => {
            if (event.target.checked) {
                selectedTypeFilters.push(event.target.value);
            } else {
                selectedTypeFilters = selectedTypeFilters.filter(type => type != event.target.value);
            }
            updateTableWithFilter();
            _saveSelectedTypesToSessionStorage();
        });
    });
}

/**
 * @param {Function} callback 
 * @param {number} delay 
 */
const debounce = (callback, delay) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => callback(args), delay);
    }
}

const optimizedSearchFilter = debounce(updateTableWithFilter, 500);

function bindEventToFilterInput() {
    searchFilterInput.addEventListener('keyup', () => optimizedSearchFilter());
}

function updatePaginator() {
    setPaginationText();
    setDisableStatusOfPageBtns();
}

function updateTableWithFilter() {
    updateTableDom();
    updatePaginator();
    _saveFilterStrToSessionStorage();
}

function updateTableDom() {
    const filteredRows = tableEventHandler.getFilterdAirports(selectedTypeFilters, searchFilterInput.value);
    appendRowsToTableBody(filteredRows);
}

function appendRowsToTableBody(filteredRows) {
    const tableRows = getTableRows(filteredRows);
    clearTBody();
    tableRows.forEach(row => tableBody.appendChild(row));
}

function clearTBody() {
    while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.firstChild);
    }
}

function changeTablePage() {
    const filteredRows = tableEventHandler.getPaginatedAirports(selectedTypeFilters, searchFilterInput.value);
    appendRowsToTableBody(filteredRows);
    updatePaginator();
}

function bindEventToPrevPageBtn() {
    previousPageBtn.addEventListener('click', () => {
        tableEventHandler.goToPreviousPage();
        changeTablePage();
        _saveCurrentPageToSessionStorage();
    });
}

function bindEventToNextPageBtn() {
    nextPageBtn.addEventListener('click', () => {
        tableEventHandler.goToNextPage();
        changeTablePage();
        _saveCurrentPageToSessionStorage();
    });
}

function bindEventToPageSizeDropdown() {
    pageSizeChangeDropdown.addEventListener('change', (event) => {
        tableEventHandler.setPageSize(+event.target.value);
        updateTableWithFilter();
        _savePageSizeToSesionStorage();
    });
}

function _saveFilterStrToSessionStorage() {
    sessionStorage.setItem('filterStr', searchFilterInput.value);
}

function _saveSelectedTypesToSessionStorage() {
    sessionStorage.setItem('selectedTypeFiltes', JSON.stringify(selectedTypeFilters));
}

function _saveCurrentPageToSessionStorage() {
    sessionStorage.setItem('currentPage', tableEventHandler.currentPage)
}

function _savePageSizeToSesionStorage() {
    sessionStorage.setItem('pageSize', tableEventHandler.pageSize)
}

