require('leaflet-simplestyle');

import React, { memo, useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';

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

// hooks
import useMapConfig from 'hooks/useMapConfig';

// styling
import styled from 'styled-components';

const Container = styled.div``;

interface Props {
  projectId: string;
  className?: string;
}

const Map = memo<Props>(({ projectId, className }) => {
  const mapConfig = useMapConfig({ projectId, prefetchMapLayers: true });

  const [map, setMap] = useState<L.Map | null>(null);

  // useEffect(() => {
  //   const map = L.map('mapid').setView([50.869189, 4.725238], 16);

  //   const subscription = layers$.subscribe((layers) => {
  //     setLayers(layers);
  //   });

  //   L.tileLayer(
  //     'https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png',
  //     {
  //       subdomains: ['a', 'b', 'c'],
  //       maxZoom: 20,
  //     }
  //   ).addTo(map);

  //   setMap(map);

  //   return () => subscription.unsubscribe();
  // }, []);

  useEffect(() => {
    const map = L.map('mapid').setView([50.869189, 4.725238], 16);

    L.tileLayer(
      'https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png',
      {
        subdomains: ['a', 'b', 'c'],
        maxZoom: 20,
      }
    ).addTo(map);

    setMap(map);
  }, []);

  useEffect(() => {
    if (map) {
      map.eachLayer((layer) => {
        if (layer?.['identifier'] === 'customlayer') {
          map.removeLayer(layer);
        }
      });

      if (!isNilOrError(mapConfig)) {
        mapConfig?.attributes?.layers?.forEach(({ geojson }) => {
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
    }
  }, [map, mapConfig]);

  return <Container id="mapid" className={className || ''} />;
});

export default Map;
