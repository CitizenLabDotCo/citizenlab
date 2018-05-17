// Libraries
import React from 'react';
import { compact, isEqual } from 'lodash';
import { BehaviorSubject, Subscription } from 'rxjs';
import { isNilOrError } from 'utils/helperUtils';

// resources
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';

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

export interface InputProps {
  center?: GeoJSON.Position;
  points?: Point[];
  areas?: GeoJSON.Polygon[];
  zoom?: number;
  onMarkerClick?: {(id: string, data: any): void};
  onMapClick?: {({ map, position }: {map: Leaflet.Map, position: Leaflet.LatLng}): void};
  fitBounds?: boolean;
}

interface DataProps {
  tenant: GetTenantChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class CLMap extends React.PureComponent<Props, State> {
  private map: Leaflet.Map;
  private mapContainer: HTMLElement;
  private clusterLayer: Leaflet.MarkerClusterGroup;
  private markers: Leaflet.Marker[];
  private interval: number;
  private subs: Subscription[] = [];
  private dimensionW$: BehaviorSubject<number> = new BehaviorSubject(0);
  private dimensionH$: BehaviorSubject<number> = new BehaviorSubject(0);
  private bounds$: BehaviorSubject<Leaflet.LatLngBounds | null> = new BehaviorSubject(null);

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

    // Map container dimensions change
    this.subs.push(
      this.dimensionH$.distinctUntilChanged().subscribe(() => this.map.invalidateSize()),
      this.dimensionW$.distinctUntilChanged().subscribe(() => this.map.invalidateSize()),
    );

    // Refresh bounds
    this.subs.push(
      this.bounds$.distinctUntilChanged().subscribe((bounds) => {
        if (bounds && this.props.fitBounds) this.map.fitBounds(bounds, { maxZoom: 12 });
      })
    );
  }

  componentDidUpdate(prevProps: Props) {
    const { tenant, center, points } = this.props;

    if (points && !isEqual(prevProps.points, points) && !isEqual(prevProps.points, points)) {
      this.convertPoints(points);
    }

    // Update the center if the tenant is loaded after map init and there's no set center
    if (!isNilOrError(tenant) && !prevProps.tenant && !center && this.map && tenant.attributes.settings.maps) {
      this.map.setView(
        [
          parseFloat(tenant.attributes.settings.maps.map_center.lat),
          parseFloat(tenant.attributes.settings.maps.map_center.long),
        ],
        tenant.attributes.settings.maps.zoom_level
      );
    }
  }

  componentWillUnmount() {
    window.clearInterval(this.interval);
    this.subs.forEach(sub => sub.unsubscribe());
  }

  bindMapContainer = (element) => {
    const { tenant, center } = this.props;

    if (!this.map) {
      let initCenter: [number, number] = [0, 0];

      if (center && center !== [0, 0]) {
        initCenter = [center[1], center[0]];
      } else if (!isNilOrError(tenant) && tenant.attributes.settings.maps) {
        initCenter = [
          parseFloat(tenant.attributes.settings.maps.map_center.lat),
          parseFloat(tenant.attributes.settings.maps.map_center.long),
        ];
      }

      let initZoom = 10;

      if (!isNilOrError(tenant) && tenant.attributes.settings.maps) {
        initZoom = tenant.attributes.settings.maps.zoom_level;
      }

      // Bind the mapElement
      this.mapContainer = element;

      // Init the map
      this.map = Leaflet.map(element, {
        center: initCenter,
        zoom: initZoom,
        maxZoom: 17
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
        bounds.push([point.coordinates[1], point.coordinates[0]]);
        return new Marker([point.coordinates[1], point.coordinates[0]] as [number, number], ({ ...this.markerOptions, data: point.data, id: point.id } as DataMarkerOptions));
      });

      if (bounds.length > 0) this.bounds$.next(new Leaflet.LatLngBounds(bounds));

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
      <MapWrapper className={this.props['className']}>
        <div id="map-container" ref={this.bindMapContainer} />
      </MapWrapper>
    );
  }
}

export default (inputProps: InputProps) => (
  <GetTenant>
    {tenant => <CLMap {...inputProps} tenant={tenant} />}
  </GetTenant>
);
