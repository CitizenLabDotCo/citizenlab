import React, { useState } from 'react';

import {
  Box,
  NewBOButton,
  NewBOText,
  Title,
} from '@citizenlab/cl2-component-library';

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
      <NewBOText variant="section" mb="8px">
        {formatMessage(dataMessages.dataTitle)}
      </NewBOText>
      <NewBOText variant="helper" mb="4px">
        {formatMessage(dataMessages.dataDescription)}
      </NewBOText>
      <NewBOText variant="helper" color="error" mb="16px">
        {formatMessage(dataMessages.confirmationDescription)}
      </NewBOText>
      <NewBOButton
        buttonStyle="delete"
        width="auto"
        onClick={() => setConfirmOpened(true)}
        id="e2e-reset-participation-data"
      >
        {formatMessage(dataMessages.resetParticipationData)}
      </NewBOButton>

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
        <NewBOText variant="helper" mb="16px">
          {formatMessage(dataMessages.confirmationDescription)}
        </NewBOText>
        <Box display="flex" justifyContent="flex-end" gap="12px">
          <NewBOButton
            buttonStyle="secondary-outlined"
            width="auto"
            onClick={() => setConfirmOpened(false)}
          >
            {formatMessage(dataMessages.confirmationNo)}
          </NewBOButton>
          <NewBOButton
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
          </NewBOButton>
        </Box>
      </Modal>
    </Box>
  );
};

export default ResetSection;
