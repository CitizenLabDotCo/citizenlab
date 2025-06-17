import React, { useState } from 'react';

import { RouteType } from 'routes';

import usePhase from 'api/phases/usePhase';
import useFormSubmissionCount from 'api/submission_count/useSubmissionCount';
import { downloadSurveyResults } from 'api/survey_results/utils';

import useLocale from 'hooks/useLocale';

import EditWarningModal from 'components/admin/SurveyEditWarningModal';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';

interface Props {
  phaseId: string;
  editFormLink: RouteType;
}

const EditButtonWithWarningModal = ({ phaseId, editFormLink }: Props) => {
  const [showEditWarningModal, setShowEditWarningModal] = useState(false);
  const locale = useLocale();
  const { data: phase } = usePhase(phaseId);
  const { data: submissionCount } = useFormSubmissionCount({
    phaseId,
  });

  if (!phase || !submissionCount) {
    return null;
  }

  const handleDownloadResults = async () => {
    try {
      await downloadSurveyResults(locale, phase.data);
    } catch (error) {
      // Not handling errors for now
    }
  };

  return (
    <>
      <ButtonWithLink
        onClick={() => {
          submissionCount.data.attributes.totalSubmissions > 0
            ? setShowEditWarningModal(true)
            : clHistory.push(editFormLink);
        }}
        width="auto"
        icon="edit"
        data-cy="e2e-edit-survey-form"
      >
        <FormattedMessage {...messages.editSurveyForm} />
      </ButtonWithLink>
      <EditWarningModal
        showEditWarningModal={showEditWarningModal}
        setShowEditWarningModal={setShowEditWarningModal}
        editFormLink={editFormLink}
        handleDownloadResults={handleDownloadResults}
      />
    </>
  );
};

export default EditButtonWithWarningModal;
