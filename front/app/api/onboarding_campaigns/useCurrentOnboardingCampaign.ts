import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import onboardingCampaignsKeys from './keys';
import { OnboardingCampaignKeys, IOnboardingCampaign } from './types';

const fetchCurrentCampaign = () =>
  fetcher<IOnboardingCampaign>({
    path: `/onboarding_campaigns/current`,
    action: 'get',
  });

const useCurrentOnboardingCampaign = () => {
  return useQuery<
    IOnboardingCampaign,
    CLErrors,
    IOnboardingCampaign,
    OnboardingCampaignKeys
  >({
    queryKey: onboardingCampaignsKeys.all(),
    queryFn: () => fetchCurrentCampaign(),
  });
};

export default useCurrentOnboardingCampaign;
