import React from 'react';

import { H2 } from '@citizenlab/cl2-component-library';

import { OnboardingCampaignName } from 'api/onboarding_campaigns/types';
import useCurrentOnboardingCampaign from 'api/onboarding_campaigns/useCurrentOnboardingCampaign';

import useLocalize from 'hooks/useLocalize';

import T from 'components/T';

import { isNilOrError } from 'utils/helperUtils';

import AcceptButton from './AcceptButton';
import OnboardingStep from './OnboardingStep';
import { HeaderContent, Left, Right } from './Shared';
import SkipButton from './SkipButton';

interface Props {
  currentOnboardingCampaignName: OnboardingCampaignName;
  onSkip: () => void;
}

const CustomCTAStep = ({ onSkip, currentOnboardingCampaignName }: Props) => {
  const { data: onboardingCampaign } = useCurrentOnboardingCampaign();
  const localize = useLocalize();

  if (!isNilOrError(onboardingCampaign)) {
    const ctaButtonLink = onboardingCampaign.data.attributes.cta_button_link;
    return (
      <OnboardingStep
        isIncomingStep={currentOnboardingCampaignName === 'custom_cta'}
      >
        <HeaderContent id="e2e-signed-in-header-custom-cta">
          <Left>
            <H2 m="0">
              <T
                value={onboardingCampaign.data.attributes.cta_message_multiloc}
                supportHtml
              />
            </H2>
          </Left>

          <Right>
            <SkipButton onClick={onSkip} />
            {ctaButtonLink && (
              <AcceptButton
                text={localize(
                  onboardingCampaign.data.attributes.cta_button_multiloc
                )}
                linkTo={ctaButtonLink}
              />
            )}
          </Right>
        </HeaderContent>
      </OnboardingStep>
    );
  }

  return null;
};

export default CustomCTAStep;
