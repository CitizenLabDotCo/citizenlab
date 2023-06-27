import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { Multiloc } from 'typings';

export type OnboardingCampaignName =
  | 'complete_profile'
  | 'custom_cta'
  | 'default'
  | 'verification';

export const currentOnboardingCampaignsApiEndpoint = `${API_PATH}/onboarding_campaigns/current`;

export interface OnboardingCampaignAttributes {
  name: OnboardingCampaignName;
  cta_message_multiloc: Multiloc;
  cta_button_multiloc: Multiloc;
  cta_button_link: string;
}

export interface IOnboardingCampaign {
  data: {
    type: 'onboarding_campaign';
    attributes: OnboardingCampaignAttributes;
  };
}

export function currentOnboardingCampaignsStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<IOnboardingCampaign>({
    apiEndpoint: currentOnboardingCampaignsApiEndpoint,
    ...streamParams,
  });
}

export async function dismissOnboardingCampaign(name: OnboardingCampaignName) {
  const response = await streams.add<IOnboardingCampaign>(
    `${API_PATH}/onboarding_campaigns/${name}/dismissal`,
    {}
  );
  await streams.fetchAllWith({
    apiEndpoint: [currentOnboardingCampaignsApiEndpoint],
  });
  return response;
}
