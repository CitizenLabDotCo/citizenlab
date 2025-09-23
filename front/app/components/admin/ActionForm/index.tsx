import React from 'react';

import { ParticipationMethod } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';

import ActionFormDefault from './ActionFormDefault';
import ActionFormSurvey from './ActionFormSurvey';
import { Props } from './types';

const SURVEY_METHODS: ParticipationMethod[] = [
  'native_survey',
  'community_monitor_survey',
];

const ActionForm = ({ permissionData, phaseId, ...props }: Props) => {
  const { data: phase } = usePhase(phaseId);
  const participation_method = phase?.data.attributes.participation_method;

  if (!participation_method) return null;

  const { action } = permissionData.attributes;

  const showSurveyForm =
    SURVEY_METHODS.includes(participation_method) && action === 'posting_idea';

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
