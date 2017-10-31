// Libraries
import * as React from 'react';
import Leaflet from 'leaflet';

// Components
import { Map, Marker, TileLayer } from 'react-leaflet';

// Styling
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';
const icon = require('./marker.svg');

const MapWrapper = styled.div`
  height: 300px;

  .leaflet-container {
    height: 100%;
  }
`;

const customIcon = Leaflet.icon({
  iconUrl: icon,
  iconSize: [29, 41],
  iconAnchor: [14, 41],
});

// Typing
type GeoPoint = [number, number];

interface Props {
  center: GeoPoint;
  points?: GeoPoint[];
  className?: string;
  zoom?: number;
}

export default class CLMap extends React.Component<Props> {
  render() {
    return (
      <MapWrapper className={this.props.className}>
        <Map center={this.props.center} zoom={this.props.zoom || 13}>
          <TileLayer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" />
          {this.props.points && this.props.points.map((point =>
            <Marker position={point} key={`${point[0]}.${point[1]}`} icon={customIcon} />
          ))}
        </Map>
      </MapWrapper>
    );
  }

}
