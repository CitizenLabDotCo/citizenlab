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

  // Get Shapefile URL
  const fileUrl = inputFiles?.data.find(
    (inputFile) => inputFile.id === file?.id
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  )?.attributes?.file?.url;

  // Convert the shapefile to GeoJSON
  useEffect(() => {
    async function getGeojson() {
      if (fileUrl?.endsWith('.zip')) {
        const conversionResult = await shp(fileUrl);
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
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const initialMapCenter = esriLayers?.[0]?.fullExtent?.center;

  esriLayers.map((layer) => {
    layer.opacity = 0.8;
    layer.on('layerview-create', () => {
      setLayerRenderer(layer);
    });
  });

  const onInit = (mapView: MapView) => {
    setMapView(mapView);
  };

  useEffect(
    () => {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const firstLayer = mapView?.map?.layers?.['items']?.[0];
      if (firstLayer) {
        firstLayer.on('layerview-create', () => {
          // Zoom the map to the extent of the layer
          goToLayerExtent(firstLayer, mapView, true);
        });
      }
    }, // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    [esriLayers, mapView?.map?.layers, mapView]
  );

  if (!fileUrl) {
    // No file was uploaded
    return (
      <Text fontStyle="italic">{formatMessage(messages.noFileUploaded)}</Text>
    );
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  } else if (!fileUrl?.endsWith('.zip')) {
    // This is not a valid file for this question type
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
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              initialMapCenter?.latitude,
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              initialMapCenter?.longitude,
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
