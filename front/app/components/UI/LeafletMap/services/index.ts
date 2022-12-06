import { addLayersControl, removeLayersControl } from './controls';
import { addLayers, removeLayers, removeLayer } from './layers';
import {
  addMarkersToMap,
  addMarkerClusterGroup,
  getMarkerIcon,
} from './markers';
import { init, addTileLayer, changeView } from './setup';

export default {
  init,
  addTileLayer,
  changeView,
  addLayersControl,
  removeLayersControl,
  addLayers,
  removeLayers,
  removeLayer,
  addMarkersToMap,
  addMarkerClusterGroup,
  getMarkerIcon,
};
