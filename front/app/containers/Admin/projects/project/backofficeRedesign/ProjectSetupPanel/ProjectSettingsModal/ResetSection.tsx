import React, { useState } from 'react';

import { Box, Button, Text, Title } from '@citizenlab/cl2-component-library';

import useResetProject from 'api/projects/useResetProject';

import dataMessages from 'containers/Admin/projects/project/data/messages';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

interface Props {
  projectId: string;
}

const ResetSection = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const [confirmOpened, setConfirmOpened] = useState(false);
  const { mutate: resetProject, isPending } = useResetProject();

  return (
    <Box>
      <Text variant="bo-section" mb="8px">
        {formatMessage(dataMessages.dataTitle)}
      </Text>
      <Text variant="bo-helper" mb="4px">
        {formatMessage(dataMessages.dataDescription)}
      </Text>
      <Text variant="bo-helper" color="error" mb="16px">
        {formatMessage(dataMessages.confirmationDescription)}
      </Text>
      <Button
        buttonStyle="bo-delete"
        width="auto"
        onClick={() => setConfirmOpened(true)}
        id="e2e-reset-participation-data"
      >
        {formatMessage(dataMessages.resetParticipationData)}
      </Button>

      <Modal
        opened={confirmOpened}
        close={() => setConfirmOpened(false)}
        ariaLabelledBy="reset-participation-data-title"
      >
        <Title
          id="reset-participation-data-title"
          variant="h4"
          fontWeight="semi-bold"
        >
          {formatMessage(dataMessages.confirmationTitle)}
        </Title>
        <Text variant="bo-helper" mb="16px">
          {formatMessage(dataMessages.confirmationDescription)}
        </Text>
        <Box display="flex" justifyContent="flex-end" gap="12px">
          <Button
            buttonStyle="bo-secondary"
            width="auto"
            onClick={() => setConfirmOpened(false)}
          >
            {formatMessage(dataMessages.confirmationNo)}
          </Button>
          <Button
            buttonStyle="bo-delete"
            width="auto"
            processing={isPending}
            onClick={() =>
              resetProject(projectId, {
                onSuccess: () => setConfirmOpened(false),
              })
            }
          >
            {formatMessage(dataMessages.confirmationYes)}
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default ResetSection;
