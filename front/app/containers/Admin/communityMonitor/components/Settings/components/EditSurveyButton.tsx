import React from 'react';

import { Button } from '@citizenlab/cl2-component-library';

import clHistory from 'utils/cl-router/history';

type Props = {
  projectId?: string;
  phaseId?: string;
  haveSubmissionsComeIn: boolean;
  setShowEditWarningModal: (show: boolean) => void;
};

const EditSurveyButton = ({
  projectId,
  phaseId,
  setShowEditWarningModal,
  haveSubmissionsComeIn,
}: Props) => {
  return (
    <Button
      icon="edit"
      iconSize="20px"
      buttonStyle="admin-dark"
      width="auto"
      onClick={() => {
        haveSubmissionsComeIn
          ? setShowEditWarningModal(true)
          : clHistory.push(
              `/admin/community-monitor/projects/${projectId}/phases/${phaseId}/survey/edit`
            );
      }}
      data-cy="e2e-edit-survey-content"
    >
      Edit survey
    </Button>
  );
};

export default EditSurveyButton;
