var raster = new ol.layer.Tile({
  source: new ol.source.OSM(),
});

var source = new ol.source.Vector({ wrapX: false });

var vector = new ol.layer.Vector({
  source: source,
});

console.log("Vector:", raster);

//creating the map
var map = new ol.Map({
  layers: [raster, vector],
  target: "map",
  view: new ol.View({
    center: ol.proj.fromLonLat([-52.707546, 47.562509]),
    zoom: 4,
  }),
});

//creating drop downs for datasets and variables

let dropdown = document.getElementById("dataset-form");
dropdown.length = 0;

let defaultOption = document.createElement("option");
defaultOption.text = "Choose the dataset";

dropdown.appendChild(defaultOption);
dropdown.selectedIndex = 0;

//getting the list of stations
const url = "https://cioosatlantic.ca/ckan/api/3/action/package_list";

fetch(url)
  .then(function (response) {
    if (response.status !== 200) {
      console.warn(
        "Looks like there was a problem. Status Code: " + response.status
      );
      return;
    }

    // Examine the text in the response
    response.json().then(function (data) {
      let option;
      for (let i = 3; i < data.result.length; i++) {
        option = document.createElement("option");
        option.text = data.result[i];
        dropdown.appendChild(option);
      }
    });
  })
  .catch(function (err) {
    console.error("Fetch Error -", err);
  });

var eve = document.getElementById("dataset-form");

//generate a drop down of variables belong to selected dataset by user
eve.addEventListener("click", function getSelectedValue() {
  let variableDropdown = document.getElementById("variable-form");
  variableDropdown.length = 0;

  let defaultOpt = document.createElement("option");
  defaultOpt.text = "Choose the variable";

  variableDropdown.appendChild(defaultOpt);
  variableDropdown.selectedIndex = 0;

  var station = eve.options[eve.selectedIndex].value;
  fetchData(station);

  //getting the data of the selected station
  fetch(
    "https://cioosatlantic.ca/ckan/api/3/action/package_show?id=" + station
  ).then(function (response) {
    if (response.status !== 200) {
      console.warn(
        "Looks like there was a problem. Status Code: " + response.status
      );
      return;
    }

    // Examine the text in the response
    response.json().then(function (data) {
      const variable = data.result.keywords.fr;
      let option;

      //generates the variables of selected dataset in the dropdown
      for (let i = 0; i < variable.length; i++) {
        option = document.createElement("option");
        option.text = variable[i];
        variableDropdown.appendChild(option);
      }
    });
  });
});

//fetching the data of all datasets and reformating as a dictionary
function fetchData(station) {
  fetch(
    "https://www.smartatlantic.ca/erddap/tabledap/allDatasets.json?datasetID%2Caccessible%2Cinstitution%2CdataStructure%2Ccdm_data_type%2Cclass%2Ctitle%2CminLongitude%2CmaxLongitude%2ClongitudeSpacing%2CminLatitude%2CmaxLatitude%2ClatitudeSpacing%2CminAltitude%2CmaxAltitude%2CminTime%2CmaxTime%2CtimeSpacing%2Cgriddap%2Csubset%2Ctabledap%2CMakeAGraph%2Csos%2Cwcs%2Cwms%2Cfiles%2Cfgdc%2Ciso19115%2Cmetadata%2CsourceUrl%2CinfoUrl%2Crss%2Cemail%2CtestOutOfDate%2CoutOfDate%2Csummary"
  )
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      columnNames = data["table"]["columnNames"];
      dict = [];
      data["table"]["rows"].slice(1).forEach((rows) => {
        var pairs = {};
        columnNames.forEach((columnName, i) => (pairs[columnName] = rows[i]));
        dict.push(pairs);
      });
      return dict;
    })
    .then((data) => handleData(data, station));
}

//function to retrieve info from fetched data
function handleData(data, station) {
  console.log("fetched data:", data);
  data.forEach((row) => {
    //Check if the station ID (dataset) selected by user
    // is among station IDs in ERDAP
    if (row["datasetID"].toLowerCase() === station) {
      coords = [row["minLatitude"], row["minLongitude"]];
      makeMarker(coords);
      //function to open the popup when click on it
      map.on("click", function (event) {
        if (map.hasFeatureAtPixel(event.pixel) === true) {
          var coordinate = event.coordinate;
          content.innerHTML =
            "station name: " + station + " coordination: " + coordinate;
          var btn = document.createElement("BUTTON");
          var btn1 = document.createElement("BUTTON");
          var removeMarkerBtn = document.createElement("BUTTON");
          btn.className = "btn";
          btn.innerHTML = "Show more";
          btn1.className = "btn";
          btn1.innerHTML = "Show less";
          removeMarkerBtn.className = "btn";
          removeMarkerBtn.innerHTML = "Remove marker";
          content.appendChild(btn);
          content.appendChild(removeMarkerBtn);

          btn.addEventListener("click", function onClickButton() {
            var desc = document.createElement("div");
            desc.id = "summary1";
            console.log("description:", row["summary"], "desc:", desc);
            desc.innerHTML = row["summary"];
            content.appendChild(desc);
            content.appendChild(btn1);
            removeEventListener("click", onClickButton);
          });
          btn1.addEventListener("click", function addHandler() {
            var desc1 = document.getElementById("summary1");
            desc1.innerHTML = " ";
            content.appendChild(desc1);
            content.removeChild(btn1);
            content.removeChild(desc1);
          });

          removeMarkerBtn.addEventListener("click", function removeMarker() {
            map.removeLayer(marker);
          });

          popup.setPosition(coordinate);
        } else {
          popup.setPosition(undefined);
          closer.blur();
        }
      });
    }
  });
  dragNewBox(data);
  // return data;
}

//function to make marker getting coordinates
function makeMarker(coords) {
  //adding marker for each station
  var marker = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: [
        new ol.Feature({
          geometry: new ol.geom.Point(
            ol.proj.fromLonLat([coords[1], coords[0]])
          ),
        }),
      ],
    }),
  });

  marker.setStyle(
    new ol.style.Style({
      image: new ol.style.Icon({
        crossOrigin: "anonymous",
        src: "dot.png",
      }),
    })
  );
  map.addLayer(marker);
}

//initialize the popup
var container = document.getElementById("popup");
var content = document.getElementById("popup-content");
var closer = document.getElementById("popup-closer");

var popup = new ol.Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250,
  },
});

map.addOverlay(popup);

closer.onclick = function () {
  popup.setPosition(undefined);
  closer.blur();
  return false;
};

//function to draw on map
// var typeSelect = document.getElementById("type");

function dragNewBox(data) {
  /*  var a =coordOfStations();
  console.log("a",a); */
  var draw; // global so we can remove it later
  /* function addInteraction() {
  var value = typeSelect.value;
  if (value !== "None") { */
  var draw = new ol.interaction.DragBox({
    condition: ol.events.condition.noModifierKeys,
    style: new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: [0, 0, 255, 1],
      }),
    }),
  });

  draw.on("boxend", function (evt) {
    var geom = evt.target.getGeometry();
    console.log("geom", geom);
    var feat = new ol.Feature({ geometry: geom });
    source.addFeature(feat);
  });

  //shows the stations inside the box
  draw.on("boxend", function (evt) {
    var stationsInside = [];
    console.log("im here");
    var polygon_extent = draw.getGeometry().extent_;
    //var polygonGeometry = evt.target.getGeometry();
    console.log("polygon_extent:", polygon_extent);
    data.forEach((row) => {
      coord = ol.proj.fromLonLat([row["minLongitude"], row["minLatitude"]]);
      if (ol.extent.containsCoordinate(polygon_extent, coord)) {
        stationsInside.push(row);
      }
    });
    var IDs = [];
    if (stationsInside.length == 0) {
      content.innerHTML = "These is no station in selected area!";
      popup.setPosition(draw.getGeometry().getCoordinates()[0][0]);
    } else {
      stationsInside.forEach((row) => {
        IDs.push(row["datasetID"]);
        makeMarker([row["minLatitude"], row["minLongitude"]]);
      });
      content.innerHTML =
        "Number of stations: " +
        stationsInside.length +
        "<br />" +
        "list of stations in selected area:" +
        "<br />" +
        IDs.toString().split(",").join("<br />");
      popup.setPosition(
        ol.proj.fromLonLat([
          stationsInside[0]["minLongitude"],
          stationsInside[0]["minLatitude"],
        ])
      );
    }
  });

  map.addInteraction(draw);
  let coordsPoly = findCoords();

  // Handle change event.
  /* typeSelect.onchange = function () {
  vector.getSource().clear(); //Remove the previous interaction 
  map.removeInteraction(draw);
  addInteraction();
};

addInteraction(); */
}

//function to show the coordinates of each point on the map
function onMouseMove(browserEvent) {
  var coordinate = browserEvent.coordinate;
  //reformat coordinates
  coordinate = [coordinate[1].toFixed(2), coordinate[0].toFixed(2)];
  coordinateDisplayer = document.getElementById("coo-display");
  coordinateDisplayer.value = coordinate;
  //var pixel = map.getPixelFromCoordinate(coordinate);
}

map.on("pointermove", onMouseMove);

//function to get the coordinates of a drawn polygan
function findCoords() {
  source.on("addfeature", function (evt) {
    var feature = evt.feature;
    var coords = feature.getGeometry().getCoordinates();
    console.log("coordination of vertices:", coords);
    // boundingBox(coords);
  });
}
