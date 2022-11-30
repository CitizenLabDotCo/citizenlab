import { useState, useEffect } from 'react';
import {
  currentOnboardingCampaignsStream,
  OnboardingCampaignData,
} from 'services/onboardingCampaigns';

export default function useCurrentOnboardingCampaign() {
  const [onboardingCampaign, setOnboardingCampaign] =
    useState<OnboardingCampaignData | null>(null);

  useEffect(() => {
    const observable = currentOnboardingCampaignsStream().observable;

    const subscription = observable.subscribe((response) => {
      setOnboardingCampaign(response);
    });

    return () => subscription.unsubscribe();
  }, []);

  return onboardingCampaign;
}
