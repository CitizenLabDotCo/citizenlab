require('leaflet-simplestyle');

import React, { memo, useState, useEffect } from 'react';

// Map
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';
import marker from 'leaflet/dist/images/marker-icon.png';
import marker2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype['_getIconUrl'];

L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker,
  shadowUrl: markerShadow,
});

// events
import { layers$ } from './events';

// styling
import styled from 'styled-components';

// typings
import { IMapLayerAttributes } from 'services/mapLayers';

const Container = styled.div``;

interface Props {
  className?: string;
}

const Map = memo<Props>(({ className }) => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [layers, setLayers] = useState<IMapLayerAttributes[]>();

  useEffect(() => {
    const map = L.map('mapid').setView([50.869189, 4.725238], 16);

    const subscription = layers$.subscribe((layers) => {
      setLayers(layers);
    });

    L.tileLayer(
      'https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png',
      {
        subdomains: ['a', 'b', 'c'],
        maxZoom: 20,
      }
    ).addTo(map);

    setMap(map);

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (map) {
      // reset
      map.eachLayer((layer) => {
        if (layer?.['identifier'] === 'customlayer') {
          map.removeLayer(layer);
        }
      });

      // set geojson
      layers?.forEach(({ geojson }) => {
        if (geojson) {
          L.geoJSON(geojson, {
            useSimpleStyle: true,
            useMakiMarkers: true,
            onEachFeature: (feature, layer) => {
              layer.identifier = 'customlayer';

              if (feature.properties && feature.properties.popupContent) {
                layer.bindPopup(feature.properties.popupContent);
              }

              if (feature.properties && feature.properties.tooltipContent) {
                layer.bindTooltip(feature.properties.tooltipContent);
              }
            },
          } as any).addTo(map);
        }
      });
    }
  }, [map, layers]);

  return <Container id="mapid" className={className || ''} />;
});

export default Map;
