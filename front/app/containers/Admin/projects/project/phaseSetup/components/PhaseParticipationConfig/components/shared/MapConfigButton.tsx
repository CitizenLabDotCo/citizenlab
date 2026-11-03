import React, { lazy, Suspense, useState } from 'react';

import { Box, Button, Spinner } from '@citizenlab/cl2-component-library';

import Centerer from 'components/UI/Centerer';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from '../../../../../messages';

// Lazy so ArcGIS only loads once the map modal is opened.
const CustomMapConfigPage = lazy(
  () => import('containers/Admin/CustomMapConfigPage')
);

const MapConfigButton = () => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);
  const label = formatMessage(messages.configureMap);

  return (
    <>
      <Button
        buttonStyle="bo-secondary"
        width="100%"
        onClick={() => setOpened(true)}
      >
        {label}
      </Button>
      <Modal
        opened={opened}
        close={() => setOpened(false)}
        header={label}
        width="1100px"
      >
        <Box p="24px">
          <Suspense
            fallback={
              <Centerer height="500px">
                <Spinner />
              </Centerer>
            }
          >
            <CustomMapConfigPage />
          </Suspense>
        </Box>
      </Modal>
    </>
  );
};

export default MapConfigButton;
