import { API_PATH } from 'containers/App/constants';
import { Multiloc } from 'typings';
import streams, { IStreamParams } from 'utils/streams';

export type IOnboardingCampaignNames =
  | 'complete_profile'
  | 'custom_cta'
  | 'default'
  | 'verification';
export const currentOnboardingCampaignsApiEndpoint = `${API_PATH}/onboarding_campaigns/current`;

export type IOnboardingCampaigns = {
  name: IOnboardingCampaignNames;
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

export function currentOnboardingCampaignsStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<IOnboardingCampaignsData>({
    apiEndpoint: currentOnboardingCampaignsApiEndpoint,
    ...streamParams,
  });
}

export async function dismissOnboardingCampaign(
  name: IOnboardingCampaignNames
) {
  const response = await streams.add<IOnboardingCampaignsData>(
    `${API_PATH}/onboarding_campaigns/${name}/dismissal`,
    {}
  );
  await streams.fetchAllWith({
    apiEndpoint: [currentOnboardingCampaignsApiEndpoint],
  });
  return response;
}
