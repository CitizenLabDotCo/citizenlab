import React, { useState } from 'react';

import { Box, Button, Text, Title } from '@citizenlab/cl2-component-library';

import useResetProject from 'api/projects/useResetProject';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import dataMessages from '../../../data/messages';

interface Props {
  projectId: string;
}

const ResetSection = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const [confirmOpened, setConfirmOpened] = useState(false);
  const { mutate: resetProject, isPending } = useResetProject();

  return (
    <Box>
      <Title variant="h3" m="0 0 8px 0">
        {formatMessage(dataMessages.dataTitle)}
      </Title>
      <Text m="0 0 4px 0" color="textSecondary">
        {formatMessage(dataMessages.dataDescription)}
      </Text>
      <Text m="0 0 16px 0" color="error">
        {formatMessage(dataMessages.confirmationDescription)}
      </Text>
      <Button
        buttonStyle="delete"
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
        <Title id="reset-participation-data-title" variant="h3">
          {formatMessage(dataMessages.confirmationTitle)}
        </Title>
        <Text>{formatMessage(dataMessages.confirmationDescription)}</Text>
        <Box display="flex" justifyContent="flex-end" gap="12px">
          <Button
            buttonStyle="secondary-outlined"
            width="auto"
            onClick={() => setConfirmOpened(false)}
          >
            {formatMessage(dataMessages.confirmationNo)}
          </Button>
          <Button
            buttonStyle="delete"
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
