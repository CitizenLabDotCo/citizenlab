import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import Avatar from 'components/Avatar';
import { Icon } from '@citizenlab/cl2-component-library';

// services
import { OnboardingCampaignName } from 'services/onboardingCampaigns';

// utils
import CSSTransition from 'react-transition-group/CSSTransition';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// style
import styled, { useTheme } from 'styled-components';
import { media, fontSizes, isRtl } from 'utils/styleUtils';

// hooks
import useAuthUser from 'hooks/useAuthUser';

const contentTimeout = 350;
const contentEasing = 'cubic-bezier(0.19, 1, 0.22, 1)';
const contentDelay = 550;

const HeaderContent = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  padding-bottom: 20px;
  padding-left: 75px;
  padding-right: 75px;
  overflow: hidden;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  &.content-enter {
    opacity: 0;

    &.content-enter-active {
      opacity: 1;
      transition: all ${contentTimeout}ms ${contentEasing} ${contentDelay}ms;
    }
  }

  &.content-enter-done {
    opacity: 1;
  }

  &.content-exit {
    opacity: 1;
    transition: all ${contentTimeout}ms ${contentEasing};

    &.content-exit-active {
      opacity: 0;
    }
  }

  &.content-exit-done {
    display: none;
  }

  h2 {
    color: #fff;
    font-size: ${fontSizes.xxl}px;
    line-height: 33px;
    font-weight: 400;
  }

  ${media.tablet`
    padding-left: 30px;
    padding-right: 30px;
  `}

  ${media.tablet`
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    padding-left: 15px;
  `}
`;

export const HeaderContentCompleteProfile = styled(HeaderContent)``;

export const Left = styled.div`
  display: flex;
  align-items: center;
  margin-right: 60px;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  ${media.tablet`
    margin-right: 0;
    flex-direction: column;
    align-items: flex-start;
  `}

  ${media.phone`
    align-items: center;
    margin-bottom: 30px;
  `}
`;

export const Icons = styled.div`
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

const CompleteProfileIcon = styled(Icon)`
  width: 48px;
  height: 48px;
  margin-left: -3px;
  margin-top: 3px;
  opacity: 0.5;
`;

export const Text = styled.div`
  ${isRtl`
    direction: rtl;
  `}

  ${media.phone`
    text-align: center;
  `}
`;

export const Right = styled.div`
  display: flex;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  ${media.phone`
    flex-direction: column;
  `}
`;

export const SkipButton = styled(Button)`
  margin-right: 10px;

  ${media.tablet`
    order: 2;
    margin-right: 0px;
  `}

  ${isRtl`
    margin-right: 0px;
    margin-left: 10px;
  `}
`;

export const AcceptButton = styled(Button)`
  ${media.tablet`
    order: 1;
    margin-right: 10px;
  `}

  ${media.phone`
    margin-bottom: 10px;
    margin-right: 0px;
  `}
`;

export const AvatarAndShield = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StyledAvatar = styled(Avatar)`
  margin-right: -3px;
  z-index: 2;
`;

interface Props {
  activeOnboardingCampaignName: OnboardingCampaignName;
  onSkip: () => void;
}

const ONBOARDING_CAMPAIGN_NAME = 'complete_profile';

const CompleteProfileStep = ({
  activeOnboardingCampaignName,
  onSkip,
}: Props) => {
  const authUser = useAuthUser();
  const theme = useTheme();

  if (!isNilOrError(authUser)) {
    return (
      <CSSTransition
        classNames="content"
        in={activeOnboardingCampaignName === ONBOARDING_CAMPAIGN_NAME}
        timeout={
          activeOnboardingCampaignName === ONBOARDING_CAMPAIGN_NAME
            ? contentTimeout + contentDelay
            : contentTimeout
        }
        mountOnEnter={true}
        unmountOnExit={true}
        enter={true}
        exit={true}
      >
        <HeaderContentCompleteProfile id="e2e-signed-in-header-complete-profile">
          <Left>
            <Icons>
              <StyledAvatar
                userId={authUser?.id}
                size={50}
                fillColor="#fff"
                padding={0}
                borderThickness={0}
              />
              <CompleteProfileIcon name="edit" fill="#fff" ariaHidden />
            </Icons>
            <Text>
              <FormattedMessage
                {...messages.completeYourProfile}
                tagName="h2"
                values={{ firstName: authUser.attributes.first_name }}
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
              className="e2e-signed-in-header-complete-skip-btn"
            />
            <AcceptButton
              text={<FormattedMessage {...messages.completeProfile} />}
              buttonStyle="primary-inverse"
              linkTo="/profile/edit"
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

export default CompleteProfileStep;
