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

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';

// styling
import styled from 'styled-components';

const Container = styled.div``;

interface Props {
  projectId: string;
  className?: string;
}

const Map = memo<Props & InjectedLocalized>(
  ({ projectId, className, localize }) => {
    const mapConfig = useMapConfig({ projectId, prefetchMapLayers: true });

    const [map, setMap] = useState<L.Map | null>(null);
    const [layerControl, setLayerControl] = useState<L.Control.Layers | null>(
      null
    );

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
        if (!layerControl) {
          setLayerControl(L.control.layers().addTo(map));
        }

        // first reset
        map.eachLayer((layer) => {
          layerControl?.removeLayer(layer);

          if (layer?.['isCustom']) {
            map.removeLayer(layer);
          }
        });

        // add layers to map and layerControl
        if (!isNilOrError(mapConfig)) {
          mapConfig?.attributes?.layers?.forEach(
            ({ geojson, title_multiloc }) => {
              if (geojson) {
                const layer = L.geoJSON(geojson, {
                  useSimpleStyle: true,
                  useMakiMarkers: true,
                  onEachFeature: (feature, layer) => {
                    layer.isCustom = true;

                    if (
                      feature.properties &&
                      feature.properties.popupContent &&
                      Object.values(feature.properties.popupContent).some(
                        (x) => x && x !== ''
                      )
                    ) {
                      layer.bindPopup(
                        localize(feature.properties.popupContent)
                      );
                    }

                    if (
                      feature.properties &&
                      feature.properties.tooltipContent &&
                      Object.values(feature.properties.tooltipContent).some(
                        (x) => x && x !== ''
                      )
                    ) {
                      layer.bindTooltip(
                        localize(feature.properties.tooltipContent)
                      );
                    }
                  },
                } as any).addTo(map);

                layerControl?.addOverlay(layer, localize(title_multiloc));
              }
            }
          );
        }
      }
    }, [map, layerControl, mapConfig]);

    return <Container id="mapid" className={className || ''} />;
  }
);

export default injectLocalize(Map);
