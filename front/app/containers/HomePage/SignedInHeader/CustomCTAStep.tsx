import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import { HeaderContent, Left, Text, Right } from './';
import T from 'components/T';

// services
import { OnboardingCampaignName } from 'services/onboardingCampaigns';

// hooks
import useCurrentOnboardingCampaign from 'hooks/useCurrentOnboardingCampaign';
import OnboardingStep from './OnboardingStep';
import SkipButton from './SkipButton';
import AcceptButton from './AcceptButton';
import useLocalize from 'hooks/useLocalize';

interface Props {
  currentOnboardingCampaignName: OnboardingCampaignName;
  onSkip: () => void;
}

const CustomCTAStep = ({ onSkip, currentOnboardingCampaignName }: Props) => {
  const onboardingCampaign = useCurrentOnboardingCampaign();
  const localize = useLocalize();

  if (!isNilOrError(onboardingCampaign)) {
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
            <AcceptButton
              text={localize(
                onboardingCampaign.data.attributes.cta_button_multiloc
              )}
              linkTo={onboardingCampaign.data.attributes.cta_button_link}
            />
          </Right>
        </HeaderContent>
      </OnboardingStep>
    );
  }

  return null;
};

export default CustomCTAStep;
