import React, { useState } from 'react';

import { Button } from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';
import { useTheme } from 'styled-components';

import usePhase from 'api/phases/usePhase';
import useSubmissionCount from 'api/submission_count/useSubmissionCount';

import { FormattedMessage } from 'utils/cl-intl';

import CopySurveyModal from '../nativeSurvey/CopySurveyModal';

import messages from './messages';

interface Props {
  phaseId: string;
  editFormLink: RouteType;
}

const DuplicateSurveyButtonWithModal = ({ phaseId, editFormLink }: Props) => {
  const theme = useTheme();
  const { data: submissionCount } = useSubmissionCount({
    phaseId,
  });
  const { data: phase } = usePhase(phaseId);
  const [showCopySurveyModal, setShowCopySurveyModal] = useState(false);

  if (!phase || !submissionCount) {
    return null;
  }

  const surveyFormPersisted =
    phase.data.attributes.custom_form_persisted || false;
  const haveSubmissionsComeIn =
    submissionCount.data.attributes.totalSubmissions > 0;

  return (
    <>
      <Button
        onClick={() => {
          setShowCopySurveyModal(true);
        }}
        icon="copy"
        disabled={haveSubmissionsComeIn}
        iconColor={theme.colors.blue500}
        buttonStyle="text"
        textColor={theme.colors.blue500}
      >
        <FormattedMessage {...messages.duplicateAnotherSurvey1} />
      </Button>
      <CopySurveyModal
        editFormLink={editFormLink}
        showCopySurveyModal={showCopySurveyModal}
        setShowCopySurveyModal={setShowCopySurveyModal}
        surveyFormPersisted={surveyFormPersisted}
      />
    </>
  );
};

export default DuplicateSurveyButtonWithModal;
