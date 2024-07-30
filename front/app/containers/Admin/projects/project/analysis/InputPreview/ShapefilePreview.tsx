import React, { useEffect, useState } from 'react';

import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer';
import MapView from '@arcgis/core/views/MapView';
import { colors, Text, Box } from '@citizenlab/cl2-component-library';
import { FeatureCollection } from 'geojson';
import shp from 'shpjs';

import { IMapLayerAttributes } from 'api/map_layers/types';

import useLocalize from 'hooks/useLocalize';

import EsriMap from 'components/EsriMap';
import {
  createEsriGeoJsonLayers,
  getFillSymbol,
  getLineSymbol,
  getShapeSymbol,
  goToLayerExtent,
} from 'components/EsriMap/utils';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  fileUrl: string;
};

const ShapefilePreview = ({ fileUrl }: Props) => {
  const { formatMessage } = useIntl();
  const [mapView, setMapView] = useState<MapView | null>(null);
  const localize = useLocalize();

  // eslint-disable-next-line no-console
  console.log(fileUrl);

  const [geojsonCollection, setGeojsonCollection] = useState<
    FeatureCollection[] | null
  >(null);

  // Convert the shapefile to GeoJSON
  useEffect(() => {
    async function getGeojson() {
      const conversionResult = await shp(
        // TODO: Remove hardcoded URL for testing
        'http://localhost:4000/uploads/c72c5211-8e03-470b-9564-04ec0a8c322b/idea_file/file/d9ea69a0-7ea0-4e10-9eea-594cef9c0461/Multiple_shapefiles.zip'
      );
      if (Array.isArray(conversionResult)) {
        // User has uploaded multiple shapefiles within the zip file
        setGeojsonCollection(conversionResult);
      } else {
        setGeojsonCollection([conversionResult]);
      }
    }
    getGeojson();
  }, []);

  const mapLayers: IMapLayerAttributes[] = [];

  if (Array.isArray(geojsonCollection)) {
    // Create Esri map layers from the GeoJSON
    geojsonCollection.forEach((geojson, index) => {
      mapLayers.push({
        id: `id-${index}`,
        type: 'CustomMaps::GeojsonLayer',
        title_multiloc: {},
        geojson,
        default_enabled: true,
      });
    });
  }

  const esriLayers = createEsriGeoJsonLayers(mapLayers, localize);

  esriLayers.map((layer) => {
    layer.opacity = 0.8;

    layer.on('layerview-create', () => {
      if (layer.geometryType === 'point') {
        layer.renderer = new SimpleRenderer({
          symbol: getShapeSymbol({
            shape: 'circle',
            color: colors.primary,
            sizeInPx: 8,
            outlineWidth: 1.5,
            outlineColor: colors.white,
          }),
        });
      } else if (layer.geometryType === 'polygon') {
        layer.renderer = new SimpleRenderer({
          symbol: getFillSymbol({
            transparency: 0.1,
            color: colors.primary,
          }),
        });
      } else if (layer.geometryType === 'polyline') {
        layer.renderer = new SimpleRenderer({
          symbol: getLineSymbol({
            color: colors.primary,
          }),
        });
      }
    });
  });

  const onInit = (mapView: MapView) => {
    setMapView(mapView);
  };

  useEffect(() => {
    const firstLayer = mapView?.map?.layers?.['items']?.[0];
    if (firstLayer) {
      firstLayer.on('layerview-create', () => {
        goToLayerExtent(firstLayer, mapView, true);
      });
    }
  }, [esriLayers, mapView?.map?.layers, mapView]);

  return (
    <Box key={fileUrl}>
      <Text my="4px" color="coolGrey600" fontSize="s" fontStyle="italic">
        {formatMessage(messages.shapefileUploadDisclaimer)}
      </Text>
      <EsriMap
        initialData={{
          onInit,
          showFullscreenOption: true,
        }}
        layers={esriLayers}
        height="200px"
      />
    </Box>
  );
};

export default ShapefilePreview;
