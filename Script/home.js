// imports

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

let device_types;


// Replace console.log with console.log
console.log('Hello, world!');

//////////////////////////////////////////////////////
////////////////////////////////////////////////////// socket
// Setting up socket
const socket = io('http://127.0.0.1:5000');


// Handle connection
socket.on('connect', () => {
  console.log('Connected to Flask Socket.IO server');
});

// Handle disconnection
socket.on('disconnect', () => {
  console.log('Disconnected from Flask Socket.IO server');
  // Handle disconnection
  setTimeout(() => {
    connectSocket();
  }, 3000); // Retry connection after 3 seconds
});

// Socket.IO error handling (unchanged)
socket.on('error', (error) => {
  handleError(error);
  // Additional logic to handle connection loss, retry, or display a message
});



// Handle 'initialize' events from Flask
socket.on('initialize', (data) => {
  try{
    console.log('Received Initialize', data.baseview)
    console.log('Received Initialize', data.devices_types)
    device_types = data.devices_types;
    initializeMap(data.baseview);
  } 
  catch (error) {
    handleError(error);
    console.log('Error when setting map\'s center, zoom, or layers');
  }
});


// Handle 'update' events from Flask
socket.on('update', (data) => {
  // console.log('Received update:', data);
  updateMap(data);
});


//////////////////////////////////////////////////////
////////////////////////////////////////////////////// map

//SETTING UP OUR LAYERS
//  Base Layer
var base = new TileLayer({
  source: new XYZ(
    {url:'http://192.168.20.84/hot/{z}/{x}/{y}.png'}
  ),
})

//  Overlay (CSL Layer)
var overlay = new TileLayer({
  source: new XYZ(
    {url:'/tiles/{z}/{x}/{-y}.png'}
  ),
})


//  Marker Layer
const iconFeature = new Feature;

let MarkerSource = new VectorSource({
  features: [iconFeature],
});

let MarkerLayer = new VectorLayer({
  source: MarkerSource,
});


//Setting up view (zoom level and coordinates)
let view = new View;

//Adding our Layers to the Map
const map = new Map({
  target: 'map-container',
  layers: [
    base, overlay, MarkerLayer
  ],
  view: view
});


// Left Click logic on map
map.on('click', function (evt) {
  if (evt.originalEvent.which === 1){ //left click
    customMenu.style.display = 'none';

    console.log('Left clicked on map at:', evt.coordinate);

    map.forEachFeatureAtPixel(evt.pixel, function (feature) {
      const dev_name = feature.get('dev_name');
      if (dev_name) {
        console.log(`Left Clicked on feature: ${dev_name}`);
  
        // Remove any existing popups
        const existingPopup = document.getElementById('popup');
        if (existingPopup) {
          existingPopup.parentNode.removeChild(existingPopup);
        }
  
        // Create a new popup
        const popup = document.createElement('div');
        popup.id = 'popup';
        popup.className = 'popup';
        popup.innerText = dev_name;
  
        // Position the popup
        const coordinate = evt.coordinate;
        const pixel = map.getPixelFromCoordinate(coordinate);
        popup.style.left = pixel[0] + 'px';
        popup.style.top = pixel[1] + 'px';
  
        // Add the popup to the map container
        document.getElementById('map-container').appendChild(popup);
  
        // Remove the popup after 1 second
        setTimeout(() => {
          const existingPopup = document.getElementById('popup');
          if (existingPopup) {
            existingPopup.parentNode.removeChild(existingPopup);
          }
        }, 1000);
  
        // alert(`Clicked on feature: ${name}`); // Display the name in an alert or create a popup
      }
    });
  }
  else{
    console.log(evt.originalEvent.which);
  }
  
});



// Right click logic on map
map.on('contextmenu', (evt) => {
  if (evt.originalEvent.button === 2) {
    evt.preventDefault(); // Prevent default context menu

    console.log('Right clicked on map at:', evt.coordinate);

    map.forEachFeatureAtPixel(evt.pixel, function (feature) {
      const dev_id = feature.get('dev_id');
      const dev_name = feature.get('dev_name');
      const dev_type = feature.get('dev_type');
      const dev_status = feature.get('dev_status');
      const dev_rtsp = feature.get('dev_rtsp');
      console.log(typeof(dev_name)); // Should be "string"
    
      if (dev_name) {
        console.log(`Right Clicked on feature: ${dev_name}`);
    
        // Get the coordinates of the click
        const coordinates = evt.coordinate;
    
        // Clear existing options (optional)
        customMenu.innerHTML = ''; // Removes all child elements (previous options)
    
        // Access dictionary value using name dev_as key (if it exists)
        const deviceOptions = device_types[dev_type]; // deviceOptions will be the value associated with the name key
    
        // Check if deviceOptions exists before iterating
        if (deviceOptions) {
          for (const choice of deviceOptions) {
            const option = document.createElement('div');
            option.textContent = choice;
            option.addEventListener('click', () => {
              console.log(`Selected option: ${choice}`);
              // Emit a socket.io event with clicked feature details
              socket.emit('feature-right-clicked', {
                dev_id: dev_id,
                dev_name: dev_name,
                dev_type: dev_type,
                dev_status: dev_status,
                dev_rtsp: dev_rtsp,
                choice: choice,
                // coordinates: coordinates,//not needed
              });
              customMenu.style.display = 'none'; // Hide the menu after option selection
            });
            customMenu.appendChild(option);
          }
        } else {
          console.log(`No options found for device: ${dev_name}`); // Optional: Handle missing device type
        }
    
        // Position the custom menu
        customMenu.style.left = evt.pixel[0] + 'px';
        customMenu.style.top = evt.pixel[1] + 'px';
        customMenu.style.display = 'block';
      }
    });
    
  }
});




// Create the custom menu HTML element
const customMenu = document.createElement('div');
customMenu.id = 'customContextMenu';
customMenu.style.display = 'none';
customMenu.style.position = 'absolute';
customMenu.style.backgroundColor = 'white';
customMenu.style.border = '1px solid black';
customMenu.style.padding = '5px';

// Add options to the menu
const optionA = document.createElement('div');
optionA.textContent = 'Option A';
optionA.addEventListener('click', () => {
  console.log('Option A pressed');
  customMenu.style.display = 'none'; // Hide the menu after option selection
});

const optionB = document.createElement('div');
optionB.textContent = 'Option B';
optionB.addEventListener('click', () => {
  console.log('Option B pressed');
  customMenu.style.display = 'none'; // Hide the menu after option selection
});

customMenu.appendChild(optionA);
customMenu.appendChild(optionB);

document.body.appendChild(customMenu);

//middle click
document.addEventListener('mousedown', (evt) => {
  if (evt.which === 2) {
    console.log('Middle clicked on map at:', evt.coordinate); //not working
    // Perform your desired action here
  }
});





//////////////////////////////////////////////////////
/////////////////////////////////////////////// DRAW FUNCTIONALITIES

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
  try {
    // Perform user action
    map.getLayers().forEach((layer)=> {
      let layer_name = layer.getProperties().name;
      console.log(layer.getProperties().name)
      if(layer_name === "Draw_Layer"){
        let source = layer.getSource();
        console.log(source.getFeatures()[0].getGeometry().getCoordinates())
      } 
    })
  } 
  catch (error) {
    handleError(error);
    alert('Invalid operation');
  }

})
//Button for enabling and disabling draw
document.getElementById('draw-polygon').addEventListener('click', function() {
  try {
    // Perform user action
    addInteraction('Polygon');
  } 
  catch (error) {
    handleError(error);
    alert('Invalid operation');
  }
  
});

document.getElementById('draw-point').addEventListener('click', function() {
  try {
    // Perform user action
    addInteraction('Point');
  } 
  catch (error) {
    handleError(error);
    alert('Invalid operation');
  }
  
});

document.getElementById('disable-draw').addEventListener('click', function(){
  try {
    // Perform user action
    if (draw) {
      map.removeInteraction(draw);
    }
  } 
  catch (error) {
    handleError(error);
    alert('Invalid operation');
  }
});

//////////////////////////////////////////////////////
/////////////////////////////////////////////// HANDLE OTHER
document.getElementById('dropdown1-option1').addEventListener('click', function(){
  try {
    console.log("dropdown1-option1 pressed")
  } 
  catch (error) {
    handleError(error);
    alert('Invalid operation');
  }
});

document.getElementById('dropdown1-option2').addEventListener('click', function(){
  try {
    console.log("dropdown1-option2 pressed")
  } 
  catch (error) {
    handleError(error);
    alert('Invalid operation');
  }
});



// logout
document.getElementById('logout').addEventListener('click', function(){
  try {
    console.log("logout button pressed")
    logout();
  } 
  catch (error) {
    handleError(error);
    alert('Invalid operation');
  }
});












// Once everything is setup
// request flask to send initial configurations (baseview, )
socket.emit('init'); 


//////////////////////////////////////////////////////
////////////////////////////////////////////////////// Functions

// initialize map

function initializeMap(data){
  
  // Convert the latitude and longitude to the map's projection (assuming EPSG:3857)
  let newCenter = fromLonLat([data.longitude, data.latitude]);
  
  // Set the new center and zoom level
  view.setCenter(newCenter);
  view.setZoom(data.zoom);
}


// Update the map with new points
function updateMap(data) {
  // Clear previous features
  MarkerSource.clear();

  // Iterate over the data and create new features
  data.forEach(item => {
    try {
      const iconFeature = new Feature({
        geometry: new Point(fromLonLat([item.dev_longitude, item.dev_latitude])),
        dev_id: item.dev_id,
        dev_name: item.dev_name,
        dev_status: item.dev_status,
        dev_type: item.dev_type,
        dev_rtsp: item.dev_rtsp,
      });
      
    const iconStatus = item.dev_status;
    const iconType = item.dev_type;
  
    // Construct the image source dynamically
    const iconSrc = `/src/${iconType}${iconStatus}.png`;
  
    const iconStyle = new Style({
      image: new Icon({
        src: iconSrc,
        scale: 0.06,
      }),
    });
  
    iconFeature.setStyle(iconStyle);
  
    //here it will be updated to markerlayer
    MarkerSource.addFeature(iconFeature); 
      // Create feature and style
    } 
    
    catch (error) {
      handleError(error);
      console.log('Error creating feature or styling');
    }
  });
}


function logout() {
  // Your logout logic (e.g., clear cookies, send logout request)
  window.location.href = "index.html"; // Redirect to index.html
}



function handleError(error) {
  console.error('Error:', error);
  // just printing as of now
}



// to handle show/hide Controls
// const dropdownToggle = document.getElementById('dropdown-toggle');
// const dropdownMenu = document.getElementById('dropdown-menu');

// dropdownToggle.addEventListener('click',  
//  () => {
//   dropdownMenu.classList.toggle('show');  

// });

// to handle dropdowns
const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
const dropdownMenus = document.querySelectorAll('.dropdown-menu');

dropdownToggles.forEach((toggle,  
 index) => {
  toggle.addEventListener('click',  
 () => {
    dropdownMenus[index].classList.toggle('show');
  });
});

// to remove dropdown when clicked on else
document.addEventListener('click', event => {
  if (!event.target.closest('.dropdown-toggle') && !event.target.closest('.dropdown-menu')) {
    dropdownMenus.forEach(menu => {
      menu.classList.remove('show');
    });
  }
});


function logoutfun() {
  // Your logout logic (e.g., clear cookies, send logout request)
  window.location.href = "index.html"; // Redirect to index.html
}