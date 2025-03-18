import React, { useState } from 'react';

import { Button, Box } from '@citizenlab/cl2-component-library';

import useAreasWithProjectsCounts from 'api/areas/useAreasWithProjectsCounts';

import UpdateFollowAreaWithProjects from 'components/Areas/FollowArea/UpdateFollowAreaWithProjects';
import Modal from 'components/UI/Modal';
import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

const ButtonWithFollowAreasModal = () => {
  const { formatMessage } = useIntl();
  const [isModalOpened, setIsModalOpened] = useState(false);
  const { data: areasWithProjectCount } = useAreasWithProjectsCounts();

  if (!areasWithProjectCount) return null;

  return (
    <>
      <Button
        onClick={() => setIsModalOpened(!isModalOpened)}
        buttonStyle="text"
      >
        <FormattedMessage {...messages.followAreas} />
      </Button>
      <Modal
        opened={isModalOpened}
        close={() => setIsModalOpened(false)}
        header={formatMessage(messages.areasYouFollow)}
      >
        <Box mb="24px">
          <Warning>{formatMessage(messages.areaButtonsInfo)}</Warning>
        </Box>
        <Box>
          {areasWithProjectCount.data.map((area, i) => (
            <Box
              display="inline-block"
              mr={i === areasWithProjectCount.data.length - 1 ? '0px' : '8px'}
              mb="8px"
              key={area.id}
            >
              <UpdateFollowAreaWithProjects area={area} />
            </Box>
          ))}
        </Box>
      </Modal>
    </>
  );
};

export default ButtonWithFollowAreasModal;
