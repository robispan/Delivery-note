# Delivery Note
Electron desktop app for making delivery notes with autocomplete Client / Product fields.
Input fields are automatically filled in when Client / Tool name or code is selected.
Twitter Typeahead is used for rendering suggestions.
Local JSON file that stores clients/tools data is automatically generated at [user]\AppData\Roaming\delivery-note\storage.

## Instructions

### General
- edit index.html file to enter your company information in div.user-data and address in div#data .row p

### Inside program

#### CLIENT DATA (TOP LEFT)

- enter client data in top-left and top-center section
- save client data to json file with save button or enter key
- when user types in Company Name / Company Code fields, suggestions of previously saved Company Names / Company Codes will be displayed - - when suggestion is selected all the saved data will be automatically filled in

#### OTHER INFO (TOP RIGHT)

- Number field: delivery note number is automatically updated with a 3-digit number and curent year when user saves the current Delivery note
- short codes can be user for date fields (e.g.: to get 1. 11. [current year] you can just enter: 0111 and date will be generated on focus out)

#### TABLE

- first three fields represent Tool data and can be saved / retrieved from JSON file in the same manner as Client data (see above)
- if new tool is entered and it hasn't been saved to JSON file, a plus button appears on the right side of table row on focusout
- tool can be saved to JSON file using enter key or plus button
- user can navigate the table with arrow keys
- if user presses the tab key when on the last field in the last row, new row is automatically generated
- rows can be added or removed with '+' and '-' buttons above the table

#### SAVE BUTTON

- save button saves Delivery Note content in print-friendly format to pdf file on the desktop and opens up the file automatically
