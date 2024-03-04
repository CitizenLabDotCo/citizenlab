import React, { useState } from 'react';

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
// import { IMapConfig } from 'api/map_config/types';

const StyledLabel = styled(Label)`
  height: 100%;
  margin-top: auto;
  margin-bottom: 16px;
`;

type Props = {
  mapConfigIdName: string;
};

const PointSettings = ({ mapConfigIdName }: Props) => {
  const { projectId } = useParams() as {
    projectId: string;
  };
  const { setValue, watch } = useFormContext();
  const { data: projectMapConfig } = useMapConfig(projectId);
  const { mutateAsync: createProjectMapConfig } = useAddMapConfig();

  console.log('Map Config ID: ', watch(mapConfigIdName));

  const onConfigureMapClick = () => {
    if (!watch(mapConfigIdName)) {
      // Create a map config if one doesn't already exist
      createProjectMapConfig(
        {},
        {
          onSuccess: (data) => {
            console.log({ data });
            // Set the form value to the map config ID
            setValue(mapConfigIdName, data.data.id);
            // Open the modal
            setShowModal(true);
          },
        }
      );
    }
  };

  const { formatMessage } = useIntl();

  const [showModal, setShowModal] = useState(false);
  // const [mapConfig, setMapConfig] = useState<IMapConfig | null>(null);

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
        <EsriMap height="300px" />
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
          <CustomMapConfigPage />
        </Box>
      </Modal>
    </>
  );
};

export default PointSettings;
