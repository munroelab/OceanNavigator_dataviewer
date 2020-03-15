//creating the map
var map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ],
    view: new ol.View({
      center: ol.proj.fromLonLat([-52.707546,47.562509]), // Coordinates of St. John's
      zoom: 4 //Initial Zoom Level
    })
  });


// adding a marker

var marker = new ol.layer.Vector({
    source: new ol.source.Vector({
        features: [
            new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([-52.707546,47.562509]))
            })
        ]
    })
});

marker.setStyle(new ol.style.Style({
    image: new ol.style.Icon(({
        crossOrigin: 'anonymous',
        src: 'dot.png'
    }))
}));

map.addLayer(marker);


//initialize the popup
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

var overlay = new ol.Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
        duration: 250
    }
});

map.addOverlay(overlay);

closer.onclick = function() {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};

//function to open the popup when click on it
map.on('singleclick', function (event) {
    if (map.hasFeatureAtPixel(event.pixel) === true) {
        var coordinate = event.coordinate;

        content.innerHTML = ' you clicked on St. John\'s with coordination: '  + coordinate ;
        overlay.setPosition(coordinate);
    } else {
        overlay.setPosition(undefined);
        closer.blur();
    }
});


let dropdown = document.getElementById('dataset-form');
dropdown.length = 0;

let defaultOption = document.createElement('option');
defaultOption.text = 'Choose the dataset';

dropdown.appendChild(defaultOption);
dropdown.selectedIndex = 0;

const url = 'https://cioosatlantic.ca/ckan/api/3/action/package_list';
console.log("the url:", url)

fetch(url)  
  .then(  
    function(response) {  
      if (response.status !== 200) {  
        console.warn('Looks like there was a problem. Status Code: ' + 
          response.status);  
        return;  
      }

      // Examine the text in the response  
      response.json().then(function(data) {  
        let option;
    	for (let i = 3; i < data.result.length; i++) {
          option = document.createElement('option');
          option.text = data.result[i];
      	  dropdown.appendChild(option);
    	}    
      });  
    }  
  )  
  .catch(function(err) {  
    console.error('Fetch Error -', err);  
  });

  var eve = document.getElementById('dataset-form');
  
  //generate a drop down of variables belong to selected dataset by user
  eve.addEventListener("click", function GetSelectedValue(){
    let variableDropdown = document.getElementById('variable-form');
    variableDropdown.length = 0;

    let defaultOpt = document.createElement('option');
    defaultOpt.text = 'Choose the variable';

    variableDropdown.appendChild(defaultOpt);
    variableDropdown.selectedIndex = 0;

    var station = eve.options[eve.selectedIndex].value;
    console.log("station-name: ", station);
    fetch("https://cioosatlantic.ca/ckan/api/3/action/package_show?id=" + station )  
    .then(  
    function(response) {  
      if (response.status !== 200) {  
        console.warn('Looks like there was a problem. Status Code: ' + 
          response.status);  
        return;  
      }

      // Examine the text in the response  
      response.json().then(function(data) {  
        const variable= data.result.keywords.fr;
        let option;

        for (let i = 0; i < variable.length; i++) {
            option = document.createElement('option');
            option.text =variable[i];
            variableDropdown.appendChild(option);
        }
      
    });  
}  
    )
  }
  )