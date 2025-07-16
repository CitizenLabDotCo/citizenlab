import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';

import useFormSubmissionCount from 'api/submission_count/useSubmissionCount';

import { FormBuilderConfig } from 'components/FormBuilder/utils';
import Feedback from 'components/HookForm/Feedback';
import SuccessFeedback from 'components/HookForm/Feedback/SuccessFeedback';
import Error from 'components/UI/Error';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type FormStatusProps = {
  successMessageIsVisible: boolean;
  isSubmitting: boolean;
  setSuccessMessageIsVisible: (visible: boolean) => void;
  builderConfig: FormBuilderConfig;
  projectId: string;
  phaseId: string;
};

const FormStatus = ({
  successMessageIsVisible,
  isSubmitting,
  setSuccessMessageIsVisible,
  builderConfig: {
    formSavedSuccessMessage,
    getWarningNotice,
    getAccessRightsNotice,
  },
  projectId,
  phaseId,
}: FormStatusProps) => {
  const { data: submissionCount } = useFormSubmissionCount({
    phaseId,
  });
  const { formatMessage } = useIntl();
  const [accessRightsMessageIsVisible, setAccessRightsMessageIsVisible] =
    useState(true);
  const {
    formState: { errors, isDirty },
  } = useFormContext();

  const handleAccessRightsClose = () => setAccessRightsMessageIsVisible(false);

  if (!submissionCount) {
    return null;
  }

  const hasErrors = !!Object.keys(errors).length;
  const editedAndCorrect = !isSubmitting && isDirty && !hasErrors;
  const showSuccessMessage =
    successMessageIsVisible &&
    !editedAndCorrect &&
    Object.keys(errors).length === 0;
  const totalSubmissions = submissionCount.data.attributes.totalSubmissions;
  const showWarningNotice = totalSubmissions > 0;

  const showWarnings = () => {
    if (editedAndCorrect) {
      return (
        <Box mb="8px">
          <Warning>{formatMessage(messages.unsavedChanges)}</Warning>
        </Box>
      );
    } else if (showWarningNotice && getWarningNotice) {
      return getWarningNotice();
    } else if (
      !hasErrors &&
      !successMessageIsVisible &&
      getAccessRightsNotice &&
      accessRightsMessageIsVisible
    ) {
      return getAccessRightsNotice(projectId, phaseId, handleAccessRightsClose);
    }
    return null;
  };

  return (
    <>
      {hasErrors && (
        <Box mb="16px">
          <Error
            marginTop="8px"
            marginBottom="8px"
            text={formatMessage(
              errors['staleData']
                ? messages.staleDataErrorMessage
                : messages.errorMessage
            )}
            scrollIntoView={false}
          />
        </Box>
      )}

      <Feedback
        successMessage={formatMessage(formSavedSuccessMessage)}
        onlyShowErrors
      />
      {showSuccessMessage && (
        <SuccessFeedback
          successMessage={formatMessage(formSavedSuccessMessage)}
          closeSuccessMessage={() => setSuccessMessageIsVisible(false)}
        />
      )}
      {showWarnings()}
    </>
  );
};

export default FormStatus;
