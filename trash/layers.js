import XYZ from 'ol/source/XYZ';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature.js';

const base = new TileLayer({
    source: new XYZ({ url: 'http://192.168.20.84/hot/{z}/{x}/{y}.png' }),
});

const overlay = new TileLayer({
    source: new XYZ({ url: '/tiles/{z}/{x}/{-y}.png' }),
});

const iconFeature = new Feature();
const MarkerSource = new VectorSource({
    features: [iconFeature],
});

const MarkerLayer = new VectorLayer({
    source: MarkerSource,
});

export { base, overlay, MarkerSource, MarkerLayer };
