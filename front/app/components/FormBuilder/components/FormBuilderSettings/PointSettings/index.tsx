import React, { useMemo, useState } from 'react';

// components
import {
  Box,
  Button,
  IconTooltip,
  Label,
} from '@citizenlab/cl2-component-library';
import EsriMap from 'components/EsriMap';
import styled from 'styled-components';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import Modal from 'components/UI/Modal';
import CustomMapConfigPage from 'containers/Admin/CustomMapConfigPage';
import { useFormContext } from 'react-hook-form';
import useAddMapConfig from 'api/map_config/useAddMapConfig';
import useMapConfig from 'api/map_config/useMapConfig';
import { useParams } from 'react-router-dom';
import { IFlatCustomFieldWithIndex } from 'api/custom_fields/types';
import useRawCustomFields from 'api/custom_fields/useRawCustomFields';
import {
  parseLayers,
  showLayerVisibilityControls,
} from 'components/EsriMap/utils';
import useLocalize from 'hooks/useLocalize';
// import { IMapConfig } from 'api/map_config/types';

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
  const { data: projectMapConfig } = useMapConfig(projectId);
  const { data: rawCustomFields } = useRawCustomFields({ phaseId });
  const { mutateAsync: createProjectMapConfig } = useAddMapConfig();

  // Get current map config ID for this field
  const mapConfigId =
    watch(mapConfigIdName) ||
    rawCustomFields?.data.find((rawField) => rawField.id === field.id)
      ?.relationships?.map_config?.data?.id;

  // Load map config
  const { data: fieldMapConfig } = useMapConfig(mapConfigId);
  const mapConfig = fieldMapConfig || projectMapConfig;

  // Load map state from mapConfig
  const mapLayers = useMemo(() => {
    return parseLayers(mapConfig, localize);
  }, [localize, mapConfig]);

  const onConfigureMapClick = () => {
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
  };

  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Box mb="24px">
        <StyledLabel
          htmlFor="maximumInput"
          value={
            <>
              {formatMessage(messages.mapConfiguration)}
              <IconTooltip
                content={formatMessage(messages.configureMapTooltip)}
              />
            </>
          }
        />
        <EsriMap
          height="360px"
          layers={mapLayers}
          initialData={{
            showLegend: true,
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
        width="90vw"
        close={() => {
          setShowModal(false);
        }}
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
