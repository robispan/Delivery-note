# Delivery Note
- Electron desktop app for making delivery notes with autocomplete Client / Product fields.
- Input fields are automatically filled in when Client / Product name or code is selected.
- Twitter Typeahead is used for rendering suggestions.
- Local JSON file that stores client/product data is automatically generated in the operating system application data directory (see: https://www.npmjs.com/package/electron-json-storage).
- tested on Windows 10


## Instructions

### Add user data and logo
- edit index.html file to enter your company information in div.user-data-2
- add your own logo (logo.png) to "assets/logo/" directory

### Choose/edit display language 
- to change display language edit "langHTML" variable value in renderer.js (default: "eng") and "langJS" variable value in scripts/helpers.js (default: "eng")
- translations are stored in "assets/localization/localization.js" 
- you can add or edit translations in the "translations" object variable; there are separate branches for index.html (keys represent DOM elements' IDs, values are used as translations for html text, placeholders or input values) and renderer.js (variables are directly linked to translations)

### Program usage

#### Client data (top left)

- enter client data in top-left section
- save client data to json file with save button or enter key
- when user types in the Company Name / Company Code fields, suggestions of previously saved data will be displayed - when suggestion is selected all the saved data will be automatically filled in

#### Other fields (top right)

- Number field: delivery note number is automatically updated with a 3-digit number and curent year when user saves the current Delivery note to pdf (button at the bottom of the screen)
- short codes can be user for date fields (e.g.: to get 01. 11. [current year] you can just enter: 0111 and date will be generated on focus out)

#### Table

- first three fields in each row represent product data and are stored to JSON file when saved
- when typing in first three fields, suggestions from saved data are rendered using Typeahead
- when a suggestion is selected, other two fields are autocomplete
- if new product is entered and it hasn't been saved to the JSON file, a plus button appears on the right side of table row on focusout (data is saved if plus button or enter key is pressed)
- user can navigate the table using arrow keys
- if user presses the tab key in the last field of the last row, new row is automatically generated
- rows can be added or removed with '+' and '-' buttons above the table

#### Save button

- save button saves Delivery Note content in print-friendly format to pdf file on the user's desktop and opens up the file automatically


## Screenshots

### Program interface

![product_selection](https://raw.githubusercontent.com/robispan/Delivery-Note/master/screenshots/product-suggestions.png)

### PDF output

![PDF output](https://raw.githubusercontent.com/robispan/Delivery-Note/master/screenshots/PDF-Output.png)
