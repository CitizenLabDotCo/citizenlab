import React, { useCallback, useEffect, useState } from 'react';

import Point from '@arcgis/core/geometry/Point';
import Polyline from '@arcgis/core/geometry/Polyline';
import Graphic from '@arcgis/core/Graphic';
import Layer from '@arcgis/core/layers/Layer';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import Draw from '@arcgis/core/views/draw/Draw.js';
import MapView from '@arcgis/core/views/MapView';
import { Box, Button } from '@citizenlab/cl2-component-library';
import { ControlProps } from '@jsonforms/core';
import { useTheme } from 'styled-components';

import { IMapConfig } from 'api/map_config/types';

import useLocale from 'hooks/useLocale';

import EsriMap from 'components/EsriMap';
import ResetMapViewButton from 'components/EsriMap/components/ResetMapViewButton';
import { Option } from 'components/UI/LocationInput';

import { sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../../../ErrorDisplay';
import LocationTextInput from '../components/LocationTextInput';

type Props = {
  mapConfig?: IMapConfig;
  mapLayers?: Layer[];
  onMapInit?: (mapView: MapView) => void;
  mapView?: MapView | null;
  handlePointChange: (point: GeoJSON.Point | undefined) => void;
  didBlur: boolean;
};

const DesktopView = ({
  data,
  path,
  errors,
  mapConfig,
  mapLayers,
  onMapInit,
  handlePointChange,
  didBlur,
  mapView,
  id,
}: ControlProps & Props) => {
  const theme = useTheme();
  const locale = useLocale();
  const [address, setAddress] = useState<Option>({
    value: '',
    label: '',
  });
  const [vertices, setVertices] = useState<number[][]>([]);

  // DRAWING TESTS ************************************************************
  // create a new instance of draw
  const draw =
    mapView &&
    new Draw({
      view: mapView,
    });

  const pointSymbol = new SimpleMarkerSymbol({
    style: 'circle',
    color: [255, 255, 255, 0.8],
    size: '12px',
    outline: {
      color: [0, 100, 255, 0.8],
      width: 1.5,
    },
  });

  // create an instance of draw polyline action
  // the polyline vertices will be only added when
  // the pointer is clicked on the view
  const action = draw?.create('polygon', { mode: 'click' });

  function measureLine(vertices) {
    mapView?.graphics.removeAll();

    const line = createLine(vertices);
    const graphic = new Graphic({
      geometry: line,
      symbol: new SimpleFillSymbol({
        color: [0, 100, 255, 0.5],
        outline: {
          color: [0, 0, 0, 0.8],
          width: 2,
          style: 'dash',
        },
      }),
    });
    const vertexGraphics = vertices.map((vertex) => {
      return new Graphic({
        geometry: new Point({
          x: vertex[0],
          y: vertex[1],
          spatialReference: mapView?.spatialReference,
        }),
        symbol: pointSymbol,
      });
    });
    mapView?.graphics.add(graphic);
    // vertexGraphics[vertexIndex].symbol = new SimpleMarkerSymbol({
    //   style: 'circle',
    //   color: [0, 100, 255, 0.8],
    //   size: '12px',
    //   outline: {
    //     color: [0, 100, 255, 0.8],
    //     width: 1.5,
    //   },
    // });
    mapView?.graphics.addMany(vertexGraphics);
  }

  function createLine(vertices) {
    const lineVerts = vertices;
    if (vertices.length > 2) {
      lineVerts.push(vertices[0]);
    }
    const polyline = new Polyline({
      paths: lineVerts,
      spatialReference: mapView?.spatialReference,
    });
    return polyline;
  }

  // fires when a vertex is added
  action?.on('vertex-add', function (evt) {
    measureLine(evt.vertices);
  });

  // fires when the drawing is completed
  action?.on('draw-complete', function (evt) {
    evt.stopPropogation();
    // draw?.activeAction
  });

  action?.on('undo', function (evt) {
    measureLine(evt.vertices.slice(0, evt.vertices.length - 1));
  });

  const undoLatest = () => {
    action?.undo();
  };

  mapView?.on('double-click', function (evt: __esri.ViewDoubleClickEvent) {
    evt.stopPropagation();
    console.log('Intercepted double click.');
  });

  // When the location point changes, update the address and show a pin on the map
  useEffect(() => {
    // if (data) {
    //   handleDataPointChange({
    //     data,
    //     mapView,
    //     locale,
    //     tenantPrimaryColor: theme.colors.tenantPrimary,
    //     setAddress,
    //   });
    // } else {
    //   clearPointData(mapView, setAddress);
    // }
  }, [data, locale, mapView, theme.colors.tenantPrimary]);

  const onMapClick = useCallback(
    (event: any, mapView: MapView) => {
      // // Center the clicked location on the map
      // goToMapLocation(esriPointToGeoJson(event.mapPoint), mapView).then(() => {
      //   // Update the form data
      //   handlePointChange(esriPointToGeoJson(event.mapPoint));
      // });
    },
    [handlePointChange]
  );

  return (
    <>
      <Box display="flex" flexDirection="column" mb="8px">
        <Box mb="12px">
          <LocationTextInput
            address={address}
            handlePointChange={handlePointChange}
          />
        </Box>
        <>
          <EsriMap
            id="e2e-point-control-map"
            height="400px"
            layers={mapLayers}
            initialData={{
              zoom: Number(mapConfig?.data.attributes.zoom_level),
              center: data || mapConfig?.data.attributes.center_geojson,
              showLegend: true,
              showLayerVisibilityControl: true,
              onInit: onMapInit,
            }}
            webMapId={mapConfig?.data.attributes.esri_web_map_id}
            onClick={onMapClick}
          />
          <ResetMapViewButton mapConfig={mapConfig} mapView={mapView} />
        </>
        <Button
          ml="16px"
          mt="-120px"
          mb="100px"
          width="46px"
          onClick={() => {
            undoLatest();
          }}
          bgColor="blue"
        >
          {'<--'}
        </Button>
      </Box>

      <ErrorDisplay
        inputId={sanitizeForClassname(id)}
        ajvErrors={errors}
        fieldPath={path}
        didBlur={didBlur}
      />
    </>
  );
};

export default DesktopView;
