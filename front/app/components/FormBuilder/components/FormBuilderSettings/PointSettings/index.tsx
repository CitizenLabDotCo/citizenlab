import React, { useCallback, useMemo, useState } from 'react';

// components
import { Box, Button, Label } from '@citizenlab/cl2-component-library';
import EsriMap from 'components/EsriMap';
import Modal from 'components/UI/Modal';
import CustomMapConfigPage from 'containers/Admin/CustomMapConfigPage';

// styling
import styled from 'styled-components';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import useLocalize from 'hooks/useLocalize';

// hooks
import { useFormContext } from 'react-hook-form';
import useAddMapConfig from 'api/map_config/useAddMapConfig';
import useProjectMapConfig from 'api/map_config/useProjectMapConfig';
import { useParams } from 'react-router-dom';
import useRawCustomFields from 'api/custom_fields/useRawCustomFields';
import useMapConfigById from 'api/map_config/useMapConfigById';

// utils
import { goToMapLocation, parseLayers } from 'components/EsriMap/utils';

// types
import { IFlatCustomFieldWithIndex } from 'api/custom_fields/types';
import MapView from '@arcgis/core/views/MapView';

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
  const { data: rawCustomFields } = useRawCustomFields({ phaseId });
  const { mutateAsync: createProjectMapConfig } = useAddMapConfig();
  const [esriMapView, setEsriMapview] = useState<MapView | null>(null);

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
    // Get attributes from the map config
    const centerPoint = mapConfig?.data?.attributes?.center_geojson;
    const zoom = Number(mapConfig?.data?.attributes?.zoom_level);

    // Go to current map extent
    if (centerPoint && esriMapView && zoom) {
      goToMapLocation(centerPoint, esriMapView, zoom).then(() => {
        setShowModal(false);
      });
    }
  }, [
    esriMapView,
    mapConfig?.data?.attributes?.center_geojson,
    mapConfig?.data?.attributes?.zoom_level,
  ]);

  const onMapInit = useCallback(
    (mapView: MapView) => {
      // Save the esriMapView in state
      if (!esriMapView) {
        setEsriMapview(mapView);
      }
    },
    [esriMapView]
  );

  if (isLoadingFieldConfig && mapConfigId) {
    return null;
  }

  return (
    <>
      <Box mb="24px">
        <StyledLabel
          htmlFor="maximumInput"
          value={<>{formatMessage(messages.mapConfiguration)}</>}
        />
        <EsriMap
          height="360px"
          layers={mapLayers}
          initialData={{
            zoom: Number(mapConfig?.data?.attributes?.zoom_level),
            center: mapConfig?.data?.attributes?.center_geojson,
            showLayerVisibilityControl: false,
            showLegend: true,
            onInit: onMapInit,
          }}
        />
        <Button
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
          <CustomMapConfigPage passedMapConfig={mapConfig} />
        </Box>
      </Modal>
    </>
  );
};

export default PointSettings;
