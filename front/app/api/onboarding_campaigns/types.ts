import { Keys } from 'utils/cl-react-query/types';
import onboardingCampaignKeys from './keys';

import { Multiloc } from 'typings';

export type OnboardingCampaignKeys = Keys<typeof onboardingCampaignKeys>;

export type OnboardingCampaignName =
  | 'complete_profile'
  | 'custom_cta'
  | 'default'
  | 'verification';

export interface OnboardingCampaignAttributes {
  name: OnboardingCampaignName;
  cta_message_multiloc: Multiloc | null;
  cta_button_multiloc: Multiloc | null;
  cta_button_link: string | null;
}

export interface IOnboardingCampaign {
  data: {
    type: 'onboarding_campaign';
    id: string;
    attributes: OnboardingCampaignAttributes;
  };
}
