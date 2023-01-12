import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { Multiloc } from 'typings';

export type OnboardingCampaignName = 'default';

export const currentOnboardingCampaignsApiEndpoint = `${API_PATH}/onboarding_campaigns/current`;

export interface OnboardingCampaignAttributes {
  name: OnboardingCampaignName;
  cta_message_multiloc: Multiloc;
  cta_button_multiloc: Multiloc;
  cta_button_link: string;
}

export interface OnboardingCampaignData {
  data: {
    type: 'onboarding_status';
    attributes: OnboardingCampaignAttributes;
  };
}

export function currentOnboardingCampaignsStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<OnboardingCampaignData>({
    apiEndpoint: currentOnboardingCampaignsApiEndpoint,
    ...streamParams,
  });
}
