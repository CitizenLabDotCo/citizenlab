import { ParticipationMethod } from 'api/phases/types';

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

export const getApproveAllExplanationMessage = (
  participationMethod?: ParticipationMethod
) => {
  switch (participationMethod) {
    case 'native_survey':
      return messages.confirmApproveAllExplanationInsights;
    case 'community_monitor_survey':
      return messages.confirmApproveAllExplanationCommunityMonitor;
    default:
      return messages.confirmApproveAllExplanation;
  }
};
