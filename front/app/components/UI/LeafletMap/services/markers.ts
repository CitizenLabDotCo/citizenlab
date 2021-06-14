import L from 'leaflet';
import { compact } from 'lodash-es';
import {
  DEFAULT_MARKER_ICON_SIZE,
  DEFAULT_MARKER_ANCHOR_SIZE,
  DEFAULT_MARKER_ICON,
} from '../config';
import {
  setLeafletMapHoveredMarker,
  setLeafletMapSelectedMarker,
} from '../events';

import { Point, MarkerIconProps } from '../typings';

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
  map: L.Map | null | undefined,
  latlng: [number, number],
  options = {},
  noMarkerClustering?: boolean
) {
  const markerIcon = getMarkerIcon({ url: DEFAULT_MARKER_ICON });

  const marker = L.marker(latlng, {
    ...options,
    keyboard: true,
    icon: markerIcon,
  });

  marker.on('mouseover', (event: L.LeafletEvent) => {
    setLeafletMapHoveredMarker(event.target.options['id']);
  });

  marker.on('mouseout', (_event: L.LeafletEvent) => {
    setLeafletMapHoveredMarker(null);
  });

  // only add marker directly to the map when clustering is turned off
  // otherwise let this be handled by addMarkerClusterGroup()
  if (map && noMarkerClustering) {
    marker.on('keypress', (event: L.LeafletKeyboardEvent) => {
      if (
        event.originalEvent?.code === 'Enter' ||
        event.originalEvent?.code === 'Space'
      ) {
        setLeafletMapSelectedMarker(event.target.options['id']);
      }
    });

    marker.on('click', (event: L.LeafletMouseEvent) => {
      setLeafletMapSelectedMarker(event.target.options['id']);
    });

    marker.addTo(map);
  }

  return marker;
}

export function addMarkersToMap(
  map: L.Map | null | undefined,
  points: Point[] = [],
  noMarkerClustering?: boolean
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

    return addMarkerToMap(map, latlng, markerOptions, noMarkerClustering);
  });

  return markers;
}

export function addMarkerClusterGroup(
  map: L.Map | null | undefined,
  markers: L.Marker[] | null,
  { onClick }: { onClick: (id: string, data: any) => void }
) {
  if (map && markers) {
    const markerClusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyDistanceMultiplier: 2,
      iconCreateFunction: (cluster) => {
        return L.divIcon({
          html: `<span>${cluster.getChildCount()}</span>`,
          className: 'marker-cluster-custom',
          iconSize: L.point(38, 38, true),
        });
      },
    });
    markerClusterGroup.addLayers(markers);
    map.addLayer(markerClusterGroup);

    markerClusterGroup.on('keypress', (event: L.LeafletKeyboardEvent) => {
      if (
        event.originalEvent?.code === 'Enter' ||
        event.originalEvent?.code === 'Space'
      ) {
        onClick?.(event.layer.options.id, event.layer.options.data);
      }
    });

    markerClusterGroup.on('click', (event: L.LeafletMouseEvent) => {
      onClick?.(event.layer.options.id, event.layer.options.data);
    });

    return markerClusterGroup;
  }

  return null;
}
