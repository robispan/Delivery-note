const $ = require('jquery');
const utf8 = require('utf8');
const storage = require('electron-json-storage');

// Choose display language for frontend texts located in this file
// (add/edit translations: 'assets/localization/localization.js')
const locale = translations.helpers_js['eng'];

// Add table row
function addRows(loadedData, num = 1) {

	// Repeat num-times
	for (let i = 0; i < num; i++) {

		// Get number of rows
		const nr = document.getElementById('table').childElementCount;

		// Create row element
		let row = document.createElement('form');
		row.classList.add('table-row');

		// Create row content
		// Number
		let inner = `<div class="item flex-1">
                      <input class="table-input" value="${nr}" tabindex="-1"/>
                  </div>`;
		// Tool name
		inner += `<div class="item flex-4">
                  <input name="name" id="name-${nr}" class="table-input typeahead name" required/>
              </div>`;
		// Code 1
		inner += `<div class="item flex-3">
                  <input name="code1" id="cod1-${nr}" class="table-input typeahead code1" required/>
              </div>`;
		// Code 2
		inner += `<div class="item flex-3">
                  <input name="code2" id="cod2-${nr}" class="table-input typeahead code2" required/>
              </div>`;
		// Quantity
		inner += `<div class="item flex-2">
                  <input class="table-input qty"/>
              </div>`;
		// Unit
		inner += `<div class="item flex-1">
                  <input class="table-input unit"/>
              </div>`;
		// Save button
		inner += `<button name="save" type="submit" class="tool-save no-print" tabindex="-1">+</button>`;

		// Place content into row
		row.innerHTML = inner;

		// Add row to dom
		document.getElementById('table').appendChild(row);
	}

	// Load Typeaheads for tools (in table)
	loadThTools(loadedData);
}

// Animate element (bounce) (animate.css)
function animate(el) {
	const effects = 'animated flash fast';
	const end = 'animationend';
	$(el).addClass(effects).one(end, () => {
		$(el).removeClass(effects);
	});
}

// Display delivery note code (top right) 
function displayCode(code) {
	const today = new Date();
	const year = today.getFullYear();
	const zeroFilled = ('000' + code).substr(-3);
	const val = `${zeroFilled}-${year}`;
	$('#noteNum').val(val);
}

// Fill firm fields (top left)
function fillFirmFields(firm) {
	$('#firmName').val(firm.name);
	$('#firmNum').val(firm.num);
	$('#firmStreet').val(firm.street);
	$('#firmAddress').val(firm.address);
	$('#phone').val(firm.tel);
	$('#mail').val(firm.mail);
	$('#vat').val(firm.VAT);
}

// Fill tool fields (table row)
function fillToolFields(event, loadedData, suggestion) {

	// Get input element reference
	const parent = event.target.parentNode.parentNode;
	const inputEl = $(parent).find('.tt-input')[0];

	// Get element identifier from id (e.g. 'name-1' -> 'name')
	const identifier = inputEl.id.slice(0, 4);

	// Get tool key
	let toolKey;
	if (identifier === 'name') {
		toolKey = Object.keys(loadedData.tools)
			.filter(key => loadedData.tools[key].name === suggestion)[0];
	}
	else if (identifier === 'cod2') {
		toolKey = Object.keys(loadedData.tools)
			.filter(key => loadedData.tools[key].code2 === suggestion)[0];
	}
	else
		toolKey = suggestion;

	// Get row number from id (e.g. 'cod1-12' -> 12)
	const inputId = inputEl.id;
	const rowNr = inputId.slice(5, inputId.length);

	// Fill fields with data
	$(`#name-${rowNr}`).val(loadedData.tools[toolKey].name);
	$(`#cod1-${rowNr}`).val(toolKey);
	$(`#cod2-${rowNr}`).val(loadedData.tools[toolKey].code2);

	// Reload Typeaheads
	loadThTools(loadedData);

	// Navigate to next field
	$(document).find(`.table-row:nth-child(${parseInt(rowNr) + 1}) .item:nth-child(5) input`).focus();
}

// Format delivery note code
function formatDelCode() {

	// Get input
	const input = event.target.value;

	// Check if input is the right format (only numbers 0-9)
	const regex = /^[0-9]+$/;
	if (!input.match(regex)) return;

	// Add zeros in front if number is less than 3 digits
	const zeroFilled = ('00' + input).substr(-3);

	// Format code with date
	const updated = zeroFilled + '-' + (new Date()).getFullYear();

	// Update input field
	event.target.value = updated;
}

// Format date (e.g. '11212' -> '12.12.2018')
function formatDate() {
	const today = new Date();
	const year = today.getFullYear();
	const val = event.target.value;
	if (val.length === 4) {
		day = val.slice(0, 2);
		month = val.slice(2, 4);
		if (parseInt(month) < 13 && parseInt(day) < 32) {
			event.target.value = `${day}. ${month}. ${year}`;
		}
	}
}

function formatUnits() {
    // Format input
    const val = event.target.value;
    switch (val) {
        case '1':
            event.target.value = locale.piece;
            break;
        case '2':
            event.target.value = locale.ton;
            break;
        case '3':
            event.target.value = locale.kg;
            break;
    }
    // Remove focus out handler
    $(event.target).off();
}

function getNewPosition(keyCode, pos) {

	// Get number of rows in table
	const rowCount = document.getElementById('table').childElementCount;

	// Default row/column
	let newRow = pos.row;
	let newCol = pos.col;

	// Up arrow
	if (keyCode == '38') {

		// Jump to last row if on top row
		if (pos.row === 2)
			newRow = rowCount;
		// Else jump to previous row
		else
			newRow = pos.row - 1;
	}

	// Down arrow
	else if (keyCode == '40') {

		// Jump to first row if on last row
		if (pos.row === rowCount)
			newRow = 2;
		// Else jump to next row
		else
			newRow = pos.row + 1;
	}

	// Left arrow
	else if (keyCode == '37') {

		// Jump to last column if on top column
		if (pos.col === 2) {
			newCol = 6;
		}
		// Else jump to previous column
		else
			newCol = pos.col - 1;
	}

	// Right arrow
	else if (keyCode == '39') {

		// Jump to first column if on last column
		if (pos.col === 6) {
			newCol = 2;
		}
		// Else jump to next column
		else
			newCol = pos.col + 1;
	}

	// Return new position
	return { col: newCol, row: newRow };
}

// Translate texts in index.html
function localizeHTML(lang) {
	// Elements
	for (id in translations.index_html.domEls[lang]) {
		const domEl = $('#' + id);
		const text = utf8.decode(translations.index_html.domEls[lang][id]);
		domEl.html(text);
	}
	// Placeholders
	for (id in translations.index_html.placeholders[lang]) {
		const domEl = $('#' + id);
		const text = utf8.decode(translations.index_html.placeholders[lang][id]);
		domEl.attr("placeholder", text);
	}
	// Inputs
	for (id in translations.index_html.inputs[lang]) {
		const domEl = $('#' + id);
		const text = utf8.decode(translations.index_html.inputs[lang][id]);
		domEl.attr("value", text);
	}
}

// Navigate with arrow keys
function navigateTable(event) {

	// Check if key pressed is arrow key
	if (event.keyCode != '37' && event.keyCode != '38' &&
		event.keyCode != '39' && event.keyCode != '40')
		return;

	// Get current position from row and column element
	// (rows are flex items inside a div, columns are flex items inside row.
	// First three inputs have id-s and are typeahead inputs, therefore
	// we have to navigate one lever higher to get to row/col element.)
	let row, col;
	if ($(event.target).attr('id')) {
		row = $(event.target.parentNode.parentNode.parentNode).index() + 1;
		col = $(event.target.parentNode.parentNode).index() + 1;
	}
	else {
		row = $(event.target.parentNode.parentNode).index() + 1;
		col = $(event.target.parentNode).index() + 1;
	}

	// Current position
	const pos = { row: row, col: col };

	// Get new position, e.g.: { row: 2, col: 3 }
	const newPos = getNewPosition(event.keyCode, pos);

	// Get new row and column div 'identifiers'
	let newRowDiv = `.table-row:nth-child(${newPos.row})`;
	let newColDiv = `.item:nth-child(${newPos.col})`;

	// Navigate to new position in table
	$(document).find(`${newRowDiv} ${newColDiv} input`).focus();
}

// Remove table row
function removeRow() {

	// Get number of existing rows (incl. table head)
	const nr = document.getElementById('table').childElementCount;

	if (nr > 2) {
		$('#table .table-row').last().remove();
	}
}

// Save firm data
function saveFirmData(loadedData) {
	event.preventDefault();
	const number = event.target.num.value;

	// If firm code exists ask for confirmation
	if (loadedData.firms[number]) {
		let conf = confirm(locale.updateFirmConf);
		if (!conf) return;
	}

	// Save data to firms object
	loadedData.firms[number] = {
		num: number,
		name: event.target.name.value,
		street: event.target.street.value,
		address: event.target.address.value,
		tel: event.target.phone.value,
		mail: event.target.mail.value,
		VAT: event.target.vat.value
	};

	// Load Typeaheads (top left section)
	loadThFirms(loadedData);

	// Save updated data to json file
	saveToJson(loadedData, false);

	// Animate save button
	animate($('#saveFirm'));
}

// Save tool data
function saveToolData(loadedData) {
	event.preventDefault();
	const code1 = event.target.code1.value;

	// Check if tool under code 1 exists
	if (loadedData.tools[code1]) {

		// Ask to confirm edit
		let conf = confirm(locale.updateProductConf);
		if (!conf) return;
	}

	// Save to data variable
	loadedData.tools[code1] = {
		name: event.target.name.value,
		code2: event.target.code2.value
	};

	// Save updated data to json file
	saveToJson(loadedData, false);

	// Reload Typeaheads
	loadThTools(loadedData);

	// Animate save button
	animate(event.target.save);

	// Hide save button
	const e = event;
	setTimeout(() => {
		$(e.target.save).removeClass('show');
	}, 600);
}

// Save data object to local json file
function saveToJson(loadedData, msg) {
	storage.set('data', loadedData, function (error) {
		if (error) throw error;
		if (msg) alert(locale.dataSaved);
	});
}

// Toggle 'save tool' button (on the right of table row)
function togglePlusBtn(loadedData) {

	// Get row div
	const rowEl = $(event.target.parentNode.parentNode.parentNode);

	// Get 'save tool' button
	const addToolBtn = $(rowEl).children('.tool-save')[0];

	// Get row number
	const rowNr = $(rowEl).index();

	// Get tool data from inputs (name, cod1 & cod2)
	const nameVal = $(`#name-${rowNr}`).val();
	const code1val = $(`#cod1-${rowNr}`).val();
	const code2val = $(`#cod2-${rowNr}`).val();

	// Check if all tool data fields have content
	if (nameVal !== '' && code1val !== '' && code2val !== '') {

		// Show save button if tool is not listed ...
		if (!loadedData.tools[code1val]) {
			$(addToolBtn).addClass('show');
		}

		// ... or if tool is listed and code2 or name inputs are edited
		else if (loadedData.tools[code1val].name !== nameVal ||
			loadedData.tools[code1val].code2 !== code2val) {
			$(addToolBtn).addClass('show');
		}

		// Else hide button
		else $(addToolBtn).removeClass('show');
	}

	// Else hide button
	else $(addToolBtn).removeClass('show');
}
