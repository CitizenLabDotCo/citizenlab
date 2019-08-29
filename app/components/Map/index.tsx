import React, { FormEvent } from 'react';
import { adopt } from 'react-adopt';
import { compact, isEqual, get, isNil } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// components
import ReactResizeDetector from 'react-resize-detector';
import Icon from 'components/UI/Icon';

// resources
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';

// Map
import Leaflet, { Marker } from 'leaflet';
import 'leaflet.markercluster';

// Styling
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';
import { darken, lighten } from 'polished';
import { colors, media } from 'utils/styleUtils';

const icon = require('./marker.svg');

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
`;

const BoxContainer = styled.div`
  flex: 0 0 400px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 30px;
  position: relative;
  background: #fff;

  ${media.smallerThanMaxTablet`
    flex: 0 0 40%;
  `}

  ${media.smallerThanMinTablet`
    flex: 0 0 70%;
  `}
`;

const CloseIcon = styled(Icon)`
  height: 10px;
  fill: ${colors.label};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: fill 100ms ease-out;
`;

const CloseButton = styled.div`
  height: 34px;
  width: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  cursor: pointer;
  top: 12px;
  right: 12px;
  border-radius: 50%;
  border: solid 1px ${lighten(0.4, colors.label)};
  transition: border-color 100ms ease-out;

  &:hover {
    border-color: #000;

    ${CloseIcon} {
      fill: #000;
    }
  }
`;

const MapContainer = styled.div`
  flex: 1;

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

    &:hover {
      background: ${darken(0.2, '#004949')};
    }
  }
`;

const customIcon = Leaflet.icon({
  iconUrl: icon,
  iconSize: [29, 41],
  iconAnchor: [14, 41],
});

export interface Point extends GeoJSON.Point {
  data?: any;
  id: string;
  title?: string;
}

export interface InputProps {
  center?: GeoJSON.Position;
  points?: Point[];
  areas?: GeoJSON.Polygon[];
  zoom?: number;
  boxContent?: JSX.Element | null;
  onBoxClose?: (event: FormEvent) => void;
  onMarkerClick?: (id: string, data: any) => void;
  onMapClick?: (map: Leaflet.Map, position: Leaflet.LatLng) => void;
  fitBounds?: boolean;
  className?: string;
}

interface DataProps {
  tenant: GetTenantChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class CLMap extends React.PureComponent<Props, State> {
  private map: Leaflet.Map;
  private clusterLayer: Leaflet.MarkerClusterGroup;
  private markers: Leaflet.Marker[];
  private markerOptions = { icon: customIcon };
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

  componentDidMount() {
    if (this.props.points) {
      this.convertPoints(this.props.points);
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.points && !isEqual(prevProps.points, this.props.points)) {
      this.convertPoints(this.props.points);
    }
  }

  bindMapContainer = (element: HTMLDivElement | null) => {
    const { tenant, center } = this.props;

    if (element && !isNilOrError(tenant) && !this.map) {
      let initCenter: [number, number] = [0, 0];

      if (center && center !== [0, 0]) {
        initCenter = [center[1], center[0]];
      } else if (tenant.attributes.settings.maps) {
        initCenter = [
          parseFloat(tenant.attributes.settings.maps.map_center.lat),
          parseFloat(tenant.attributes.settings.maps.map_center.long),
        ];
      }

      // Init the map
      this.map = Leaflet.map(element, {
        center: initCenter,
        zoom: get(tenant, 'attributes.settings.maps.zoom_level', 15),
        maxZoom: 17
      });

      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: ['a', 'b', 'c']
      }).addTo(this.map);

      if (this.props.onMapClick) {
        this.map.on('click', this.handleMapClick);
      }
    }
  }

  convertPoints = (points: Point[]) => {
    const bounds: [number, number][] = [];

    this.markers = compact(points).map((point) => {
      const latlng: [number, number] = [
        point.coordinates[1],
        point.coordinates[0]
      ];

      const markerOptions = {
        ...this.markerOptions,
        data: point.data,
        id: point.id,
        title: point.title ? point.title : ''
      };

      bounds.push(latlng);

      return new Marker(latlng, markerOptions);
    });

    if (bounds && bounds.length > 0 && this.props.fitBounds) {
      this.map.fitBounds(bounds, { maxZoom: 12 });
    }

    this.addClusters();
  }

  addClusters = () => {
    if (this.map && this.markers) {
      if (this.clusterLayer) {
        this.map.removeLayer(this.clusterLayer);
      }

      this.clusterLayer = Leaflet.markerClusterGroup(this.clusterOptions);
      this.clusterLayer.addLayers(this.markers);
      this.map.addLayer(this.clusterLayer);

      if (this.props.onMarkerClick) {
        this.clusterLayer.on('click', this.handleMarkerClick);
      }
    }
  }

  handleMapClick = (event: Leaflet.LeafletMouseEvent) => {
    this.props.onMapClick && this.props.onMapClick(this.map, event.latlng);
  }

  handleMarkerClick = (event) => {
    this.props.onMarkerClick && this.props.onMarkerClick(event.layer.options.id, event.layer.options.data);
  }

  onMapElementResize = () => {
    this.map.invalidateSize();
  }

  handleBoxOnClose = (event: FormEvent) => {
    event.preventDefault();
    this.props.onBoxClose && this.props.onBoxClose(event);
  }

  render() {
    const { tenant, boxContent, className } = this.props;

    if (!isNilOrError(tenant)) {
      return (
        <Container className={className}>
          {!isNil(boxContent) &&
            <BoxContainer className={className}>
              <CloseButton onClick={this.handleBoxOnClose}>
                <CloseIcon name="close" />
              </CloseButton>

              {boxContent}
            </BoxContainer>
          }

          <MapContainer id="e2e-map" ref={this.bindMapContainer}>
            <ReactResizeDetector handleWidth handleHeight onResize={this.onMapElementResize} />
          </MapContainer>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  tenant: <GetTenant />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <CLMap {...inputProps} {...dataProps} />}
  </Data>
);
