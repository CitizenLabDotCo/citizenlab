/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import React, { useCallback, useMemo, useState } from 'react';

import MapView from '@arcgis/core/views/MapView';
import { Box, Button, Label, Spinner } from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import customFieldsKeys from 'api/custom_fields/keys';
import { IFlatCustomFieldWithIndex } from 'api/custom_fields/types';
import useRawCustomFields from 'api/custom_fields/useRawCustomFields';
import useAddMapConfig from 'api/map_config/useAddMapConfig';
import useDuplicateMapConfig from 'api/map_config/useDuplicateMapConfig';
import useMapConfigById from 'api/map_config/useMapConfigById';
import useProjectMapConfig from 'api/map_config/useProjectMapConfig';

import useLocalize from 'hooks/useLocalize';

import CustomMapConfigPage from 'containers/Admin/CustomMapConfigPage';

import EsriMap from 'components/EsriMap';
import { goToMapLocation, parseLayers } from 'components/EsriMap/utils';
import Modal from 'components/UI/Modal';
import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { queryClient } from 'utils/cl-react-query/queryClient';
import { getCenter, getZoomLevel } from 'utils/mapUtils/map';

import messages from './messages';

const StyledLabel = styled(Label)`
  height: 100%;
  margin-top: auto;
  margin-bottom: 16px;
`;

type Props = {
  mapConfigIdName: string;
  field: IFlatCustomFieldWithIndex;
  pageLayoutName?: string;
};

const PointSettings = ({ mapConfigIdName, pageLayoutName, field }: Props) => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId?: string;
  };

  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { setValue, watch } = useFormContext();
  const [showModal, setShowModal] = useState(false);
  const { data: projectMapConfig } = useProjectMapConfig(projectId);
  const { data: rawCustomFields, isLoading: isLoadingRawFields } =
    useRawCustomFields({ phaseId });

  const { mutateAsync: createMapConfig } = useAddMapConfig();
  const { mutateAsync: duplicateMapConfig } = useDuplicateMapConfig();
  const [mapView, setMapView] = useState<MapView | null>(null);

  // Determine whether to show the map configuration option
  const showMapConfigurationOption = pageLayoutName
    ? watch(pageLayoutName) === 'map'
    : true;

  // Default project map settings if not present
  const { data: appConfig } = useAppConfiguration();

  // Get current map config ID for this field
  const mapConfigId =
    watch(mapConfigIdName) ||
    rawCustomFields?.data.find((rawField) => rawField.id === field.id)
      ?.relationships?.map_config?.data?.id;

  // Load map config
  const { data: fieldMapConfig, isLoading: isLoadingFieldConfig } =
    useMapConfigById(mapConfigId);
  const mapConfig = fieldMapConfig || projectMapConfig;

  // Load map state from mapConfig
  const mapLayers = useMemo(() => {
    if (!showMapConfigurationOption) {
      // Reset the map view if we're hiding the map
      mapView?.destroy();
    }
    return parseLayers(mapConfig, localize);
  }, [localize, mapConfig, mapView, showMapConfigurationOption]);

  const onConfigureMapClick = useCallback(() => {
    if (!mapConfigId) {
      // Create a new map config if we don't have one for this field
      const duplicateAndOpenModal = (projectMapConfigId: string) => {
        duplicateMapConfig(projectMapConfigId, {
          onSuccess: (data) => {
            setValue(mapConfigIdName, data.data.id, { shouldDirty: true });
            setShowModal(true);
          },
        });
      };

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const projectMapConfigId = projectMapConfig?.data?.id;
      if (projectMapConfigId) {
        // Duplicate the project map config if it exists
        duplicateAndOpenModal(projectMapConfigId);
      } else {
        // Create a new map config with default application values if there is no project map config
        const defaultLatLng = getCenter(undefined, appConfig?.data, undefined);
        const defaultZoom = getZoomLevel(undefined, appConfig?.data, undefined);
        createMapConfig(
          {
            center_geojson: {
              type: 'Point',
              coordinates: [defaultLatLng[1], defaultLatLng[0]],
            },
            zoom_level: defaultZoom.toString(),
          },
          {
            onSuccess: (newProjectMapConfig) => {
              setValue(mapConfigIdName, newProjectMapConfig.data.id, {
                shouldDirty: true,
              });
              setShowModal(true);
            },
          }
        );
      }
    } else {
      // Otherwise we already have a map config, so we just open the modal
      setShowModal(true);
    }
  }, [
    createMapConfig,
    appConfig?.data,
    mapConfigId,
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    projectMapConfig?.data?.id,
    duplicateMapConfig,
    mapConfigIdName,
    setValue,
  ]);

  const onModalClose = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: customFieldsKeys.list({
        projectId,
        phaseId,
      }),
    });

    // Get attributes from the map config
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const centerPoint = mapConfig?.data?.attributes?.center_geojson;
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const zoom = Number(mapConfig?.data?.attributes?.zoom_level);

    // Go to current map extent
    if (centerPoint && mapView) {
      goToMapLocation(centerPoint, mapView, zoom);
    }
    setShowModal(false);
  }, [
    projectId,
    phaseId,
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    mapConfig?.data?.attributes?.center_geojson,
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    mapConfig?.data?.attributes?.zoom_level,
    mapView,
  ]);

  const onMapInit = useCallback((mapView: MapView) => {
    // Save the esriMapView in state
    setMapView(mapView);
  }, []);

  if (!showMapConfigurationOption) {
    return null;
  }

  if ((isLoadingFieldConfig && mapConfigId) || isLoadingRawFields) {
    return (
      <Box my="24px">
        <Spinner />
      </Box>
    );
  }

  return (
    <>
      <Box mb="24px">
        <StyledLabel
          htmlFor="maximumInput"
          value={<>{formatMessage(messages.mapConfiguration)}</>}
        />
        <EsriMap
          height="400px"
          layers={mapLayers}
          initialData={{
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            zoom: Number(mapConfig?.data?.attributes?.zoom_level),
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            center: mapConfig?.data?.attributes?.center_geojson,
            showLayerVisibilityControl: true,
            showLegend: true,
            onInit: onMapInit,
          }}
          webMapId={mapConfig?.data.attributes.esri_web_map_id}
        />
        {/* TODO: Fix this the next time the file is edited. */}
        {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
        {(field?.input_type === 'line' || field?.input_type === 'polygon') && (
          <Box my="8px">
            <Warning>
              <FormattedMessage
                {...messages.linePolygonMapWarning}
                values={{
                  accessibilityStatement: (
                    <a
                      href={'/pages/accessibility-statement'}
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: 'underline' }}
                    >
                      <FormattedMessage {...messages.accessibilityStatement} />
                    </a>
                  ),
                }}
              />
            </Warning>
          </Box>
        )}
        <Button
          data-cy="e2e-configure-map-button"
          mt="16px"
          iconPos="left"
          icon="edit"
          buttonStyle="secondary-outlined"
          onClick={onConfigureMapClick}
        >
          {formatMessage(messages.configureMap)}
        </Button>
      </Box>
      <Modal
        opened={showModal}
        width="84vw"
        close={onModalClose}
        header={formatMessage(messages.mapConfiguration)}
      >
        <Box p="20px">
          <CustomMapConfigPage
            passedMapConfig={mapConfigId ? fieldMapConfig : projectMapConfig}
          />
        </Box>
      </Modal>
    </>
  );
};

export default PointSettings;
