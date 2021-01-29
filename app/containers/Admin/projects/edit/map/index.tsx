require('leaflet-simplestyle');

import React, { memo, useState, useCallback, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

// Map
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';
import marker from 'leaflet/dist/images/marker-icon.png';
import marker2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import * as gjv from 'geojson-validation';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker,
  shadowUrl: markerShadow,
});

// i18n
// import messages from './messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// styling
import styled from 'styled-components';

const Container = styled.div``;

const MapContainer = styled.div`
  width: 500px;
  height: 500px;
`;

const Layers = styled.div`
  display: flex;
  flex-direction: column;
`;

const Layer = styled.div`
  display: flex;
`;

interface Props {
  className?: string;
}

const Map = memo<Props & WithRouterProps & InjectedIntlProps>(
  ({ className }) => {
    // const projectId = params.projectId;

    const [map, setMap] = useState<L.Map | null>(null);
    const [layer, setLayer] = useState<L.GeoJSON | null>(null);
    const [geoJsonFeatureCollections, setGeoJsonFeatureCollections] = useState<
      GeoJSON.FeatureCollection[]
    >([]);

    useEffect(() => {
      if (!map) {
        const map = L.map('mapid').setView([50.869189, 4.725238], 16);

        L.tileLayer(
          'https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png',
          {
            subdomains: ['a', 'b', 'c'],
            maxZoom: 20,
          }
        ).addTo(map);

        setLayer(
          L.geoJSON(undefined, {
            useSimpleStyle: true,
            useMakiMarkers: true,
            onEachFeature: (feature, layer) => {
              if (feature.properties && feature.properties.popupContent) {
                layer.bindPopup(feature.properties.popupContent);
              }

              if (feature.properties && feature.properties.tooltipContent) {
                layer.bindTooltip(feature.properties.tooltipContent);
              }
            },
          } as any).addTo(map)
        );

        setMap(map);
      }

      // if (map && layers) {
      //   layers.clearLayers();
      //   layers.addData(geoJson);
      // }
    }, [map, layer]);

    useEffect(() => {
      console.log(geoJsonFeatureCollections);
    }, [geoJsonFeatureCollections]);

    const handleChange = (event: any) => {
      const fileReader = new FileReader();
      fileReader.readAsText(event.target.files[0], 'UTF-8');
      fileReader.onload = (event: any) => {
        const newGeoJsonFeatureCollection = JSON.parse(event.target.result);
        console.log(gjv.valid(newGeoJsonFeatureCollection));
        layer?.addData(newGeoJsonFeatureCollection);
        setGeoJsonFeatureCollections((geoJsonFeatureCollections) => [
          ...geoJsonFeatureCollections,
          newGeoJsonFeatureCollection,
        ]);
      };
    };

    const removeLayer = (index: number) => (event: React.FormEvent) => {
      event?.preventDefault();
      // layer?.removeLayer(geoJsonFeatureCollections[index])
      setGeoJsonFeatureCollections((geoJsonFeatureCollections) =>
        geoJsonFeatureCollections.filter((_item, i) => i !== index)
      );
    };

    return (
      <Container className={className || ''}>
        <input type="file" onChange={handleChange} />
        <MapContainer id="mapid"></MapContainer>
        <Layers>
          {geoJsonFeatureCollections.map((_geoJsonFeatureCollection, index) => (
            <Layer key={index}>
              <div>geoJsonFeatureCollections {index + 1}</div>
              <button onClick={removeLayer(index)}>Remove</button>
            </Layer>
          ))}
        </Layers>
      </Container>
    );
  }
);

export default withRouter(injectIntl(Map));
