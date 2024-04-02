import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import onboardingCampaignsKeys from './keys';
import { IOnboardingCampaign, OnboardingCampaignName } from './types';

const dismissCampaign = async (name: OnboardingCampaignName) =>
  fetcher<IOnboardingCampaign>({
    path: `/onboarding_campaigns/${name}/dismissal`,
    action: 'post',
    body: {},
  });

const useDismissOnboardingCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation<IOnboardingCampaign, CLErrors, OnboardingCampaignName>({
    mutationFn: dismissCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: onboardingCampaignsKeys.all(),
      });
    },
  });
};

export default useDismissOnboardingCampaign;
