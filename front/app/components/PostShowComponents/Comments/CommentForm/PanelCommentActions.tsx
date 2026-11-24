import React from 'react';

import Checkbox from 'design-system/Checkbox';
import IconButton from 'design-system/IconButton';

import { useIntl } from 'utils/cl-intl';

import styles from '../commentsPanel.module.css';
import messages from '../messages';

import PanelFormButtons from './PanelFormButtons';

interface Props {
  processing: boolean;
  postAnonymously: boolean;
  allowAnonymousParticipation?: boolean;
  submitButtonDisabled: boolean;
  submitLabel: string;
  togglePostAnonymously: (postAnonymously: boolean) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const PanelCommentActions = ({
  processing,
  postAnonymously,
  allowAnonymousParticipation,
  submitButtonDisabled,
  submitLabel,
  togglePostAnonymously,
  onSubmit,
  onCancel,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <div className={styles.formFooter}>
      {allowAnonymousParticipation && (
        <div className={styles.anonymous}>
          <Checkbox
            isSelected={postAnonymously}
            onChange={togglePostAnonymously}
            data-cy="e2e-post-comment-anonymously-checkbox"
          >
            {formatMessage(messages.postAnonymously)}
          </Checkbox>
          <IconButton
            icon="info-16"
            size={24}
            aria-label={formatMessage(messages.inputsAssociatedWithProfile)}
          />
        </div>
      )}
      <PanelFormButtons
        cancelLabel={formatMessage(messages.cancel)}
        submitLabel={submitLabel}
        onCancel={onCancel}
        onSubmit={onSubmit}
        processing={processing}
        isCancelDisabled={processing}
        isSubmitDisabled={submitButtonDisabled}
        submitId="e2e-submit-comment-btn"
      />
    </div>
  );
};

export default PanelCommentActions;
