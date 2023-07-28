import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'onboarding_campaign',
};

const onboardingCampaignsKeys = {
  all: () => [baseKey],
} satisfies QueryKeys;

export default onboardingCampaignsKeys;
