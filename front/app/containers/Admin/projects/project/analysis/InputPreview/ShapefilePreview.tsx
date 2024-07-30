import React, { useEffect, useState } from 'react';

import MapView from '@arcgis/core/views/MapView';
import { Text, Box } from '@citizenlab/cl2-component-library';
import { FeatureCollection } from 'geojson';
import shp from 'shpjs';

import useIdeaFiles from 'api/idea_files/useIdeaFiles';
import { IMapLayerAttributes } from 'api/map_layers/types';

import useLocalize from 'hooks/useLocalize';

import EsriMap from 'components/EsriMap';
import {
  createEsriGeoJsonLayers,
  goToLayerExtent,
} from 'components/EsriMap/utils';
import { FormData } from 'components/Form/typings';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import { setLayerRenderer } from './utils';

type Props = {
  inputId: string;
  file: FormData;
};

const ShapefilePreview = ({ inputId, file }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { data: inputFiles } = useIdeaFiles(inputId);
  const [mapView, setMapView] = useState<MapView | null>(null);
  const [geojsonCollection, setGeojsonCollection] = useState<
    FeatureCollection[] | null
  >(null);

  // Get File URL
  const fileUrl = inputFiles?.data.find(
    (inputFile) => inputFile.id === file?.id
  )?.attributes.file;

  // Convert the shapefile to GeoJSON
  useEffect(() => {
    async function getGeojson() {
      if (fileUrl?.url?.endsWith('.zip')) {
        const conversionResult = await shp(fileUrl.url);
        if (Array.isArray(conversionResult)) {
          // User has uploaded multiple shapefiles within the zip file
          setGeojsonCollection(conversionResult);
        } else {
          setGeojsonCollection([conversionResult]);
        }
      }
    }
    getGeojson();
  }, [fileUrl]);

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
      setLayerRenderer(layer);
    });
  });

  const onInit = (mapView: MapView) => {
    setMapView(mapView);
  };

  useEffect(() => {
    const firstLayer = mapView?.map?.layers?.['items']?.[0];
    if (firstLayer) {
      firstLayer.on('layerview-create', () => {
        // Zoom the map to the extent of the layer
        goToLayerExtent(firstLayer, mapView, true);
      });
    }
  }, [esriLayers, mapView?.map?.layers, mapView]);

  if (!fileUrl?.url.endsWith('.zip')) {
    return (
      <Text fontStyle="italic">{formatMessage(messages.invalidShapefile)}</Text>
    );
  }
  return (
    <Box key={inputId}>
      <Text my="4px" color="coolGrey600" fontSize="s" fontStyle="italic">
        {formatMessage(messages.shapefileUploadDisclaimer)}
      </Text>
      <EsriMap
        initialData={{
          onInit,
          showFullscreenOption: true,
          center: {
            type: 'Point',
            coordinates: [
              esriLayers?.[0]?.fullExtent?.center.latitude,
              esriLayers?.[0]?.fullExtent?.center.longitude,
            ],
          },
        }}
        layers={esriLayers}
        height="200px"
      />
    </Box>
  );
};

export default ShapefilePreview;
