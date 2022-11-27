import React from 'react';
import Avatar from 'components/Avatar';
import { Icon } from '@citizenlab/cl2-component-library';
import CSSTransition from 'react-transition-group/CSSTransition';
import styled, { useTheme } from 'styled-components';
import messages from '../messages';
import {
  AcceptButton,
  HeaderContentCompleteProfile,
  Left,
  Right,
  SkipButton,
  Text,
  contentDelay,
  contentTimeout,
} from '.';
import { OnboardingCampaignName } from 'services/onboardingCampaigns';
import { FormattedMessage } from 'utils/cl-intl';
import useAuthUser from 'hooks/useAuthUser';
import { isNilOrError } from 'utils/helperUtils';
import { openVerificationModal } from 'events/verificationModal';
import { colors, media, isRtl } from 'utils/styleUtils';

const ShieldIcon = styled(Icon)`
  fill: ${colors.white};
  opacity: 0.5;
  width: 50px;
  height: 50px;
  margin-left: -3px;
`;

const AvatarAndShield = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledAvatar = styled(Avatar)`
  margin-right: -3px;
  z-index: 2;
`;

const Icons = styled.div`
  display: flex;
  margin-right: 30px;

  ${isRtl`
    margin-right: 0px;
    margin-left: 30px;
  `}

  ${media.phone`
    margin-right: 0;
  `}
`;

interface Props {
  activeOnboardingCampaignName: OnboardingCampaignName;
  onSkip: () => void;
}

const VerificationOnboardingStep = ({
  onSkip,
  activeOnboardingCampaignName,
}: Props) => {
  const theme = useTheme();
  const authUser = useAuthUser();

  const onAccept = () => {
    openVerificationModal();
  };

  if (!isNilOrError(authUser)) {
    return (
      <CSSTransition
        classNames="content"
        in={activeOnboardingCampaignName === 'verification'}
        timeout={
          activeOnboardingCampaignName === 'verification'
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
                  userId={authUser.id}
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
  }

  return null;
};

export default VerificationOnboardingStep;
