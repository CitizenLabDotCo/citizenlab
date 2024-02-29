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
import { IMapConfig } from 'api/map_config/types';
import CustomMapConfigPage from 'containers/Admin/CustomMapConfigPage';

const StyledLabel = styled(Label)`
  height: 100%;
  margin-top: auto;
  margin-bottom: 16px;
`;

type Props = {
  mapConfigIdName: string;
};

const PointSettings = ({ mapConfigIdName }: Props) => {
  const { formatMessage } = useIntl();

  const [showModal, setShowModal] = useState(false);
  const [mapConfig, setMapConfig] = useState<IMapConfig | null>(null);

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
          onClick={() => {
            setShowModal(true);
          }}
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
