import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { Multiloc } from 'typings';

const apiEndpoint = `${API_PATH}/onboarding_status`;

export type IOnboardingStatus = ICustomCta | ICompleteProfileStatus | IDefaultCta;

interface ICompleteProfileStatus {
  status: 'complete_profile';
  cta_message_multiloc: null;
  cta_button_multiloc: null;
  cta_button_link: null;
}

interface ICustomCta {
  cta_message_multiloc: Multiloc;
  cta_button_multiloc: Multiloc;
  cta_button_link: string;
  status: 'custom_cta';
}
interface IDefaultCta {
  cta_message_multiloc: Multiloc;
  cta_button_multiloc: null;
  cta_button_link: null;
  status: 'default';
}

export interface IOnboardingStatusData {
  data: {
    type: 'onboarding_status';
    attributes: IOnboardingStatus;
  };
}

export function onboardingStatusStream(streamParams: IStreamParams | null = null) {
  return streams.get<IOnboardingStatusData>({ apiEndpoint, ...streamParams });
}
