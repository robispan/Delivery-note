const $ = require('jquery');
const storage = require('electron-json-storage');
const ipc = require('electron').ipcRenderer;


// Variable for storing json file data
let loadedData = {};

// Print json file path to console
// console.log(storage.getDefaultDataPath());

// Initilize program
initialize();


// ++++++++++++++++++++++++++ INITIALIZE ++++++++++++++++++++++++++


function initialize() {
    // Get data from json file
    storage.get('podatki', function (error, data) {
        if (error) throw error;
        if (!data) {
            alert('Datoteka je prazna!');
        }
        // Save data to loadedData object
        try {
            loadedData = data;
        }
        catch (err) {
            console.log(err);
        }
        if (!loadedData.tools) loadedData.tools = {};
        if (!loadedData.firms) loadedData.firms = {};
        if (!loadedData.last) loadedData.last = 0;

        // Update delivery note code
        updateCode(loadedData);

        // Load typeaheads for firms (top left)
        loadThFirms(loadedData);

        // Add rows to products table
        addRows(loadedData, 1);

    });
}


// ++++++++++++++++++++++++++ EVENT HANDLERS ++++++++++++++++++++++++++


// ++++++++++++++ TOP LEFT ++++++++++++++


// Save new firm
$('#form-firms').submit(() => saveFirmData(loadedData));

// Firm number selected on Typeahead
$('#firmNum').bind('typeahead:select', function (ev, suggestion) {
    const firm = loadedData.firms[suggestion];
    fillFirmFields(firm);

    // Reload Typeaheads
    loadThFirms(loadedData);
});

// // Firm name selected on Typeahead
$('#firmName').bind('typeahead:select', function (ev, suggestion) {
    const name = suggestion;
    const firm = Object.keys(loadedData.firms)
        .map(key => {
            const res = loadedData.firms[key];
            res.num = key;
            return res;
        })
        .filter(firm => firm.ime === name)[0];
    fillFirmFields(firm);

    // Reload Typeaheads
    loadThFirms(loadedData);
});

// Add new code for firm button
$('#addFirm').click(() => {
    let last = 0;
    const keys = Object.keys(loadedData.firms);
    if (keys.length > 0)
        last = keys.reduce((a, b) => a > b ? a : b);
    $('#firmNum').val(parseInt(last) + 1);
});


// ++++++++++++++ TOP RIGHT ++++++++++++++


// Update Delivery note code button
$('#updateNr').click(() => updateCode(loadedData));

// Short Delivery note code input focusout
$('#stDob').focusout(() => formatDelCode());

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
$(document).on('focusout', '#table .unit', () => {

    // Format input
    const val = event.target.value;

    switch (val) {
        case '1':
            event.target.value = 'piece';
            break;
        case '2':
            event.target.value = 'ton';
            break;
        case '3':
            event.target.value = 'kg';
            break;
    }
    // Remove focus out handler
    $(event.target).off();
});

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


// ++++++++++++++ PRINT BUTTON ++++++++++++++


// Print button
$('#save-pdf').click(() => {
    ipc.send('print-to-pdf');
});

// Print success
ipc.on('wrote-pdf', () => {
    loadedData.last += 1;
    saveToJson(loadedData, false);
});

