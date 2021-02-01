import React from 'react';
require('leaflet-simplestyle');

// Map
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';

// Styling
import styled from 'styled-components';

const Container = styled.div``;

const MapContainer = styled.div`
  width: 100%;
  height: 800px;
`;

interface Props {}

interface State {}

export default class MapPoC extends React.PureComponent<Props, State> {
  componentDidMount() {
    this.initMap();
  }

  initMap = () => {
    const layer1 = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            'marker-size': 'large',
            'marker-color': '#920a21',
            'marker-symbol': 'bicycle',
            popupContent: 'This is the popup content',
          },
          geometry: {
            type: 'Point',
            coordinates: [4.722232818603516, 50.86852710405001],
          },
        },
        {
          type: 'Feature',
          properties: {
            stroke: '#4aae13',
            'stroke-width': 4,
            'stroke-opacity': 1,
            tooltipContent: 'This is the tooltip content',
          },
          geometry: {
            type: 'LineString',
            coordinates: [
              [4.720205068588256, 50.87233901548584],
              [4.720548391342163, 50.87094428476555],
              [4.72334861755371, 50.869867740768385],
              [4.724947214126587, 50.86934638662619],
              [4.725902080535889, 50.86884533948826],
              [4.7265565395355225, 50.868648981708596],
            ],
          },
        },
        {
          type: 'Feature',
          properties: {
            stroke: '#d50101',
            'stroke-width': 4,
            'stroke-opacity': 1,
            fill: '#8100bd',
            'fill-opacity': 0.3,
            tooltipContent: 'This is the tooltip content',
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [4.728959798812865, 50.870009927249704],
                [4.731341600418091, 50.870009927249704],
                [4.731341600418091, 50.8712692742938],
                [4.728959798812865, 50.8712692742938],
                [4.728959798812865, 50.870009927249704],
              ],
            ],
          },
        },
        {
          type: 'Feature',
          properties: {
            stroke: '#01a0d5',
            'stroke-width': 4,
            'stroke-opacity': 1,
            fill: '#0042bd',
            'fill-opacity': 0.3,
            tooltipContent: 'This is the tooltip content',
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [4.7253334522247314, 50.867179657589254],
                [4.726046919822693, 50.86613011200652],
                [4.7263312339782715, 50.86608948396055],
                [4.727447032928467, 50.86643143557579],
                [4.727479219436645, 50.86652284795896],
                [4.727157354354858, 50.86696975036304],
                [4.726910591125488, 50.867071318493764],
                [4.726443886756897, 50.86717288640319],
                [4.725521206855774, 50.86737602155815],
                [4.725317358970642, 50.8673286234345],
                [4.7253334522247314, 50.867179657589254],
              ],
            ],
          },
        },
      ],
    };

    const layer2 = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [4.728691577911376, 50.868161469162345],
          },
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [4.7271788120269775, 50.87069377045765],
          },
        },
      ],
    } as any;

    const layer2Properties = {
      name: 'bicycle marker',
      'marker-size': 'large',
      'marker-color': '#3183aa',
      'marker-symbol': 'bus',
      popupContent: 'This is the popup content',
    };

    layer2.features.map((_item, index) => {
      layer2.features[index].properties = layer2Properties;
    });

    const mergedLayers = {
      type: 'FeatureCollection',
      features: [...layer1.features, ...layer2.features],
    } as any;

    const map = L.map('mapid').setView([50.869189, 4.725238], 16);

    L.tileLayer(
      'https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png',
      {
        subdomains: ['a', 'b', 'c'],
        maxZoom: 20,
      }
    ).addTo(map);

    L.geoJSON(mergedLayers, {
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
    } as any).addTo(map);
  };

  render() {
    return (
      <Container>
        <MapContainer id="mapid"></MapContainer>
      </Container>
    );
  }
}
