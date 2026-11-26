import React, { ReactNode } from 'react';

import Button from 'design-system/Button';

import styles from '../commentsPanel.module.css';
import 'design-system/tokens.css';

export interface PanelFormButtonsProps {
  cancelLabel: ReactNode;
  submitLabel: ReactNode;
  onCancel: () => void;
  // Without onSubmit the submit button submits the surrounding form.
  onSubmit?: () => void;
  processing: boolean;
  isCancelDisabled?: boolean;
  isSubmitDisabled?: boolean;
  submitId?: string;
}

// Cancel and submit of a comment form in the panel look.
const PanelFormButtons = ({
  cancelLabel,
  submitLabel,
  onCancel,
  onSubmit,
  processing,
  isCancelDisabled,
  isSubmitDisabled,
  submitId,
}: PanelFormButtonsProps) => (
  <div className={styles.buttons}>
    <Button
      variant="secondary"
      size={28}
      isDisabled={isCancelDisabled}
      onPress={onCancel}
    >
      {cancelLabel}
    </Button>
    <Button
      variant="primary"
      size={28}
      type={onSubmit ? 'button' : 'submit'}
      id={submitId}
      isPending={processing}
      isDisabled={isSubmitDisabled}
      onPress={onSubmit}
    >
      {submitLabel}
    </Button>
  </div>
);

export default PanelFormButtons;
