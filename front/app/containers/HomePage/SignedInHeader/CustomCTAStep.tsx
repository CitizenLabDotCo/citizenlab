import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import { HeaderContent, Left, Text, Right, AcceptButton } from './';
import T from 'components/T';

// services
import { OnboardingCampaignName } from 'services/onboardingCampaigns';

// style
import { useTheme } from 'styled-components';

// hooks
import useOnboardingCampaign from 'hooks/useOnboardingCampaign';
import OnboardingStep from './OnboardingStep';
import SkipButton from './SkipButton';

interface Props {
  activeOnboardingCampaignName: OnboardingCampaignName;
  onSkip: () => void;
}

const CustomCTAStep = ({ onSkip, activeOnboardingCampaignName }: Props) => {
  const theme = useTheme();
  const onboardingCampaign = useOnboardingCampaign();

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
            <SkipButton onSkip={onSkip} />
            <AcceptButton
              text={
                <T
                  value={onboardingCampaign.data.attributes.cta_button_multiloc}
                />
              }
              linkTo={onboardingCampaign.data.attributes.cta_button_link}
              buttonStyle="primary-inverse"
              textColor={theme.colors.tenantPrimary}
              textHoverColor={theme.colors.tenantPrimary}
              fontWeight="500"
            />
          </Right>
        </HeaderContent>
      </OnboardingStep>
    );
  }

  return null;
};

export default CustomCTAStep;
