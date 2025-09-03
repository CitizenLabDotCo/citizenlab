import React, { useState } from 'react';

import {
  Button,
  Box,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

import useAreasWithProjectsCounts from 'api/areas/useAreasWithProjectsCounts';

import useAreaTerms from 'hooks/areaTerms/useAreaTerms';

import UpdateFollowAreaWithProjects from 'components/Areas/FollowArea/UpdateFollowAreaWithProjects';
import Modal from 'components/UI/Modal';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const FollowAreasButtonWithModal = () => {
  const { formatMessage } = useIntl();
  const [isModalOpened, setIsModalOpened] = useState(false);
  const { data: areasWithProjectCount } = useAreasWithProjectsCounts();
  const { areasTerm: capitalizedAreasTerm } = useAreaTerms({
    capitalized: true,
  });
  const isSmallerThanPhone = useBreakpoint('phone');

  if (!areasWithProjectCount) return null;

  return (
    <>
      <Button
        onClick={() => setIsModalOpened(!isModalOpened)}
        buttonStyle="text"
        textDecoration="underline"
        data-cy="e2e-follow-areas-button"
      >
        {formatMessage(messages.followPreferences)}
      </Button>
      <Modal
        opened={isModalOpened}
        close={() => setIsModalOpened(false)}
        header={capitalizedAreasTerm}
      >
        <Box p={isSmallerThanPhone ? '16px' : '32px'}>
          <Box mb="24px">
            <Warning>{formatMessage(messages.areaButtonsInfo2)}</Warning>
          </Box>
          <Box mb="24px">
            {areasWithProjectCount.data.map((area, i) => (
              <Box
                display="inline-block"
                mr={i === areasWithProjectCount.data.length - 1 ? '0px' : '8px'}
                mb="8px"
                key={area.id}
              >
                <UpdateFollowAreaWithProjects
                  area={area}
                  hideButtonIcon={isSmallerThanPhone}
                />
              </Box>
            ))}
          </Box>
          <Button
            bgColor={colors.green500}
            icon="check"
            onClick={() => setIsModalOpened(false)}
            data-cy="e2e-follow-areas-modal-done-button"
          >
            {formatMessage(messages.done)}
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default FollowAreasButtonWithModal;
