import { Map, View } from 'ol';
import { base, overlay, MarkerLayer } from './layers.js';

let view = new View();

const map = new Map({
    target: 'map-container',
    layers: [base, overlay, MarkerLayer],
    view: view,
});

export default map;
export { view };
