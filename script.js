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

