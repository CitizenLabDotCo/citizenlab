import React, { useCallback, useMemo, useState } from 'react';

import MapView from '@arcgis/core/views/MapView';
import { Box, Button, Label, Spinner } from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import customFieldsKeys from 'api/custom_fields/keys';
import { IFlatCustomFieldWithIndex } from 'api/custom_fields/types';
import useRawCustomFields from 'api/custom_fields/useRawCustomFields';
import useAddMapConfig from 'api/map_config/useAddMapConfig';
import useMapConfigById from 'api/map_config/useMapConfigById';
import useProjectMapConfig from 'api/map_config/useProjectMapConfig';

import useLocalize from 'hooks/useLocalize';

import CustomMapConfigPage from 'containers/Admin/CustomMapConfigPage';

import EsriMap from 'components/EsriMap';
import { goToMapLocation, parseLayers } from 'components/EsriMap/utils';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import { queryClient } from 'utils/cl-react-query/queryClient';

import messages from './messages';

const StyledLabel = styled(Label)`
  height: 100%;
  margin-top: auto;
  margin-bottom: 16px;
`;

type Props = {
  mapConfigIdName: string;
  field: IFlatCustomFieldWithIndex;
};

const PointSettings = ({ mapConfigIdName, field }: Props) => {
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

  const { mutateAsync: createProjectMapConfig } = useAddMapConfig();
  const [mapView, setMapView] = useState<MapView | null>(null);

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
    return parseLayers(mapConfig, localize);
  }, [localize, mapConfig]);

  const onConfigureMapClick = useCallback(() => {
    // Create a new map config if we don't have one for this field
    if (!mapConfigId) {
      // Initial data is from existing project map config
      const initialData = projectMapConfig?.data?.attributes
        ? projectMapConfig.data.attributes
        : {};

      createProjectMapConfig(
        {
          ...initialData,
        },
        {
          onSuccess: (data) => {
            // Set the form value to the map config ID
            setValue(mapConfigIdName, data.data.id);
            // Open the modal
            setShowModal(true);
          },
        }
      );
    } else {
      // Otherwise we aready have a map config, so we open the modal
      setShowModal(true);
    }
  }, [
    createProjectMapConfig,
    mapConfigId,
    mapConfigIdName,
    projectMapConfig?.data?.attributes,
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
    const centerPoint = mapConfig?.data?.attributes?.center_geojson;
    const zoom = Number(mapConfig?.data?.attributes?.zoom_level);

    // Go to current map extent
    if (centerPoint && mapView) {
      goToMapLocation(centerPoint, mapView, zoom);
    }
    setShowModal(false);
  }, [
    projectId,
    phaseId,
    mapConfig?.data?.attributes?.center_geojson,
    mapConfig?.data?.attributes?.zoom_level,
    mapView,
  ]);

  const onMapInit = useCallback((mapView: MapView) => {
    // Save the esriMapView in state
    setMapView(mapView);
  }, []);

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
            zoom: Number(mapConfig?.data?.attributes?.zoom_level),
            center: mapConfig?.data?.attributes?.center_geojson,
            showLayerVisibilityControl: true,
            showLegend: true,
            onInit: onMapInit,
          }}
          webMapId={mapConfig?.data.attributes.esri_web_map_id}
        />
        <Button
          data-cy="e2e-configure-map-button"
          mt="16px"
          iconPos="left"
          icon="edit"
          buttonStyle="secondary"
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
