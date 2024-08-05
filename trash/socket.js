import { initializeMap, updateMap } from './mapFunctions.js';
import io from 'socket.io-client';

const socket = io('http://127.0.0.1:5000');

socket.on('connect', () => {
    console.log('Connected to Flask Socket.IO server');
});

socket.on('initialize', (baseview) => {
    console.log('Received Initialize', baseview);
    initializeMap(baseview);
});

socket.on('update', (data) => {
    console.log('Received update:', data);
    updateMap(data);
});

socket.emit('init');

export default socket;
