import React from 'react';

import { Button, colors } from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  isEditing: boolean;
}

const SubmitButton = ({ isEditing }: Props) => {
  const { formatMessage } = useIntl();
  const {
    formState: { isSubmitting, isDirty },
  } = useFormContext();

  return (
    <Button
      type="submit"
      processing={isSubmitting}
      disabled={!isDirty}
      bgColor={colors.blue500}
      dataCy={isEditing ? 'e2e-save-project-page' : 'e2e-create-project-page'}
    >
      {isEditing
        ? formatMessage(messages.saveButton)
        : formatMessage(messages.createButton)}
    </Button>
  );
};

export default SubmitButton;
