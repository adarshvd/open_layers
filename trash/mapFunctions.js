import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import { Icon, Style } from 'ol/style.js';
import { view } from './map.js';
import { MarkerSource } from './layers.js';

function initializeMap(data) {
    const newCenter = fromLonLat([data.longitude, data.latitude]);
    view.setCenter(newCenter);
    view.setZoom(data.zoom);
}

function updateMap(data) {
    MarkerSource.clear();

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

        if (item.status === "Online") {
            iconFeature.setStyle(iconStyleOnline);
        } else {
            iconFeature.setStyle(iconStyleOffline);
        }

        MarkerSource.addFeature(iconFeature);
    });
}

export { initializeMap, updateMap };
