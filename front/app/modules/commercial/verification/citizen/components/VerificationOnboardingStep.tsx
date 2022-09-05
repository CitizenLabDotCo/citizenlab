import React from 'react';
import { Icon } from '@citizenlab/cl2-component-library';
import { colors } from 'utils/styleUtils';
import CSSTransition from 'react-transition-group/CSSTransition';
import styled from 'styled-components';

import {
  HeaderContentCompleteProfile,
  Left,
  Right,
  Text,
  Icons,
  AvatarAndShield,
  AcceptButton,
  SkipButton,
  StyledAvatar,
} from 'containers/LandingPage/SignedInHeader';
import messages from 'containers/LandingPage/messages';

import { FormattedMessage } from 'utils/cl-intl';

const ShieldIcon = styled(Icon)`
  fill: ${colors.label};
  width: 50px;
  height: 56px;
  margin-left: -3px;
`;

const VerificationOnboardingStep = ({
  onSkip,
  onAccept,
  onboardingCampaigns,
  authUser,
  contentTimeout,
  contentDelay,
  theme,
}) => {
  const handleSkip = () => onSkip(onboardingCampaigns.name)();
  const handleAccept = () => onAccept(onboardingCampaigns.name);

  return (
    <CSSTransition
      classNames="content"
      in={onboardingCampaigns.name === 'verification'}
      timeout={
        onboardingCampaigns.name === 'verification'
          ? contentTimeout + contentDelay
          : contentTimeout
      }
      mountOnEnter={true}
      unmountOnExit={true}
      enter={true}
      exit={true}
    >
      <HeaderContentCompleteProfile id="e2e-signed-in-header-verification">
        <Left>
          <Icons>
            <AvatarAndShield aria-hidden>
              <StyledAvatar
                userId={authUser?.id}
                size={50}
                fillColor="#fff"
                padding={0}
                borderThickness={0}
              />
              <ShieldIcon name="verify_light" />
            </AvatarAndShield>
          </Icons>
          <Text>
            <FormattedMessage {...messages.verifyYourIdentity} tagName="h2" />
          </Text>
        </Left>

        <Right>
          <SkipButton
            buttonStyle="primary-outlined"
            text={<FormattedMessage {...messages.doItLater} />}
            onClick={handleSkip}
            borderColor="#fff"
            textColor="#fff"
            fontWeight="500"
            className="e2e-signed-in-header-verification-skip-btn"
          />
          <AcceptButton
            text={<FormattedMessage {...messages.verifyNow} />}
            buttonStyle="primary-inverse"
            onClick={handleAccept}
            textColor={theme.colorMain}
            textHoverColor={theme.colorMain}
            fontWeight="500"
            className="e2e-signed-in-header-accept-btn"
          />
        </Right>
      </HeaderContentCompleteProfile>
    </CSSTransition>
  );
};

export default VerificationOnboardingStep;
