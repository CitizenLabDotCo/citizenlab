import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import { HeaderContent, Left, Text, Right } from './';
import T from 'components/T';

// services
import { OnboardingCampaignName } from 'api/onboarding_campaigns/types';

// hooks
import useCurrentOnboardingCampaign from 'api/onboarding_campaigns/useCurrentOnboardingCampaign';
import OnboardingStep from './OnboardingStep';
import SkipButton from './SkipButton';
import AcceptButton from './AcceptButton';
import useLocalize from 'hooks/useLocalize';

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
            <Text>
              <T
                as="h2"
                value={onboardingCampaign.data.attributes.cta_message_multiloc}
                supportHtml
              />
            </Text>
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
