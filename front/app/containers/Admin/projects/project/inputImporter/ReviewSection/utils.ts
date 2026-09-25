import { ParticipationMethod } from 'api/phases/types';

import { getMethodConfig } from 'utils/configs/participationMethodConfig';

import messages from './messages';

export const supportsNativeSurvey = (
  participationMethod?: ParticipationMethod
) => {
  switch (participationMethod) {
    case 'community_monitor_survey':
    case 'native_survey':
      return true;
    default:
      return false;
  }
};

export const isPDFUploadSupported = (
  participationMethod?: ParticipationMethod
) => {
  switch (participationMethod) {
    case 'community_monitor_survey':
      return false;
    default:
      return true;
  }
};

// Phases without an input manager (e.g. native surveys) show their
// approved responses in the Insights tab instead.
export const getApproveAllExplanationMessage = (
  participationMethod?: ParticipationMethod
) => {
  if (
    participationMethod &&
    !getMethodConfig(participationMethod).showInputManager
  ) {
    return messages.confirmApproveAllExplanationInsights;
  }
  return messages.confirmApproveAllExplanation;
};
