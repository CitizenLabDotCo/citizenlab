import React, { useState } from 'react';

import Button from 'design-system/Button';
import Modal from 'design-system/Modal';

import usePollQuestions from 'api/poll_questions/usePollQuestions';

import ChoiceRadio from 'containers/Admin/projects/_shared/components/ChoiceRadio';
import SummaryPill from 'containers/Admin/projects/_shared/components/SummaryPill';
import PollAdminForm from 'containers/Admin/projects/project/poll/PollAdminForm';

import actionFormMessages from 'components/admin/ActionForm/messages';

import { useIntl } from 'utils/cl-intl';

import methodSectionMessages from './BuildFields/MethodSection/messages';
import styles from './BuildPanel.module.css';

interface Props {
  phaseId: string;
  title: string;
  description: string;
}

const PollOption = ({ phaseId, title, description }: Props) => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);
  const { data: pollQuestions } = usePollQuestions({ phaseId });

  const nQuestions = pollQuestions?.data.length ?? 0;
  const hasQuestions = nQuestions > 0;

  return (
    <div className={styles.option}>
      <ChoiceRadio
        value="poll"
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
      />
      {pollQuestions && (
        <Button fullWidth variant="secondary" onPress={() => setOpened(true)}>
          {formatMessage(methodSectionMessages.addQuestions)}
        </Button>
      )}
      <Modal
        isOpen={opened}
        onOpenChange={setOpened}
        size={920}
        title={formatMessage(methodSectionMessages.pollQuestions)}
      >
        <PollAdminForm
          variant="panel"
          phaseId={phaseId}
          pollQuestions={pollQuestions?.data}
        />
      </Modal>
    </div>
  );
};

export default PollOption;
