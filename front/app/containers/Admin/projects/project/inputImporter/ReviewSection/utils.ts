import { ParticipationMethod } from 'api/phases/types';

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
