// Libraries
import * as React from 'react';
import { compact, flow, isEqual } from 'lodash';
import { BehaviorSubject, Subscription } from 'rxjs';

// Injectors
import { injectTenant, InjectedTenant } from 'utils/resourceLoaders/tenantLoader';

// Map
import Leaflet, { Marker } from 'leaflet';
import 'leaflet.markercluster';

// Styling
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';
const icon = require('./marker.svg');

const MapWrapper = styled.div`
  height: 300px;
  transition: width .1s, height .1s;

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
  id: string;
}

interface DataMarkerOptions extends Leaflet.MarkerOptions {
  data?: any;
  id: string;
}

export interface Props {
  center?: GeoJSON.Position;
  points?: Point[];
  areas?: GeoJSON.Polygon[];
  className?: string;
  zoom?: number;
  onMarkerClick?: {(id: string, data: any): void};
  onMapClick?: {({ map, position }: {map: Leaflet.Map, position: Leaflet.LatLng}): void};
}

interface State {
}

class CLMap extends React.PureComponent<Props & InjectedTenant, State> {
  private map: Leaflet.Map;
  private mapContainer: HTMLElement;
  private clusterLayer: Leaflet.MarkerClusterGroup;
  private markerBounds: Leaflet.LatLngBoundsExpression;
  private markers: Leaflet.Marker[];
  private interval: number;
  private subs: Subscription[] = [];
  private dimensionW$: BehaviorSubject<number> = new BehaviorSubject(0);
  private dimensionH$: BehaviorSubject<number> = new BehaviorSubject(0);

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

    this.interval = window.setInterval(this.resizeDetector, 200);
  }

  componentDidCatch(error, info) {
    console.error(error, info);
  }

  componentDidMount() {
    if (this.props.points) {
      this.convertPoints(this.props.points);
    }

    this.subs.push(
      this.dimensionH$.distinctUntilChanged().subscribe(() => this.map.invalidateSize()),
      this.dimensionW$.distinctUntilChanged().subscribe(() => this.map.invalidateSize()),
    );
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.points && !isEqual(prevProps.points, this.props.points)) {
      this.convertPoints(this.props.points);
    }
  }

  componentWillUnmount() {
    window.clearInterval(this.interval);
    this.subs.forEach(sub => sub.unsubscribe());
  }

  bindMapContainer = (element) => {
    if (!this.map) {
      let center: [number, number] = [0, 0];
      if (this.props.center && this.props.center !== [0, 0]) {
        center = this.props.center as [number, number];
      } else if (this.props.tenant && this.props.tenant.attributes.settings.maps) {
        center = [
          parseFloat(this.props.tenant.attributes.settings.maps.map_center.lat),
          parseFloat(this.props.tenant.attributes.settings.maps.map_center.long),
        ];
      }

      let zoom = 10;
      if (this.props.tenant && this.props.tenant.attributes.settings.maps) {
        zoom = this.props.tenant.attributes.settings.maps.zoom_level;
      }

      // Bind the mapElement
      this.mapContainer = element;

      // Init the map
      this.map = Leaflet.map(element, {
        center,
        zoom,
        maxZoom: 17,
      });

      Leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: ['a','b','c']
      }).addTo(this.map);

      if (this.props.onMapClick) this.map.on('click', this.handleMapClick);
    }
  }

  convertPoints = (points: Point[]) => {
    if (points) {
      const bounds: [number, number][] = [];

      this.markers = compact(points).map((point) => {
        bounds.push([point.coordinates[0], point.coordinates[1]]);
        return new Marker(point.coordinates as [number, number], ({ ...this.markerOptions, data: point.data, id: point.id } as DataMarkerOptions));
      });

      if (bounds.length > 0) this.markerBounds = new Leaflet.LatLngBounds(bounds);

      this.addClusters();
    }
  }

  addClusters = () => {
    if (this.map && this.markers) {
      if (this.clusterLayer) this.map.removeLayer(this.clusterLayer);
      this.clusterLayer = Leaflet.markerClusterGroup(this.clusterOptions);
      this.clusterLayer.addLayers(this.markers);
      this.map.addLayer(this.clusterLayer);

      if (this.props.onMarkerClick) this.clusterLayer.on('click', this.handleMarkerClick);

      if (this.markerBounds) this.map.fitBounds(this.markerBounds, { maxZoom: 12 });
    }
  }

  handleMapClick = (event: Leaflet.LeafletMouseEvent) => {
    if (this.props.onMapClick) this.props.onMapClick({ map: this.map, position: event.latlng });
  }

  handleMarkerClick = (event) => {
    if (this.props.onMarkerClick) {
      this.props.onMarkerClick(event.layer.options.id, event.layer.options.data);
    }
  }

  resizeDetector = () => {
    if (this.mapContainer) {
      this.dimensionH$.next(this.mapContainer.clientHeight);
      this.dimensionW$.next(this.mapContainer.clientWidth);
    }
  }

  render() {
    return (
      <MapWrapper className={this.props.className}>
        <div id="map-container" ref={this.bindMapContainer} onScroll={console.log} />
      </MapWrapper>
    );
  }
}

export default flow([
  injectTenant(),
])(CLMap);
