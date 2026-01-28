import React from 'react';

import { ParticipationMethod } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';

import useFeatureFlag from 'hooks/useFeatureFlag';

import ActionFormDefault from './ActionFormDefault';
import ActionFormIdeation from './ActionFormIdeation';
import ActionFormSurvey from './ActionFormSurvey';
import { Props } from './types';

const SURVEY_METHODS: ParticipationMethod[] = [
  'native_survey',
  'community_monitor_survey',
];

const ActionForm = ({ permissionData, phaseId, ...props }: Props) => {
  const { data: phase } = usePhase(phaseId);
  const participation_method = phase?.data.attributes.participation_method;
  const ideationAccountlessPostingEnabled = useFeatureFlag({
    name: 'ideation_accountless_posting',
  });

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

  const showIdeationForm =
    participation_method === 'ideation' && action === 'posting_idea';

  if (showIdeationForm) {
    return (
      <ActionFormIdeation
        permissionData={permissionData}
        phaseId={phaseId}
        {...props}
      />
    );
  }

  const showAnyone =
    ideationAccountlessPostingEnabled &&
    ['ideation', 'proposals'].includes(participation_method) &&
    action === 'posting_idea';

  return (
    <ActionFormDefault
      permissionData={permissionData}
      phaseId={phaseId}
      showAnyone={showAnyone}
      {...props}
    />
  );
};

export default ActionForm;
