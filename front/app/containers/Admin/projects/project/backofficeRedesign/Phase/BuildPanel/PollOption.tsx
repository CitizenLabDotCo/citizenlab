import React, { useState } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import usePollQuestions from 'api/poll_questions/usePollQuestions';

import SummaryPill from 'containers/Admin/projects/_shared/components/SummaryPill';
import PollAdminForm from 'containers/Admin/projects/project/poll/PollAdminForm';

import actionFormMessages from 'components/admin/ActionForm/messages';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

import ChoiceRadio from './ChoiceRadio';

interface Props {
  phaseId: string;
  name: string;
  title: string;
  description: string;
}

const PollOption = ({ phaseId, name, title, description }: Props) => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);
  const { data: pollQuestions } = usePollQuestions({ phaseId });

  const nQuestions = pollQuestions?.data.length ?? 0;
  const hasQuestions = nQuestions > 0;

  return (
    <Box display="flex" flexDirection="column" gap="12px">
      <ChoiceRadio
        name={name}
        value="poll"
        currentValue="poll"
        title={title}
        titleAdornment={
          hasQuestions && (
            <SummaryPill
              active
              label={formatMessage(actionFormMessages.nQuestions, {
                nQuestions,
              })}
            />
          )
        }
        description={description}
        onChange={() => {}}
      />
      {pollQuestions && (
        <Button
          buttonStyle="bo-secondary"
          boSize="medium"
          width="100%"
          onClick={() => setOpened(true)}
        >
          {formatMessage(messages.addQuestions)}
        </Button>
      )}
      <Modal
        opened={opened}
        close={() => setOpened(false)}
        width={900}
        variant="bo"
        header={formatMessage(messages.pollQuestions)}
      >
        <Box p="24px">
          <PollAdminForm
            variant="bo"
            phaseId={phaseId}
            pollQuestions={pollQuestions?.data}
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default PollOption;
