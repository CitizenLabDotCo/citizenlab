// Libraries
import * as React from 'react';
import Leaflet from 'leaflet';
import { compact } from 'lodash';

// Components
import { Map, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';

// Styling
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-markercluster/dist/styles.min.css';
import styled from 'styled-components';
const icon = require('./marker.svg');

const MapWrapper = styled.div`
  height: 300px;

  .leaflet-container {
    height: 100%;
  }

  .marker-cluster-custom {
    background: #004949;
    border: 3px solid white;
    border-radius: 50%;
    color: white;
    height: 40px;
    line-height: 37px;
    text-align: center;
    width: 40px;
  }
`;

const customIcon = Leaflet.icon({
  iconUrl: icon,
  iconSize: [29, 41],
  iconAnchor: [14, 41],
});

// Typing
interface Point extends GeoJSON.Point {
  data?: any;
}

interface Props {
  center?: GeoJSON.Position;
  points?: Point[];
  areas?: GeoJSON.Polygon[];
  className?: string;
  zoom?: number;
  onMarkerClick?: {(id: string): void};
}

export default class CLMap extends React.Component<Props> {
  private markerBounds: Leaflet.LatLngBounds;

  private markers: {
    position: GeoJSON.Position;
    options?: any;
  }[] = [];

  private clusterOptions = {
    showCoverageOnHover: false,
    spiderfyDistanceMultiplier: 2,
    iconCreateFunction: (cluster) => {
      return Leaflet.divIcon({
        html: `<span>${cluster.getChildCount()}</span>`,
        className: 'marker-cluster-custom',
        iconSize: Leaflet.point(40, 40, true),
      });
    },
  };

  private markerOptions = {
    icon: customIcon,
  };

  constructor(props) {
    super(props);

    this.convertPoints(props.points);
  }

  componentDidCatch(error, info) {
    console.error(error, info);
  }

  componentWillReceiveProps(props) {
    this.convertPoints(props.points);
  }

  convertPoints = (points: Point[]) => {
    if (points) {
      const bounds: GeoJSON.Position[] = [];
      this.markers = compact(points).map((point) => {
        bounds.push(point.coordinates);
        return {
          position: point.coordinates,
          options: {
            ...this.markerOptions,
            data: point.data
          }
        };
      });

      this.markerBounds = new Leaflet.LatLngBounds(bounds);
    }
  }

  handleMarkerClick = (marker) => {
    if (this.props.onMarkerClick) this.props.onMarkerClick(marker.options.data);
  }

  render() {
    return (
      <MapWrapper className={this.props.className}>
        <Map center={this.props.center} bounds={this.markerBounds} zoom={this.props.zoom || 13} maxZoom={15}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {this.markers.length > 0 &&
            <MarkerClusterGroup options={this.clusterOptions} markers={this.markers} onMarkerClick={this.handleMarkerClick} />
          }
        </Map>
      </MapWrapper>
    );
  }

}
