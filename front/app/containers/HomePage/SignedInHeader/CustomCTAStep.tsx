import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import { HeaderContent, Left, Text, Right } from './';
import T from 'components/T';

// services
import { OnboardingCampaignName } from 'services/onboardingCampaigns';

// hooks
import useOnboardingCampaign from 'hooks/useOnboardingCampaign';
import OnboardingStep from './OnboardingStep';
import SkipButton from './SkipButton';
import AcceptButton from './AcceptButton';
import useLocalize from 'hooks/useLocalize';

interface Props {
  activeOnboardingCampaignName: OnboardingCampaignName;
  onSkip: () => void;
}

const CustomCTAStep = ({ onSkip, activeOnboardingCampaignName }: Props) => {
  const onboardingCampaign = useOnboardingCampaign();
  const localize = useLocalize();

  if (!isNilOrError(onboardingCampaign)) {
    return (
      <OnboardingStep
        isIncomingStep={activeOnboardingCampaignName === 'custom_cta'}
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
