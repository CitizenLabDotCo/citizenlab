import React, { FormEvent } from 'react';
import { adopt } from 'react-adopt';
import { compact, get, isNil } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
const seattleJson = require('./Seattle.json');
import { style } from './colors';

// components
import ReactResizeDetector from 'react-resize-detector';
import Icon from 'components/UI/Icon';

// resources
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';

// Map
import Leaflet from 'leaflet';
import 'leaflet.markercluster';

// Styling
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';
import { darken, lighten } from 'polished';
import { colors, media } from 'utils/styleUtils';
import markerIcon from './marker.svg';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
  flex-direction: column;
`;

const MapContainer = styled.div``;

const BoxContainer = styled.div`
  flex: 0 0 400px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
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
  top: 9px;
  right: 13px;
  border-radius: 50%;
  border: solid 1px ${lighten(0.4, colors.label)};
  transition: border-color 100ms ease-out;
  z-index: 2;

  &:hover {
    border-color: #000;

    ${CloseIcon} {
      fill: #000;
    }
  }

  ${media.smallerThanMinTablet`
    height: 32px;
    width: 32px;
    top: 8px;
    right: 8px;
  `}
`;

const LegendContainer = styled.div`
  background-color: white;
  padding: 30px;
`;

const Title = styled.h4`
  margin-bottom 15px;
`;

const Legend = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
`;

const Item = styled.li`
  display: flex;
  flex: 1 0 calc(50% - 10px);
  margin-right: 10px;

  &:not(:last-child) {
    margin-bottom: 10px;
  }
`;

const ColorLabel = styled.div`
  width: 20px;
  height: 20px;
  background-color: ${props => props.color};
  margin-right: 10px;
`;

const LeafletMapContainer = styled.div<{mapHeight: number}>`
  flex: 1;
  height: ${props => props.mapHeight}px;

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

  .info {
    padding: 10px 12px;
    font: 14px/16px Arial, Helvetica, sans-serif;
    background: rgba(255,255,255,0.95);
    box-shadow: 0 0 15px rgba(0,0,0,0.2);
    border-radius: 5px;
  }

  .info h4 {
    margin: 0 0 15px;
    color: #777;
  }

  .label-values {
    display: flex;
    flex-direction: column;
  }

  .label-value-wrapper {
    display: flex;
    margin-bottom: 10px;
  }

  .legend {
    line-height: 18px;
    color: #555;
  }

  .legend i {
    width: 18px;
    height: 18px;
    float: left;
    margin-right: 8px;
    opacity: 0.7;
  }
`;

const customIcon = Leaflet.icon({
  iconUrl: markerIcon,
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
  mapHeight: number;
}

interface DataProps {
  tenant: GetTenantChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  initiated: boolean;
  showLegend: boolean;
}

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

  constructor(props) {
    super(props);
    this.state = {
      initiated: false,
      showLegend: false,
    };
  }

  componentDidMount() {
    if (this.props.points && this.props.points.length > 0) {
      this.convertPoints(this.props.points);
    }
  }

  componentDidUpdate(_prevProps) {
    if (this.props.points && this.props.points.length > 0) {
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

      const baseLayer = Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: ['a', 'b', 'c']
      });

      const geoJsonLayer = Leaflet.geoJSON(seattleJson, { style });

      // Init the map
      this.map = Leaflet.map(element, {
        center: initCenter,
        zoom: get(tenant, 'attributes.settings.maps.zoom_level', 15),
        maxZoom: 17,
        layers: [baseLayer, geoJsonLayer]
      });

      const overlayMaps = {
        Disadvantage: geoJsonLayer
      };

      Leaflet.control.layers(undefined, overlayMaps).addTo(this.map);

      const legend = new Leaflet.Control({ position: 'bottomright' });

      legend.onAdd = function (_map) {
        const div = Leaflet.DomUtil.create('div', 'legend info');
        const legendValues = [
          {
            label: 'Lowest Disadvantage',
            color: '#92ABB9'
          },
          {
            label: 'Second Lowest Disadvantage',
            color: '#ADD0CA'
          },
          {
            label: 'Middle Disadvantage',
            color: '#F9F9CD'
          },
          {
            label: 'Second Highest Disadvantage',
            color: '#CEA991'
          },
          {
            label: 'Highest Disadvantage',
            color: '#B495A4'
          },
        ];
        div.innerHTML += `
          <h4>Racial and Social Equity Composite Index</h4>
          <div class='label-values'>
            ${legendValues.map(value => `<div class='label-value-wrapper'>
              <i style="background: ${value.color}"></i><span>${value.label}</span>
            </div>`).join('')}
          </div>
        `;

        return div;
      };

      legend.addTo(this.map);

      this.map.on('overlayadd', () => {
        legend.addTo(this.map);
        this.setState({ showLegend: true });
      });

      this.map.on('overlayremove', () => {
        legend.remove();
        this.setState({ showLegend: false });
      });

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

      return Leaflet.marker(latlng, markerOptions);
    });

    if (bounds && bounds.length > 0 && this.props.fitBounds && !this.state.initiated) {
      this.map.fitBounds(bounds, { maxZoom: 12, padding: [50, 50] });
      this.setState({ initiated: true });
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
    const {
      tenant,
      boxContent,
      className,
      mapHeight
    } = this.props;
    const { showLegend } = this.state;

    const legendValues = [
      {
        label: 'Lowest Disadvantage',
        color: '#92ABB9'
      },
      {
        label: 'Second Lowest Disadvantage',
        color: '#ADD0CA'
      },
      {
        label: 'Middle Disadvantage',
        color: '#F9F9CD'
      },
      {
        label: 'Second Highest Disadvantage',
        color: '#CEA991'
      },
      {
        label: 'Highest Disadvantage',
        color: '#B495A4'
      },
    ];

    if (!isNilOrError(tenant)) {
      return (
        <Container className={className}>
          <MapContainer>
            {!isNil(boxContent) &&
              <BoxContainer className={className}>
                <CloseButton onClick={this.handleBoxOnClose}>
                  <CloseIcon name="close" />
                </CloseButton>

                {boxContent}
              </BoxContainer>
            }

            <LeafletMapContainer
              id="e2e-map"
              ref={this.bindMapContainer}
              mapHeight={mapHeight}
            >
              <ReactResizeDetector handleWidth handleHeight onResize={this.onMapElementResize} />
            </LeafletMapContainer>
          </MapContainer>
          {showLegend &&
            <LegendContainer>
              <Title>
                {'Racial and Social Equity Composite Index'}
              </Title>
              <Legend>
                {legendValues.map((value, index) => (
                  <Item key={`legend-item-${index}`}>
                    <ColorLabel color={value.color} />
                    {value.label}
                  </Item>)
                )}
              </Legend>
            </LegendContainer>
          }
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

// TODO: Legend two items per line
// TODO: Extract Legend
// TODO: clean up code
