import L from 'leaflet';
import { compact } from 'lodash-es';
import {
  isFunction,
  isString,
  isOrReturnsString,
  isObject,
} from 'utils/helperUtils';

import {
  DEFAULT_MARKER_ICON_SIZE,
  DEFAULT_MARKER_ANCHOR_SIZE,
  DEFAULT_MARKER_ICON,
  // DEFAULT_MARKER_HOVER_ICON,
  // DEFAULT_MARKER_ACTIVE_ICON,
} from '../config';

import {
  Point,
  IMarkerStringOrObjectOrFunctionForMap,
  MarkerIconProps,
} from '../typings';

export function getMarkerIcon({ url, iconSize, iconAnchor }: MarkerIconProps) {
  const size = iconSize || DEFAULT_MARKER_ICON_SIZE;
  const anchor = iconAnchor || DEFAULT_MARKER_ANCHOR_SIZE;

  return L.icon({
    iconUrl: url,
    iconSize: L.point(size[0], size[1]),
    iconAnchor: L.point(anchor[0], anchor[1]),
  });
}

export function addMarkerToMap(
  map: L.Map,
  latlng: [number, number],
  markerStringOrOptionsOrFunction?: IMarkerStringOrObjectOrFunctionForMap,
  options = {}
) {
  let markerIcon = getMarkerIcon({ url: DEFAULT_MARKER_ICON });
  // let markerHoverIcon = getMarkerIcon({ url: DEFAULT_MARKER_HOVER_ICON });
  // let markerActiveIcon = getMarkerIcon({ url: DEFAULT_MARKER_ACTIVE_ICON });

  if (isString(markerStringOrOptionsOrFunction)) {
    markerIcon = getMarkerIcon({ url: markerStringOrOptionsOrFunction });
  } else if (isOrReturnsString(markerStringOrOptionsOrFunction, latlng)) {
    markerIcon = getMarkerIcon({
      url: markerStringOrOptionsOrFunction(latlng),
    });
  } else if (isFunction(markerStringOrOptionsOrFunction)) {
    markerIcon = getMarkerIcon(markerStringOrOptionsOrFunction(latlng));
  } else if (isObject(markerStringOrOptionsOrFunction)) {
    markerIcon = getMarkerIcon(markerStringOrOptionsOrFunction);
  }

  const marker = L.marker(latlng, {
    ...options,
    icon: markerIcon,
  });

  marker.addTo(map);

  return marker;
}

export function addMarkersToMap(
  map: L.Map,
  points: Point[] = [],
  markerStringOrOptionsOrFunction?: IMarkerStringOrObjectOrFunctionForMap
) {
  const bounds: [number, number][] = [];

  const markers = compact(points).map((point) => {
    const latlng: [number, number] = [
      point.coordinates[1],
      point.coordinates[0],
    ];

    const markerOptions = {
      data: point.data,
      id: point.id,
      title: point.title ? point.title : '',
    };

    bounds.push(latlng);

    return addMarkerToMap(
      map,
      latlng,
      markerStringOrOptionsOrFunction,
      markerOptions
    );
  });

  return markers;
}

export function addClusterGroup(
  map: L.Map,
  markers: L.Marker[],
  { onClick }: { onClick: (id: string, data: any) => void }
) {
  const newMarkerClusterGroup = L.markerClusterGroup({
    showCoverageOnHover: false,
    spiderfyDistanceMultiplier: 2,
    iconCreateFunction: (cluster) => {
      return L.divIcon({
        html: `<span>${cluster.getChildCount()}</span>`,
        className: 'marker-cluster-custom',
        iconSize: L.point(40, 40, true),
      });
    },
  });
  newMarkerClusterGroup.addLayers(markers);
  map.addLayer(newMarkerClusterGroup);

  if (onClick) {
    newMarkerClusterGroup.on('click', (event) => {
      onClick(event.layer.options.id, event.layer.options.data);
    });
  }

  return newMarkerClusterGroup;
}
