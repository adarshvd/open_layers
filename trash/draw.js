import Draw from 'ol/interaction/Draw';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import map from './map.js';

const drawSource = new VectorSource();
const drawLayer = new VectorLayer({ source: drawSource });
let draw;

function addInteraction(type) {
    draw = new Draw({ source: drawSource, type: type });
    drawLayer.set("name", "Draw_Layer");
    map.addInteraction(draw);
    map.addLayer(drawLayer);
}

document.getElementById('print').addEventListener('click', () => {
    map.getLayers().forEach((layer) => {
        if (layer.getProperties().name === "Draw_Layer") {
            const source = layer.getSource();
            console.log(source.getFeatures()[0].getGeometry().getCoordinates());
        }
    });
});

document.getElementById('draw-polygon').addEventListener('click', () => addInteraction('Polygon'));
document.getElementById('draw-point').addEventListener('click', () => addInteraction('Point'));
document.getElementById('disable-draw').addEventListener('click', () => {
    if (draw) {
        map.removeInteraction(draw);
    }
});

export { addInteraction };
