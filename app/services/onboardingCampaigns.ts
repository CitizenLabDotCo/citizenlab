import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { Multiloc } from 'typings';

export type IOnboardingCampaigns = {
  name: 'complete_profile' | 'custom_cta' | 'default';
  cta_message_multiloc: Multiloc;
  cta_button_multiloc: Multiloc;
  cta_button_link: string;
};

export interface IOnboardingCampaignsData {
  data: {
    type: 'onboarding_status';
    attributes: IOnboardingCampaigns;
  };
}

export function currentOnboardingCampaignsStream(streamParams: IStreamParams | null = null) {
  return streams.get<IOnboardingCampaignsData>({ apiEndpoint: `${API_PATH}/onboarding_campaigns/current`, ...streamParams });
}
