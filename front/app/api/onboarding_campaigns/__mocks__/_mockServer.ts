import { http, HttpResponse } from 'msw';
import { IOnboardingCampaign } from '../types';

export const apiPath = '*/onboarding_campaigns/current';

export const data: IOnboardingCampaign = {
  data: {
    id: 'b869202f-7259-4d60-a5c2-266791f50b0d',
    type: 'onboarding_campaign',
    attributes: {
      name: 'verification',
      cta_message_multiloc: null,
      cta_button_multiloc: null,
      cta_button_link: null,
    },
  },
};

const endpoints = {
  'GET onboarding_campaigns/current': http.get(apiPath, () => {
    return HttpResponse.json({ data }, { status: 200 });
  }),
};

export default endpoints;
