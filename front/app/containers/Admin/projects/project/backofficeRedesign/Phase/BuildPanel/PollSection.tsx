import React, { useState } from 'react';

import { Box, Button, bo } from '@citizenlab/cl2-component-library';

import usePollQuestions from 'api/poll_questions/usePollQuestions';

import PollAdminForm from 'containers/Admin/projects/project/poll/PollAdminForm';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

import PanelField from './PanelField';

interface Props {
  phaseId: string;
}

const PollSection = ({ phaseId }: Props) => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);
  const { data: pollQuestions } = usePollQuestions({ phaseId });

  return (
    <>
      <PanelField
        label={formatMessage(messages.pollQuestions)}
        action={
          <Button
            buttonStyle="bo-secondary"
            height={bo.buttonMedium.height}
            padding={bo.buttonMedium.padding}
            fontSize={bo.buttonMedium.fontSize}
            width="auto"
            onClick={() => setOpened(true)}
          >
            {formatMessage(messages.addQuestions)}
          </Button>
        }
      />

      <Modal
        opened={opened}
        close={() => setOpened(false)}
        width={900}
        header={formatMessage(messages.pollQuestions)}
      >
        <Box p="24px">
          <PollAdminForm
            phaseId={phaseId}
            pollQuestions={pollQuestions?.data}
          />
        </Box>
      </Modal>
    </>
  );
};

export default PollSection;
