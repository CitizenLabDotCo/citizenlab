import React, { useState } from 'react';

import { RouteType } from 'routes';

import usePhase from 'api/phases/usePhase';
import useFormSubmissionCount from 'api/submission_count/useSubmissionCount';
import { downloadSurveyResults } from 'api/survey_results/utils';

import useLocale from 'hooks/useLocale';

import EditWarningModal from 'components/admin/SurveyEditWarningModal';
import Button from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';

interface Props {
  projectId: string;
  phaseId: string;
}

const EditButtonWithWarningModal = ({ projectId, phaseId }: Props) => {
  const [showEditWarningModal, setShowEditWarningModal] = useState(false);
  const editFormLink: RouteType = `/admin/projects/${projectId}/phases/${phaseId}/native-survey/edit`;
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
      <Button
        mr="8px"
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
      </Button>
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
