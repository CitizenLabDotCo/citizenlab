import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import { HeaderContent, Left, Text, Right, AcceptButton, SkipButton } from './';
import T from 'components/T';

// services
import { OnboardingCampaignName } from 'services/onboardingCampaigns';

// utils
import CSSTransition from 'react-transition-group/CSSTransition';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// style
import { useTheme } from 'styled-components';

// hooks
import useOnboardingCampaign from 'hooks/useOnboardingCampaign';

const contentTimeout = 350;
const contentDelay = 550;

interface Props {
  activeOnboardingCampaignName: OnboardingCampaignName;
  onSkip: () => void;
}

const CustomCTAStep = ({ activeOnboardingCampaignName, onSkip }: Props) => {
  const theme = useTheme();
  const onboardingCampaign = useOnboardingCampaign();

  if (!isNilOrError(onboardingCampaign)) {
    return (
      <CSSTransition
        classNames="content"
        in={activeOnboardingCampaignName === 'custom_cta'}
        timeout={
          activeOnboardingCampaignName === 'custom_cta'
            ? contentTimeout + contentDelay
            : contentTimeout
        }
        mountOnEnter={true}
        unmountOnExit={true}
        enter={true}
        exit={true}
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
            <SkipButton
              buttonStyle="primary-outlined"
              text={<FormattedMessage {...messages.doItLater} />}
              onClick={onSkip}
              borderColor="#fff"
              textColor="#fff"
              fontWeight="500"
            />
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
      </CSSTransition>
    );
  }

  return null;
};

export default CustomCTAStep;
