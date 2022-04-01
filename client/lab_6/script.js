function getRandomIntInclusive(min, max) {
  const newMin = Math.ceil(min);
  const newMax = Math.floor(max);
  return Math.floor(Math.random() * (newMax - newMin + 1) + newMin);
}

function restoArrayMake(dataArray) {
  console.log('fired dataHandler');
  const range = [...Array(15).keys()];
  const listItems = range.map((item, index) => {
    const restNum = getRandomIntInclusive(0, dataArray.length - 1);
    return dataArray[restNum];
  });
  return listItems;
}
function createHtmlList(collection) {
  const targetList = document.querySelector('.restaruent-list');
  targetList.innerHTML = '';
  collection.forEach((item) => {
    const {name} = item;
    const displayName = name.toLowerCase();
    const injectThisItem = `<li>${displayName}</li>`;
    targetList.innerHTML += injectThisItem;
  });
}
async function mainEvent() {
  console.log("script loaded");
  const form = document.querySelector(".first");
  const submit = document.querySelector(".submit");

  const results = await fetch("https://data.princegeorgescountymd.gov/resource/umjn-t2iz.json");
  const arrayFromJson = await results.json();
  console.log(arrayFromJson);

  if (arrayFromJson.length > 0) {
    submit.style.display = "block";
    form.addEventListener("submit", async (submitEvent) => {
      submitEvent.preventDefault();
      console.log("form submission");
      const restoArray = restoArrayMake(arrayFromJson);
      createHtmlList(restoArray);
    });
  }
}

document.addEventListener('DOMContentLoaded', async() => mainEvent());