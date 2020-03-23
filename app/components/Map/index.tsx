import React, { FormEvent } from 'react';
import { adopt } from 'react-adopt';
import { compact, /* get,*/ isNil } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
require('leaflet-simplestyle');

// import { style } from './colors';

// components
import ReactResizeDetector from 'react-resize-detector';
import Icon from 'components/UI/Icon';

// resources
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetMapConfig, { GetMapConfigChildProps } from 'resources/GetMapConfig';

// Map
import Leaflet from 'leaflet';
import 'leaflet.markercluster';

// Styling
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';
import { darken, lighten } from 'polished';
import { colors, media } from 'utils/styleUtils';
import markerIcon from './marker.svg';

// localize
import injectLocalize, { InjectedLocalized } from 'utils/localize';

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
  projectId?: string | null;
}

interface DataProps {
  tenant: GetTenantChildProps;
  mapConfig: GetMapConfigChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  initiated: boolean;
  showLegend: boolean;
  currentLayerTitle: string | null;
}

class CLMap extends React.PureComponent<Props & InjectedLocalized, State> {
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
      currentLayerTitle: null,
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
    const { tenant, mapConfig, center, localize } = this.props;

    function getZoom() {
      if (
        !isNilOrError(mapConfig) &&
        mapConfig.attributes.zoom_level
      ) {
        return parseFloat(mapConfig.attributes.zoom_level);
       } else if (
        !isNilOrError(tenant) &&
        tenant.attributes &&
        tenant.attributes.settings.maps
      ) {
        return tenant.attributes.settings.maps.zoom_level;
      } else {
        return 15;
      }
    }

    function getTileProvider() {
      return 'https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=DIZiuhfkZEQ5EgsaTk6D';

      // if (
      //   !isNilOrError(mapConfig) &&
      //   mapConfig.attributes.tile_provider
      // ) {
      //   return mapConfig.attributes.tile_provider;
      // } else if (
      //   !isNilOrError(tenant) &&
      //   tenant.attributes &&
      //   tenant.attributes.settings.maps
      // ) {
      //   return tenant.attributes.settings.maps.tile_provider;
      // } else {
      //   return 'https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=DIZiuhfkZEQ5EgsaTk6D';
      // }
    }

    function getInitCenter() {
      let initCenter: [number, number] = [0, 0];

      if (
        center && center !== [0, 0]
      ) {
        initCenter = [center[1], center[0]];
      } else if (
        !isNilOrError(mapConfig) &&
        mapConfig.attributes.center_geojson
      ) {
        const [longitude, latitude] = mapConfig.attributes.center_geojson.coordinates;
        initCenter = [latitude, longitude];
      } else if (
        !isNilOrError(tenant) &&
        tenant.attributes &&
        tenant.attributes.settings.maps
      ) {
        initCenter = [
          parseFloat(tenant.attributes.settings.maps.map_center.lat),
          parseFloat(tenant.attributes.settings.maps.map_center.long),
        ];
      }

      return initCenter;
    }

    function getOverlayMaps() {
      const overlayMaps = {};

      if (
        !isNilOrError(mapConfig) &&
        mapConfig.attributes.layers.length > 0
      ) {
        mapConfig.attributes.layers.forEach(layer => {
          const layerTitle = localize(layer.title_multiloc);
          const geoJson = layer.geojson;

          overlayMaps[layerTitle] = Leaflet.geoJSON(geoJson, { useSimpleStyle: true });
        });

        return overlayMaps;
      }

      return undefined;
    }

    if (element && !this.map) {
      const zoom = getZoom();
      const tileProvider = getTileProvider();
      const initCenter = getInitCenter();

      const baseLayer = Leaflet.tileLayer(tileProvider, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: ['a', 'b', 'c']
      });

      // Init the map
      this.map = Leaflet.map(element, {
        zoom,
        center: initCenter,
        maxZoom: 17,
        layers: [baseLayer]
      });

      const overlayMaps = getOverlayMaps();

      Leaflet.control.layers(undefined, overlayMaps).addTo(this.map);

      this.map.on('overlayadd', (event: Leaflet.LayersControlEvent) => {
        this.setState({ showLegend: true, currentLayerTitle: event.name });
      });

      this.map.on('overlayremove', () => {
        this.setState({ showLegend: false, currentLayerTitle: null });
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

    if (
      bounds && bounds.length > 0 &&
      this.props.fitBounds &&
      !this.state.initiated &&
      this.map
    ) {
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
      mapHeight,
      mapConfig,
      localize,
    } = this.props;
    const {
      showLegend,
      currentLayerTitle
    } = this.state;

    if (!isNilOrError(tenant) && !isNilOrError(mapConfig)) {
      const currentLayer = mapConfig.attributes.layers.find(layer => localize(layer.title_multiloc) === currentLayerTitle);
      const legendTitle = localize(currentLayer?.title_multiloc);
      const legend = currentLayer?.legend;

      console.log(mapConfig);
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
          {showLegend && legend &&
            <LegendContainer>
              <Title>
                {legendTitle}
              </Title>
              <Legend>
                {legend.map((legendItem, index) => {
                  const color: string | undefined = legendItem.color;
                  const label = localize(legendItem.title_multiloc);
                  return (
                    <Item key={`legend-item-${index}`}>
                      {color && <ColorLabel color={color} />}
                      {label}
                    </Item>
                  );
                })}
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
  tenant: <GetTenant />,
  mapConfig: ({ projectId, render }) => projectId ? (
    <GetMapConfig projectId={projectId}>{render}</GetMapConfig>
  ) : null,
});

const CLMapWithHOCs = injectLocalize(CLMap);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <CLMapWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);

// TODO: add style func/simple style spec to geojson
// TODO: which legend to show when multiple layers are selected?
// TODO: type error simple style spec
// TODO: don't select layer by default
// TODO: clean up code
// TODO: extract Legend component
// TODO: console error landing page
// TODO: listen to different layers
