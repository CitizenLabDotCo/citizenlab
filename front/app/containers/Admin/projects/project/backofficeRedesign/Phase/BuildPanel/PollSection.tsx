import React, { useState } from 'react';

import { Box, Divider, NewBOButton } from '@citizenlab/cl2-component-library';

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
      <Divider />
      <PanelField label={formatMessage(messages.pollQuestions)}>
        <NewBOButton
          buttonStyle="secondary-outlined"
          onClick={() => setOpened(true)}
        >
          {formatMessage(messages.addQuestions)}
        </NewBOButton>
      </PanelField>

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
