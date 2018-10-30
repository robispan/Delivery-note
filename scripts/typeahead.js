
require('typeahead.js');


// ++++++++++++++++++++++++++ TYPEAHEAD FUNCTIONS ++++++++++++++++++++++++++


// Load Typeaheads for firms
function loadThFirms(loadedData) {

  const firmKeys = Object.keys(loadedData.firms);
  const firmNames = firmKeys.map(key => loadedData.firms[key].ime);

  // Settings for each Typeahead
  let taInstances = [
      {
          data: firmNames,
          domEl: $('#firmName')
      },
      {
          data: firmKeys,
          domEl: $('#firmNum')
      }
  ];

  // Initialize all Typeaheads
  taInstances.forEach(taInstance => {
      inittypeahead(taInstance);
  });
}

// Load Typeaheads for tools
function loadThTools(loadedData) {

  // Datasets
  const toolKeys = Object.keys(loadedData.tools);
  const toolKeys2 = toolKeys.map(key => loadedData.tools[key].code2);
  const toolNames = toolKeys.map(key => loadedData.tools[key].ime);

  let taInstances = [];

  const nr = document.getElementById('table').childElementCount;

  for (let i = 1; i < nr; i++) {
      const taName = {
          data: toolNames,
          domEl: $(`#name-${i}`)
      };
      const taCode1 = {
          data: toolKeys,
          domEl: $(`#cod1-${i}`)
      };
      const taCode2 = {
          data: toolKeys2,
          domEl: $(`#cod2-${i}`)
      };
      taInstances = taInstances.concat(taName, taCode1, taCode2);
  }

  taInstances.forEach(taInstance => {
      inittypeahead(taInstance);
  });
}

// Initialize typeahead instance
function inittypeahead(taInstance) {

  // Destroy current Typeahead instance if it exists
  taInstance.domEl.typeahead('destroy');

  // Init new Typeahead instance
  taInstance.domEl.typeahead({
      hint: true,
      highlight: true,
      minLength: 1
  },
      {
          name: 'data',
          source: substringMatcher(taInstance.data)
      });
}

function substringMatcher(strs) {
  return function findMatches(q, cb) {
      var matches, substrRegex;

      // an array that will be populated with substring matches
      matches = [];

      // regex used to determine if a string contains the substring `q`
      substrRegex = new RegExp(q, 'i');

      // iterate through the pool of strings and for any string that
      // contains the substring `q`, add it to the `matches` array
      $.each(strs, function (i, str) {
          if (substrRegex.test(str)) {
              matches.push(str);
          }
      });
      cb(matches);
  };
}

