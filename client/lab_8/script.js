/* eslint-disable prefer-const */

// a random number generator, to get a random item out of a large list (in createHtmlList function)
function getRandomIntInclusive(min, max) {
  const newMin = Math.ceil(min);
  const newMax = Math.floor(max);
  return Math.floor(Math.random() * (newMax - newMin + 1) + newMin);
}

// duplicates the downloaded data into a separate list we can change and interact with
function dataHandler (restoArray) {
  const listSize = restoArray.length;
  const range = [...Array(listSize).keys()];
  const newList = range.map((item, index) => restoArray[index]);
  return newList;
}

// this is the big daddy function, it does both search filtering & auto-displaying the results.
function createHtmlList(collection, entry, numba) {
// ^ collection = the duplicated restoArray
  // entry & numba = user inputs for name & zip

  // the next two "filter functions" apply filters based on user-input before we change the page
  const filterSearch = collection.filter((item) => {
    currentname = item.name;
    namefixed = currentname.toLowerCase();
    currentinput = entry.toLowerCase();
    return namefixed.includes(currentinput);
  });

  const filterZip = filterSearch.filter((item) => {
    currentzip = numba;
    restozip = item.zip;
    return restozip.includes(currentzip);
  });

  // if the filtered list is < 15 items, select them all. If it's more, select up to 15 (randomly).
  let displaylength = Math.min(filterZip.length, 15);

  const range2 = [...Array(displaylength).keys()];

  // eslint-disable-next-line no-unused-vars
  const displayed = range2.map((item, index) => {
    let restNum = getRandomIntInclusive(0, (filterZip.length - 1));
    let thisone = filterZip.splice(restNum, 1);
    displaylength -= 1;
    return thisone[0];
  });

  // this last section adds the search results to the page
  const targetList = document.querySelector('.resto_list');
  targetList.innerHTML = '';

  displayed.forEach((item) => {
    // eslint-disable-next-line prefer-template
    eachName = (item.name.length < 30) ? item.name : item.name.substr(0, 27) + '...';
    const newLines = `<li>${eachName.toLowerCase()}, ${item.zip}</li>`;
    targetList.innerHTML += newLines;
  });

  return displayed;
}

function initMap(targetId) {
  const baseCoord = [38.9, -76.8721];
  const map = L.map(targetId).setView(baseCoord, 10);
  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
  }).addTo(map);
  return map;
}

function addMapMarkers(map, locationArray) {
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      layer.remove();
    }
  });

  locationArray.forEach((item) => {
    coord = item.geocoded_column_1?.coordinates;
    if (coord === undefined) { return; }
    console.log(coord);
    L.marker([coord[1], coord[0]]).addTo(map);
  });
}

function refreshList(target, storage) {
  target.addEventListener('click', async(event) => {
    event.preventDefault();
    localStorage.clear();
    console.log('storage cleared');
    const results = await fetch('/api/foodServicesPG');
    const arrayFromJson = await results.json();
    localStorage.setItem(storage, JSON.stringify(arrayFromJson));
    location.reload();
  });
}

// main code works even if the user has input before clicking, or if user clicks w/no input
async function mainEvent() {
  const button = document.querySelector('.submit');
  button.style.display = 'none';

  const userchoice = document.querySelector('#resto_name');
  const userlocation = document.querySelector('#zip');

  const refresh = document.querySelector('#refresh_button');
  const retrievalVar = 'restaurants';

  const map = initMap('map');

  refreshList(refresh, retrievalVar);

  const storedData = localStorage.getItem(retrievalVar);
  const storedDataArray = JSON.parse(storedData);
  const newTable = storedDataArray.data;

  // all of the website's functionality is in here; user actions are what run the functions:
  if (newTable.length > 0) { // site is static/inactive until the back-end data loads
    button.style.display = 'block';
    let currentArray = [];
    let filterPhrase = '';
    let filterNum = '';
    // initially, button is inivisble, filters empty, currentArray is empty

    userchoice.addEventListener('input', async (event) => {
      filterPhrase = event.target.value;
      if (currentArray.length < 1) { return; }
      createHtmlList(currentArray, filterPhrase, filterNum);
      displayedRestaurants = createHtmlList(currentArray, filterPhrase, filterNum);
      addMapMarkers(map, displayedRestaurants);
      // reads and stores user input from "Restaurant name";
      // once they click submit and get their initial search results (currentArray),
      // createHtmlList auto-filters & updates the data based on new input.
    });

    userlocation.addEventListener('input', async (event) => {
      filterNum = event.target.value;
      if (currentArray.length < 1) { return; }
      createHtmlList(currentArray, filterPhrase, filterNum);
      displayedRestaurants = createHtmlList(currentArray, filterPhrase, filterNum);
      addMapMarkers(map, displayedRestaurants);

      // same as above, but this updates the results based on user input in "zip code"
    });

    button.addEventListener('click', async (submitEvent) => {
      submitEvent.preventDefault();
      currentArray = dataHandler(newTable);
      displayedRestaurants = createHtmlList(currentArray, filterPhrase, filterNum);
      addMapMarkers(map, displayedRestaurants);
      // when submit button is clicked, "currentArray" copies the whole data set for filtering,
      // "createHtmlList" displays the initial results that match the user's pre-entered filters,
      // Then the other "input" eventListeners (for name & zip) handle all future activity.
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => mainEvent());
// ^ this entire script (mainEvent) doesn't run until the page's front-end display is loaded.