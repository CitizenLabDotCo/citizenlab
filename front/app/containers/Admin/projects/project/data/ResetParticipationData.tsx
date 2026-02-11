import React, { useState } from 'react';

import { Button, Box, Title, Text } from '@citizenlab/cl2-component-library';

import useResetProject from 'api/projects/useResetProject';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import messages from './messages';

const ResetParticipationData = () => {
  const [modalOpened, setModalOpened] = useState(false);
  const { projectId } = useParams({
    from: '/$locale/admin/projects/$projectId/general/data',
  });
  const { mutate: resetProject, isLoading: isProjectResetLoading } =
    useResetProject();

  const { formatMessage } = useIntl();
  return (
    <Box display="flex" mb="20px">
      <Button
        buttonStyle="delete"
        onClick={() => setModalOpened(true)}
        id="e2e-reset-participation-data"
      >
        {formatMessage(messages.resetParticipationData)}
      </Button>
      <Modal opened={modalOpened} close={() => setModalOpened(false)}>
        <Title variant="h3">{formatMessage(messages.confirmationTitle)}</Title>
        <Text>{formatMessage(messages.confirmationDescription)}</Text>
        <Box display="flex" justifyContent="flex-end" gap="12px">
          <Button
            buttonStyle="secondary-outlined"
            onClick={() => setModalOpened(false)}
          >
            {formatMessage(messages.confirmationNo)}
          </Button>
          <Button
            id="e2e-reset-participation-data-yes"
            buttonStyle="delete"
            onClick={() =>
              resetProject(projectId, {
                onSuccess: () => setModalOpened(false),
              })
            }
            processing={isProjectResetLoading}
          >
            {formatMessage(messages.confirmationYes)}
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default ResetParticipationData;
