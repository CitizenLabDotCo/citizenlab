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
import MapView from '@arcgis/core/views/MapView.js';
import EsriMap from '@arcgis/core/Map.js';
import jsonUtils, * as symbolJsonUtils from '@arcgis/core/symbols/support/jsonUtils.js';
import { renderPreviewHTML } from '@arcgis/core/symbols/support/symbolUtils.js';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer.js';

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

      const view = new MapView({
        container: 'esriMap', // Reference to the DOM node that will contain the view
        map: esriMap,
        zoom: 2,
      });

      const layer = new FeatureLayer({
        // URL to the service
        url: 'https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Parks_and_Open_Space_Styled/FeatureServer/0',
      });

      esriMap.add(layer);

      const legend = new Legend({
        view,
      });
      view.ui.add(legend, 'bottom-right');

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
        // const trailheads = esri.featureLayer({
        //   url: 'https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads_Styled/FeatureServer/0',
        // });
        // const trails = esri.featureLayer({
        //   url: 'https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails_Styled/FeatureServer/0',
        // });
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

        // map.addLayer(trailheads);
        // map.addLayer(trails);

        map.addLayer(parks);

        // Fetch drawing info for feature layer  *******  DRAWING INFO *******
        // const url =
        //   'https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Parks_and_Open_Space_Styled/FeatureServer/0?f=pjson';
        // fetch(url)
        //   .then((res) => res.json())
        //   .then(async (out) => {
        //     console.log('Renderer: ', out.drawingInfo.renderer);
        //     console.log(
        //       'First layer symbol: ',
        //       out.drawingInfo.renderer.uniqueValueInfos[0].symbol
        //     );
        //     const symbol = symbolJsonUtils.fromJSON(
        //       out.drawingInfo.renderer.uniqueValueInfos[0].symbol
        //     );
        //     const awaitedImage = await renderPreviewHTML(symbol);

        //     console.log('Image: ', awaitedImage);
        //     setSymbolPreview(awaitedImage);
        //   })
        //   .catch((err) => {
        //     throw err;
        //   });

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

    // Code to move legend above map:
    // const legendDiv = document.getElementsByClassName('esri-legend')[0];

    // if (legendDiv) {
    //   document.getElementById('newLegendDiv')?.appendChild(legendDiv);
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
          <>
            <>Testing Legend Generation: </>
            <Box id="newLegendDiv" />
            <link
              rel="stylesheet"
              href="https://js.arcgis.com/4.28/esri/themes/light/main.css"
            />
            <Box
              id="esriMap"
              padding="0px"
              margin="0px"
              height="600px"
              width="100%"
              opacity={1}
            />
          </>
        </Container>
      </>
    );
  }
);

export default Map;
