import XYZ from 'ol/source/XYZ';
import TileLayer from 'ol/layer/Tile';
import {Map, View} from 'ol';
import {fromLonLat} from 'ol/proj';
import Draw from 'ol/interaction/Draw';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import {Icon, Style} from 'ol/style.js';
import io from 'socket.io-client';


////////////////////////////////////////////////////// socket
// Setting up socket
const socket = io('http://127.0.0.1:5000');

// Handle connection
socket.on('connect', () => {
  console.log('Connected to Flask Socket.IO server');
});

socket.emit('init'); //not doing anything now

// Handle 'update' events from Flask
socket.on('update', (data) => {
  console.log('Received update:', data);
  updateMap(data);
});

socket.on('Initialize', (baseview) => {
  console.log('Received', baseview)
});


////////////////////////////////////////////////////// map
//SETTING UP OUR LAYERS
//  Base Layer
var base = new TileLayer({
  source: new XYZ(
    {url:'http://192.168.20.84/hot/{z}/{x}/{y}.png'}
  ),
})

//Overlay (CSL Layer)
var overlay = new TileLayer({
  source: new XYZ(
    {url:'/tiles/{z}/{x}/{-y}.png'}
  ),
})

const iconFeature = new Feature({
  geometry: new Point(fromLonLat([76.2889, 9.9554])),
  name: 'Null Island',
});

const iconStyle = new Style({
  image: new Icon({
    // anchor: [0.5, 1],
    // anchorXUnits: 'fraction',
    // anchorYUnits: 'pixels',
    src: '/src/bluecam.png',
    scale: 0.06,
  }),
});

iconFeature.setStyle(iconStyle);

let MarkerSource = new VectorSource({
  features: [iconFeature],
});

let MarkerLayer = new VectorLayer({
  source: MarkerSource,
});

//Setting up view (zoom level and coordinates)
let view = new View({
  center: fromLonLat([76.2889, 9.9554]),
  zoom: 16,
})

//For loading our saved polygons from DB
// let GeojsonLayer

//Adding our Layers to the Map
const map = new Map({
  target: 'map-container',
  layers: [
    base, overlay, MarkerLayer
  ],
  view: view
});

//DRAW FUNCTIONALITIES
//Vector Source that will contain the features
let drawSource = new VectorSource();

//Layer that will contain our source
let drawLayer = new VectorLayer({
  source: drawSource,
})

let draw;

//Interaction for starting draw
function addInteraction(type) {
  draw = new Draw({
    source: drawSource,
    type: type,
  
  });
  drawLayer.set("name","Draw_Layer");
  map.addInteraction(draw);
  map.addLayer(drawLayer);
 
  console.log(drawLayer.getProperties())
}

document.getElementById('print').addEventListener('click',()=>{
  map.getLayers().forEach((layer)=> {
    let layer_name = layer.getProperties().name;
    console.log(layer.getProperties().name)
    if(layer_name === "Draw_Layer"){
      let source = layer.getSource();
      console.log(source.getFeatures()[0].getGeometry().getCoordinates())
    } 
  })
})
//Button for enabling and disabling draw
document.getElementById('draw-polygon').addEventListener('click', function() {
  addInteraction('Polygon');
});

document.getElementById('draw-point').addEventListener('click', function() {
  addInteraction('Point');
});

document.getElementById('disable-draw').addEventListener('click', function(){
  if (draw) {
      map.removeInteraction(draw);
  }
});


// Update the map with new points
function updateMap(data) {
  // Clear previous features
  MarkerSource.clear();

  // Iterate over the data and create new features
  data.forEach(item => {
    const iconFeature = new Feature({
      geometry: new Point(fromLonLat([item.longitude, item.latitude])),
      name: item.name,
    });

    const iconStyleOnline = new Style({
      image: new Icon({
        src: '/src/greencam.png',
        scale: 0.06,
      }),
    });

    const iconStyleOffline = new Style({
      image: new Icon({
        src: '/src/bluecam.png',
        scale: 0.06,
      }),
    });
    if (item.status == "Online"){
      iconFeature.setStyle(iconStyleOnline);
    }
    else{
      iconFeature.setStyle(iconStyleOffline);
    }
    
    MarkerSource.addFeature(iconFeature);
  });
}


//COMPASS
// function updateCompassRotation() {
//   var rotation = view.getRotation(); // Get rotation in radians
//   compass.style.transform = `rotate(${rotation}rad)`; // Apply rotation to compass icon
// }

// // Update compass rotation on view change
// view.on('change:rotation', updateCompassRotation);
// // Initial update
// updateCompassRotation();

// // Handle compass click to reset rotation
// compass.addEventListener('click', function() {
//   view.setRotation(0); // Reset rotation to 0 radians
// });

