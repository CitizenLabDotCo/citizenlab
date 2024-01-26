import React, {
  memo,
  useMemo,
  useState,
  lazy,
  Suspense,
  useCallback,
  useEffect,
} from 'react';
import { isNilOrError } from 'utils/helperUtils';
require('esri-leaflet-renderers'); // Uncomment to show Esri styling

// components
import {
  Icon,
  Box,
  Select,
  defaultCardStyle,
  defaultOutline,
  media,
} from '@citizenlab/cl2-component-library';
import Outlet from 'components/Outlet';
const LeafletMap = lazy(() => import('components/UI/LeafletMap'));

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useFeatureFlag from 'hooks/useFeatureFlag';

// utils
import {
  getCenter,
  getZoomLevel,
  getTileProvider,
  getTileOptions,
} from 'utils/map';
import { ILeafletMapConfig } from 'components/UI/LeafletMap/useLeaflet';

// styling
import styled from 'styled-components';

// typings
import L, { LatLngTuple, Map as ILeafletMap } from 'leaflet';
import { vectorBasemapLayer } from 'esri-leaflet-vector';
import Legend from '@arcgis/core/widgets/Legend.js';
import LayerList from '@arcgis/core/widgets/LayerList.js';
import MapView from '@arcgis/core/views/MapView.js';
import EsriMap from '@arcgis/core/Map.js';
import Expand from '@arcgis/core/widgets/Expand.js';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer.js';
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer.js';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol.js';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol.js';
import WebMap from '@arcgis/core/WebMap.js';
import WebTileLayer from '@arcgis/core/layers/WebTileLayer.js';
import WMTSLayer from '@arcgis/core/layers/WMTSLayer.js';
import Basemap from '@arcgis/core/Basemap.js';
import EsriPoint from '@arcgis/core/geometry/Point.js';
import jsonUtils, * as symbolJsonUtils from '@arcgis/core/symbols/support/jsonUtils.js';
import symbolUtils, {
  renderPreviewHTML,
} from '@arcgis/core/symbols/support/symbolUtils.js';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer.js';
import html2canvas from 'html2canvas';

export interface Point extends GeoJSON.Point {
  data?: any;
  id: string;
  title?: string;
}

const Container = styled.div`
  ${defaultCardStyle};
  background: transparent;
  border: solid 1px #ccc;
`;

const MapWrapper = styled.div`
  flex: 1;
  display: flex;
  position: relative;
`;

const BoxContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: absolute;
  top: 0;
  z-index: 1001;
  background: #fff;
  width: 100%;
  height: 80%;
  max-height: 550px;
`;

const CloseButton = styled.button`
  width: 28px;
  height: 28px;
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  border-radius: 50%;
  border: solid 1px transparent;
  background: #fff;
  transition: all 100ms ease-out;
  outline: none !important;

  &:hover {
    background: #ececec;
  }

  &.focus-visible {
    ${defaultOutline};
  }

  ${media.phone`
    top: 4px;
    right: 4px;
  `}
`;

const CloseIcon = styled(Icon)`
  fill: #000;
`;

export interface IMapConfigProps {
  initialSelectedPointId?: string;
  centerLatLng?: LatLngTuple;
  points?: Point[];
  zoomLevel?: number;
  areas?: GeoJSON.Polygon[];
  mapHeight?: string;
  noMarkerClustering?: boolean;
  zoomControlPosition?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  layersControlPosition?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  singleClickEnabled?: boolean;
}

export interface IMapProps {
  onInit?: (map: ILeafletMap) => void;
  onBoxClose?: (event: React.FormEvent) => void;
  className?: string;
  projectId?: string | null;
  hideLegend?: boolean;
  boxContent?: JSX.Element | null;
}

const Map = memo<IMapProps & IMapConfigProps>(
  ({
    initialSelectedPointId,
    projectId,
    centerLatLng,
    zoomLevel,
    mapHeight,
    points,
    noMarkerClustering,
    zoomControlPosition,
    layersControlPosition,
    boxContent,
    onInit,
    onBoxClose,
    className,
    hideLegend,
    singleClickEnabled,
  }) => {
    const esri = require('esri-leaflet');
    const { data: appConfig, isLoading } = useAppConfiguration();
    const customMapsEnabled = useFeatureFlag({ name: 'custom_maps' });
    const [map, setMap] = useState<ILeafletMap | null>(null);
    const [selectedBasemap, setSelectedBasemap] =
      useState<string>('ArcGIS:Newspaper');
    const [currentBasemapLayer, setCurrentBasemapLayer] = useState<any | null>(
      null
    );
    const [legendImage, setLegendImage] = useState<string | null>(null);

    const [symbolPreview, setSymbolPreview] = useState<HTMLElement | null>(
      null
    );

    const [additionalLeafletConfig, setAdditionalLeafletConfig] =
      useState<ILeafletMapConfig | null>(null);

    const center = useMemo(() => {
      if (isLoading) return;

      return getCenter(centerLatLng, appConfig?.data);
    }, [isLoading, centerLatLng, appConfig]);

    const zoom = useMemo(() => {
      if (isLoading) return;

      return getZoomLevel(zoomLevel, appConfig?.data);
    }, [isLoading, zoomLevel, appConfig]);

    const tileProvider = useMemo(() => {
      if (isLoading) return;

      return getTileProvider(appConfig?.data);
    }, [isLoading, appConfig]);

    const tileOptions = useMemo(() => {
      return getTileOptions();
    }, []);

    const leafletConfig = useMemo(() => {
      if (!center || !zoom || !tileProvider) return;

      return {
        initialSelectedPointId,
        points,
        noMarkerClustering,
        zoom,
        center,
        tileProvider,
        tileOptions,
        zoomControlPosition,
        layersControlPosition,
        singleClickEnabled,
        ...additionalLeafletConfig,
      };
    }, [
      initialSelectedPointId,
      points,
      noMarkerClustering,
      zoom,
      center,
      tileProvider,
      tileOptions,
      zoomControlPosition,
      layersControlPosition,
      singleClickEnabled,
      additionalLeafletConfig,
    ]);

    const handleLeafletConfigChange = useCallback(
      (leafletConfig: ILeafletMapConfig) => {
        setAdditionalLeafletConfig(leafletConfig);
      },
      []
    );

    const handleBoxOnClose = (event: React.FormEvent) => {
      event.preventDefault();
      onBoxClose?.(event);
    };

    const handleOnInit = (map: L.Map) => {
      setMap(map);

      const apiKey =
        'AAPK14d9ce6201374c03b1cf299a89233d1dmUlplQEZ0n3VGjtMKyjPB4hxo38eEXXaNz5ENsj_Nn1LMuVklAiuGvbBBWf1edlo';

      const basemapEnum = 'ArcGIS:Newspaper';
      const testBasemap = vectorBasemapLayer(basemapEnum, {
        apiKey,
      });
      map.addLayer(testBasemap);
      setCurrentBasemapLayer(testBasemap);

      onInit?.(map);

      /*
       * Testing Esri Map
       */
      const esriMap = new EsriMap();

      // const view = new MapView({
      //   container: 'esriMap', // Reference to the DOM node that will contain the view
      //   map: esriMap,
      //   zoom: 2,
      // });

      // create from a third party source
      const basemap = new Basemap({
        baseLayers: [
          new WebTileLayer({
            urlTemplate:
              'https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=R0U21P01bsRLx7I7ZRqp',
          }),
        ],
      });

      // esriMap.basemap = basemap;

      // const wmtsLayer = new WMTSLayer({
      //   url: 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best', // url to the service
      // })

      const webmap = new WebMap({
        portalItem: {
          // autocasts as new PortalItem()
          id: '967e2a76237946a48cef2ab3d18b8b2e',
        },
      });

      const view = new MapView({
        map: webmap, // The WebMap instance created above
        container: 'esriMap',
        zoom: 2,
      });

      const trailheads = new FeatureLayer({
        url: 'https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads_Styled/FeatureServer/0',
      });
      const trails = new FeatureLayer({
        url: 'https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails_Styled/FeatureServer/0',
      });

      const layer = new FeatureLayer({
        // URL to the service
        url: 'https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Parks_and_Open_Space_Styled/FeatureServer/0',
      });

      // esriMap.add(layer);
      // esriMap.add(trails);
      // esriMap.add(trailheads);

      // GeoJSON Layer test:
      // create a geojson layer from geojson feature collection
      const geojson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            id: 1,
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [100.0, 0.0],
                  [101.0, 0.0],
                  [101.0, 1.0],
                  [100.0, 1.0],
                  [100.0, 0.0],
                ],
              ],
            },
            properties: {
              type: 'single',
              recordedDate: '2018-02-07T22:45:00-08:00',
            },
          },
        ],
      };

      const geojsonPoint = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [100, 0],
        },
        properties: {
          name: 'Dinagat Islands',
          'marker-symbol': 'bicycle',
        },
      };

      // create a new blob from geojson featurecollection
      const blob = new Blob([JSON.stringify(geojson)], {
        type: 'application/json',
      });
      const blobPoint = new Blob([JSON.stringify(geojsonPoint)], {
        type: 'application/json',
      });

      // URL reference to the blob
      const url = URL.createObjectURL(blob);
      const urlPoint = URL.createObjectURL(blobPoint);

      // create new geojson layer using the blob url
      const geoJsonLayer = new GeoJSONLayer({
        url,
      });

      const picRenderer = {
        type: 'simple', // autocasts as new SimpleRenderer()
        symbol: {
          type: 'picture-marker',
          url: 'https://static.arcgis.com/images/Symbols/Shapes/BlackStarLargeB.png',
        },
      } as RendererProperties;

      const geoJsonLayerPoint = new GeoJSONLayer({
        url: urlPoint,
        renderer: picRenderer,
      });

      geoJsonLayer.title = 'Custom legend title'; // Custom legend title
      geoJsonLayer.renderer = new SimpleRenderer({
        // Custom polygon renderer
        symbol: new SimpleFillSymbol({
          color: 'rgba(0,76,115,0.2)',
          // outline: undefined
        }),
      });
      webmap.add(geoJsonLayer);
      webmap.add(geoJsonLayerPoint);

      const legend = new Expand({
        content: new Legend({
          view,
          hideLayersNotInCurrentView: false,
          style: { type: 'card', layout: 'stack' },
        }),
        view,
        expanded: true,
      });

      view.ui.add(legend, 'bottom-right');

      const layerList = new Expand({
        content: new LayerList({
          view,
        }),
        view,
        expanded: false,
      });
      view.ui.add(layerList, {
        position: 'top-right',
      });

      view.popupEnabled = false;
      view.on('click', (event) => {
        view.openPopup({
          // Set the popup's title to the coordinates of the clicked location
          title: 'This is a title',
          location: event.mapPoint, // Set the location of the popup to the clicked location
        });
      });

      view.center = new EsriPoint({ latitude: 0, longitude: 100 });
      view.zoom = 8;

      // Esri ^

      // esri.get(
      //   'https://www.arcgis.com/sharing/content/items/62914b2820c24d4e95710ebae77937cb/data',
      //   {},
      //   function (error, response) {
      //     if (error) {
      //       return;
      //     }

      //     const arcGISFeatures =
      //       response.operationalLayers[0].featureCollection.layers[0].featureSet
      //         .features;
      //     const idField =
      //       response.operationalLayers[0].featureCollection.layers[0]
      //         .layerDefinition.objectIdField;

      //     // empty geojson feature collection
      //     const geoJSONFeatureCollection = {
      //       type: 'FeatureCollection',
      //       features: [],
      //     } as FeatureCollection;

      //     for (let i = arcGISFeatures.length - 1; i >= 0; i--) {
      //       // convert ArcGIS Feature to GeoJSON Feature
      //       const geoJSONFeature = esri.Util.arcgisToGeoJSON(
      //         arcGISFeatures[i],
      //         idField
      //       );

      //       // unproject the web mercator coordinates to lat/lng
      //       const latlng = Projection.Mercator.unproject(
      //         L.point(geoJSONFeature.geometry.coordinates)
      //       );
      //       geoJSONFeature.geometry.coordinates = [latlng.lng, latlng.lat];

      //       geoJSONFeatureCollection.features.push(geoJSONFeature);

      //       const geojsonLayer = L.geoJSON(geoJSONFeatureCollection).addTo(map);
      //       map.addLayer(geojsonLayer);

      // const basemapLayers = {

      //   "ArcGIS:Streets": getBasemap("ArcGIS:Streets").addTo(map),

      //   "ArcGIS:Navigation": getBasemap("ArcGIS:Navigation"),
      //   "ArcGIS:Topographic": getBasemap("ArcGIS:Topographic"),
      //   "ArcGIS:LightGray": getBasemap("ArcGIS:LightGray"),
      //   "ArcGIS:DarkGray": getBasemap("ArcGIS:DarkGray"),
      //   "ArcGIS:StreetsRelief": getBasemap("ArcGIS:StreetsRelief"),
      //   "ArcGIS:Imagery": getBasemap("ArcGIS:Imagery"),
      //   "ArcGIS:ChartedTerritory": getBasemap("ArcGIS:ChartedTerritory"),
      //   "ArcGIS:ColoredPencil": getBasemap("ArcGIS:ColoredPencil"),
      //   "ArcGIS:Nova": getBasemap("ArcGIS:Nova"),
      //   "ArcGIS:Midcentury": getBasemap("ArcGIS:Midcentury"),
      //   "OSM:Standard": getBasemap("OSM:Standard"),
      //   "OSM:Streets": getBasemap("OSM:Streets")
      // };
      // }
      // }
      // );
    };

    if (!leafletConfig) return null;

    const handleBasemapChange = async (basemapEnum: string) => {
      setSelectedBasemap(basemapEnum);
      const apiKey =
        'AAPK14d9ce6201374c03b1cf299a89233d1dmUlplQEZ0n3VGjtMKyjPB4hxo38eEXXaNz5ENsj_Nn1LMuVklAiuGvbBBWf1edlo';
      const testBasemap = vectorBasemapLayer(basemapEnum, {
        // Function from esri-leaflet-vector plugin
        apiKey,
      });
      if (map) {
        map.removeLayer(currentBasemapLayer);
        setCurrentBasemapLayer(testBasemap);
        map.addLayer(testBasemap);

        // ---------------------------------------------------------------------------------------------------------
        // Try and retrieve a feature layer
        // Legend ? -- https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads_Styled/FeatureServer/0?f=pjson
        // Fetch drawing info for feature layer  *******  DRAWING INFO *******
        const url =
          'https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads_Styled/FeatureServer/0?f=pjson';
        fetch(url)
          .then((res) => res.json())
          .then(async (out) => {
            const symbol = out.drawingInfo.renderer.symbol;
            console.log({ symbol });
            const icon = L.icon({
              iconUrl:
                'data:image/png;base64,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',
              iconSize: [symbol.width, symbol.height],
            });

            const trailheads = await esri.featureLayer({
              url: 'https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads_Styled/FeatureServer/0',
              // pointToLayer(_geojson, latlng) {
              //   return L.marker(latlng, {
              //     icon,
              //   });
              // },
            });

            console.log({ trailheads });

            const trails = await esri.featureLayer({
              url: 'https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails_Styled/FeatureServer/0',
            });
            const parks = await esri.featureLayer({
              url: 'https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Parks_and_Open_Space_Styled/FeatureServer/0',
            });

            // esri
            //   .dynamicMapLayer({
            //     url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer',
            //   })
            //   .addTo(map);

            // esri.featureLayer({
            //   url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/0',
            // }).addTo(map);

            map.addLayer(trailheads);
            map.addLayer(trails);
            map.addLayer(parks);

            // Legend testing
            // const legend = new Legend({
            //   layerInfos: [
            //     {
            //       layer: parks,
            //       title: 'Parks Layer',
            //     },
            //   ],
            // });

            // console.log({ legend });

            // Legend / UI
            // const info = new L.Control();

            // info.onAdd = function () {
            //   this._div = L.DomUtil.create('div', 'info');
            //   this._div.innerHTML = '<h2>Testing some HTML</h2>';
            //   return this._div;
            // };

            // info.addTo(map);

            // Add to map

            map.setView([34.02, -118.805], 13);
          })
          .catch((err) => {
            throw err;
          });
      }
    };

    const basemapOptions = [
      { value: 'ArcGIS:DarkGray', label: 'ArcGIS:DarkGray' },
      { value: 'ArcGIS:DarkGray:Base', label: 'ArcGIS:DarkGray:Base' },
      { value: 'ArcGIS:DarkGray:Labels', label: 'ArcGIS:DarkGray:Labels' },
      { value: 'ArcGIS:LightGray', label: 'ArcGIS:LightGray' },
      { value: 'ArcGIS:LightGrayBase', label: 'ArcGIS:LightGrayBase' },
      { value: 'ArcGIS:LightGrayLabels', label: 'ArcGIS:LightGrayLabels' },
      { value: 'ArcGIS:Navigation', label: 'ArcGIS:Navigation' },
      { value: 'ArcGIS:NavigationNight', label: 'ArcGIS:NavigationNight' },
      { value: 'ArcGIS:Streets', label: 'ArcGIS:Streets' },
      { value: 'ArcGIS:StreetsRelief', label: 'ArcGIS:StreetsRelief' },
      {
        value: 'ArcGIS:StreetsRelief:Base',
        label: 'ArcGIS:StreetsRelief:Base',
      },
      { value: 'ArcGIS:StreetsNight', label: 'ArcGIS:StreetsNight' },
      { value: 'ArcGIS:Imagery', label: 'ArcGIS:Imagery' },
      { value: 'ArcGIS:Imagery:Standard', label: 'ArcGIS:Imagery:Standard' },
      { value: 'ArcGIS:Imagery:Labels', label: 'ArcGIS:Imagery:Labels' },
      { value: 'ArcGIS:Topographic', label: 'ArcGIS:Topographic' },
      { value: 'ArcGIS:Topographic:Base', label: 'ArcGIS:Topographic:Base' },
      { value: 'ArcGIS:Terrain', label: 'ArcGIS:Terrain' },
      { value: 'ArcGIS:Terrain:Base', label: 'ArcGIS:Terrain:Base' },
      { value: 'ArcGIS:Terrain:Detail', label: 'ArcGIS:Terrain:Detail' },
      { value: 'ArcGIS:Oceans', label: 'ArcGIS:Oceans' },
      { value: 'ArcGIS:Oceans:Base', label: 'ArcGIS:Oceans:Base' },
      { value: 'ArcGIS:Oceans:Labels', label: 'ArcGIS:Oceans:Labels' },
      { value: 'ArcGIS:Hillshade:Dark', label: 'ArcGIS:Hillshade:Dark' },
      { value: 'ArcGIS:Hillshade:Light', label: 'ArcGIS:Hillshade:Light' },
      { value: 'OSM:Standard', label: 'OSM:Standard' },
      { value: 'OSM:StandardRelief', label: 'OSM:StandardRelief' },
      { value: 'OSM:StandardRelief:Base', label: 'OSM:StandardRelief:Base' },
      { value: 'OSM:DarkGray', label: 'OSM:DarkGray' },
      { value: 'OSM:DarkGray:Base', label: 'OSM:DarkGray:Base' },
      { value: 'OSM:DarkGray:Labels', label: 'OSM:DarkGray:Labels' },
      { value: 'OSM:LightGray', label: 'OSM:LightGray' },
      { value: 'OSM:LightGray:Base', label: 'OSM:LightGray:Base' },
      { value: 'OSM:LightGray:Labels', label: 'OSM:LightGray:Labels' },
      { value: 'OSM:Streets', label: 'OSM:Streets' },
      { value: 'OSM:StreetsRelief', label: 'OSM:StreetsRelief' },
      { value: 'OSM:StreetsRelief:Base', label: 'OSM:StreetsRelief:Base' },
      { value: 'ArcGIS:HumanGeography', label: 'ArcGIS:HumanGeography' },
      {
        value: 'ArcGIS:HumanGeography:Base',
        label: 'ArcGIS:HumanGeography:Base',
      },
      {
        value: 'ArcGIS:HumanGeography:Detail',
        label: 'ArcGIS:HumanGeography:Detail',
      },
      {
        value: 'ArcGIS:HumanGeography:Label',
        label: 'ArcGIS:HumanGeography:Label',
      },
      {
        value: 'ArcGIS:HumanGeographyDark',
        label: 'ArcGIS:HumanGeographyDark',
      },
      {
        value: 'ArcGIS:HumanGeographyDark:Base',
        label: 'ArcGIS:HumanGeographyDark:Base',
      },
      {
        value: 'ArcGIS:HumanGeographyDark:Detail',
        label: 'ArcGIS:HumanGeographyDark:Detail',
      },
      {
        value: 'ArcGIS:HumanGeographyDark:Label',
        label: 'ArcGIS:HumanGeographyDark:Label',
      },
      { value: 'ArcGIS:ColoredPencil', label: 'ArcGIS:ColoredPencil' },
      { value: 'ArcGIS:Community', label: 'ArcGIS:Community' },
      { value: 'ArcGIS:Nova', label: 'ArcGIS:Nova' },
      { value: 'ArcGIS:ChartedTerritory', label: 'ArcGIS:ChartedTerritory' },
      {
        value: 'ArcGIS:ChartedTerritory:Base',
        label: 'ArcGIS:ChartedTerritory:Base',
      },
      { value: 'ArcGIS:Midcentury', label: 'ArcGIS:Midcentury' },
      { value: 'ArcGIS:Newspaper', label: 'ArcGIS:Newspaper' },
      { value: 'ArcGIS:ModernAntique', label: 'ArcGIS:ModernAntique' },
      {
        value: 'ArcGIS:ModernAntique:Base',
        label: 'ArcGIS:ModernAntique:Base',
      },
    ];

    // // Code to move legend above map:
    const legendDiv = document.getElementsByClassName('esri-legend')[0];

    // if (legendDiv) {
    //   //   html2canvas(legendDiv as HTMLElement, { scale: 1.1 }).then((canvas) => {
    //   //     const imageDataURL = canvas.toDataURL("image/png");
    //   //     setLegendImage(imageDataURL);
    //   // });

    //   html2canvas(legendDiv as HTMLElement, {
    //     scrollY: -window.scrollY,
    //     scale: 1.1,
    //   }).then(function (canvas) {
    //     const img = canvas.toDataURL();
    //     if (img.length > 100) {
    //       setLegendImage(img);
    //     }
    //   });
    // }

    return (
      <>
        <Box mb="24px">
          <Select
            id="idea-preview-select-assignee"
            options={basemapOptions}
            onChange={(value) => {
              handleBasemapChange(value.value);
            }}
            value={selectedBasemap}
          />
        </Box>
        <Container className={className || ''}>
          <MapWrapper>
            {!isNilOrError(boxContent) && (
              <BoxContainer>
                <CloseButton onClick={handleBoxOnClose}>
                  <CloseIcon name="close" />
                </CloseButton>
                {boxContent}
              </BoxContainer>
            )}

            {customMapsEnabled && additionalLeafletConfig === null ? null : (
              <Suspense fallback={false}>
                <LeafletMap
                  id="mapid"
                  className="e2e-leafletmap"
                  mapHeight={mapHeight}
                  onInit={handleOnInit}
                  {...leafletConfig}
                />
              </Suspense>
            )}
            <Outlet
              id="app.components.Map.leafletConfig"
              projectId={projectId ?? undefined}
              onLeafletConfigChange={handleLeafletConfigChange}
              centerLatLng={centerLatLng}
              zoomLevel={zoomLevel}
              points={points}
            />
          </MapWrapper>
          {/* {!hideLegend && { legend }} */}
        </Container>

        <Box>
          {legendImage && <img src={legendImage} alt="Alt text" />}
          <link
            rel="stylesheet"
            href="https://js.arcgis.com/4.28/esri/themes/light/main.css"
          />
          <Box
            id="esriMap"
            padding="0px"
            margin="0px"
            height={'600px'}
            width="100%"
            opacity={1}
          />
        </Box>
      </>
    );
  }
);

export default Map;
