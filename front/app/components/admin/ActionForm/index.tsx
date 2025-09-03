import React from 'react';

import usePhase from 'api/phases/usePhase';

import ActionFormDefault from './ActionFormDefault';
import ActionFormSurvey from './ActionFormSurvey';
import { Props } from './types';

const ActionForm = ({ permissionData, phaseId, ...props }: Props) => {
  const { data: phase } = usePhase(phaseId);
  const participation_method = phase?.data.attributes.participation_method;

  if (!participation_method) return null;

  const { action } = permissionData.attributes;

  const showSurveyForm =
    (participation_method === 'native_survey' ||
      participation_method === 'community_monitor_survey') &&
    action === 'posting_idea';

  if (showSurveyForm) {
    return (
      <ActionFormSurvey
        permissionData={permissionData}
        phaseId={phaseId}
        {...props}
      />
    );
  }

  return (
    <ActionFormDefault
      permissionData={permissionData}
      phaseId={phaseId}
      {...props}
    />
  );
};

export default ActionForm;
