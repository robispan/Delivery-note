const $ = require('jquery');
const storage = require('electron-json-storage');
const ipc = require('electron').ipcRenderer;


// Variable for storing json file data
let loadedData = {};

// Choose display language for index.html 
// (add/edit translations: 'assets/localization/localization.js')
const lang = 'eng';

// Print json file path to console
// console.log(storage.getDefaultDataPath());

// Initilize program
initialize();


// ++++++++++++++++++++++++++ INITIALIZE ++++++++++++++++++++++++++


function initialize() {

    // Get data from json file
    storage.get('data', function (error, data) {        
        if (error) throw error;

        // Save data to loadedData object
        try {
            loadedData = data;
        }
        catch (err) {
            console.log(err);
        }
        if (!loadedData.tools) loadedData.tools = {};
        if (!loadedData.firms) loadedData.firms = {};
        if (!loadedData.noteNum) loadedData.noteNum = 1;
        if (!loadedData.location) loadedData.location = '';

        // Display current note number in the input
        displayCode(loadedData.noteNum);

        // Display saved location in the input
        $('#location').val(loadedData.location);

        // Translate elements in index.html
        localizeHTML(lang);

        // Load typeaheads for firms (top left)
        loadThFirms(loadedData);

        // Add rows to products table
        addRows(loadedData, 3);
    });
}


// ++++++++++++++++++++++++++ EVENT HANDLERS ++++++++++++++++++++++++++


// ++++++++++++++ TOP LEFT ++++++++++++++


// Form submitted on enter key or save button
$('#companies form').submit(() => saveFirmData(loadedData));

// Firm number selected on Typeahead
$('#firmNum').bind('typeahead:select', function (_e, suggestion) {
    const firm = loadedData.firms[suggestion];
    fillFirmFields(firm);

    // Reload Typeaheads
    loadThFirms(loadedData);
});

// Firm name selected on Typeahead
$('#firmName').bind('typeahead:select', function (_e, suggestion) {
    const name = suggestion;
    const firm = Object.keys(loadedData.firms)
        .map(key => {
            const res = loadedData.firms[key];
            res.num = key;
            return res;
        })
        .filter(firm => firm.name === name)[0];
    fillFirmFields(firm);

    // Reload Typeaheads
    loadThFirms(loadedData);
});

// Get new firm code button
$('#addFirm').click(() => {
    let last = 0;
    const keys = Object.keys(loadedData.firms);
    if (keys.length > 0)
        last = keys.reduce((a, b) => a > b ? a : b);
    $('#firmNum').val(parseInt(last) + 1);
});


// ++++++++++++++ TOP RIGHT ++++++++++++++


// Save location on focusout
$('#location').focusout(() => {
    loadedData.location = event.target.value;
    saveToJson(loadedData, false);
});

// Short Delivery note code input focusout
$('#noteNum').focusout(() => formatDelCode());

// Short date input focusout
$('#date').focusout(() => formatDate());
$('#order-date').focusout(() => formatDate());
$('#complete-date').focusout(() => formatDate());


// ++++++++++++++ TABLE ++++++++++++++


// Navigate table on arrow key press
$(document).on('keydown', '#table', navigateTable);

// Turn off arrow key navigation when typeahead results are rendered
$('#table').bind('typeahead:render', (_e, suggestions, _f, _d) => {
    if (suggestions)
        $(document).off('keydown', '#table', navigateTable);
});

// Autofill tool fields when typeahead suggestion is selected
$('#table').bind('typeahead:select', (event, suggestion) => {
    fillToolFields(event, loadedData, suggestion);

    // Enable arrow key navigation in table
    $(document).on('keydown', '#table', navigateTable);
});

// Reset arrow key navigation in table on typeahead idle
$('#table').bind('typeahead:idle', () => {
    $(document).off('keydown', '#table', navigateTable);
    $(document).on('keydown', '#table', navigateTable);
});

// Add row button click
$('#add-row').click(() => addRows(loadedData));

// Remove row button click
$('#remove-row').click(() => removeRow());

// Save tool submit button click
$(document).on('submit', '#table .table-row', () => saveToolData(loadedData));

// Format unit fields on focusout
$(document).on('focusout', '#table .unit', () => formatUnits());

// On tool name, code 1 and code 2 input focus
$(document).on('focusout', '#table .name', () => togglePlusBtn(loadedData));
$(document).on('focusout', '#table .code1', () => togglePlusBtn(loadedData));
$(document).on('focusout', '#table .code2', () => togglePlusBtn(loadedData));

// Tab press on bottom-right field (blur event) -> Add new row
$(document).on('keydown', '.table-row:last-child .item:nth-child(6)', (event) => {

    // Check if tab key was pressed
    if (event.keyCode == '9') {

        // Add new row
        addRows(loadedData);

        // Navigate to last row
        $(document).find('.table-row:last-child .item:nth-child(1) input').focus();
    }
});


// ++++++++++++++ PRINT ++++++++++++++


// Print button
$('#save-pdf').click(() => {
    const noteNum = $("#noteNum").val();
    ipc.send('print-to-pdf', noteNum);
});

// Print success
ipc.on('wrote-pdf', () => {
    loadedData.noteNum = +$("#noteNum").val().substr(0, 3) + 1;
    saveToJson(loadedData, false);
    displayCode(loadedData.noteNum);
});
