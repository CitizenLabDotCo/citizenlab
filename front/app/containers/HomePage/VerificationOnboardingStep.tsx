import { Icon } from '@citizenlab/cl2-component-library';
import React from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';
import styled, { useTheme } from 'styled-components';
import { colors } from 'utils/styleUtils';
import { IUserData } from 'services/users';
import messages from './messages';
import {
  AcceptButton,
  AvatarAndShield,
  HeaderContentCompleteProfile,
  Icons,
  Left,
  Right,
  SkipButton,
  StyledAvatar,
  Text,
} from './SignedInHeader';

import { FormattedMessage } from 'utils/cl-intl';

const ShieldIcon = styled(Icon)`
  fill: ${colors.white};
  opacity: 0.5;
  width: 50px;
  height: 50px;
  margin-left: -3px;
`;

interface Props {
  verificationCampaignIsActive: boolean;
  contentTimeout: number;
  contentDelay: number;
  authUser: IUserData;
  onSkip: () => void;
  onAccept: () => void;
}

const VerificationOnboardingStep = ({
  onSkip,
  onAccept,
  verificationCampaignIsActive,
  authUser,
  contentTimeout,
  contentDelay,
}: Props) => {
  const theme = useTheme();

  return (
    <CSSTransition
      classNames="content"
      in={verificationCampaignIsActive}
      timeout={
        verificationCampaignIsActive
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
              <ShieldIcon name="shield-check" />
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
            onClick={onSkip}
            borderColor="#fff"
            textColor="#fff"
            fontWeight="500"
            className="e2e-signed-in-header-verification-skip-btn"
          />
          <AcceptButton
            text={<FormattedMessage {...messages.verifyNow} />}
            buttonStyle="primary-inverse"
            onClick={onAccept}
            textColor={theme.colors.tenantPrimary}
            textHoverColor={theme.colors.tenantPrimary}
            fontWeight="500"
            className="e2e-signed-in-header-accept-btn"
          />
        </Right>
      </HeaderContentCompleteProfile>
    </CSSTransition>
  );
};

export default VerificationOnboardingStep;
