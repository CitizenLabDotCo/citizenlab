import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import Avatar from 'components/Avatar';
import CompleteProfileStep from './CompleteProfileStep';
import VerificationOnboardingStep from '../VerificationOnboardingStep';
import CustomCTAStep from './CustomCTAStep';
import FallbackStep from './FallbackStep';
import HeaderImage from './HeaderImage';

// services
import {
  dismissOnboardingCampaign,
  OnboardingCampaignName,
} from 'services/onboardingCampaigns';

// utils
import { openVerificationModal } from 'events/verificationModal';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';

// style
import styled from 'styled-components';
import { media, fontSizes, isRtl } from 'utils/styleUtils';

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useOnboardingCampaign from 'hooks/useOnboardingCampaign';

const contentTimeout = 350;
const contentEasing = 'cubic-bezier(0.19, 1, 0.22, 1)';
const contentDelay = 550;

const Header = styled.div`
  width: 100%;
  height: 190px;
  position: relative;
  display: flex;
  flex-direction: column;

  ${media.tablet`
    height: 320px;
  `}

  ${media.phone`
    height: 400px;
  `}
`;

export const HeaderContent = styled.div`
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
  className?: string;
}

const SignedInHeader = ({ className }: Props) => {
  const authUser = useAuthUser();
  const onboardingCampaign = useOnboardingCampaign();

  const handleSkip = (name: OnboardingCampaignName) => () => {
    trackEventByName(tracks.clickSkipButton, {
      extra: { location: 'signed-in header', context: name },
    });
    dismissOnboardingCampaign(name);
  };

  const handleAccept = (name: OnboardingCampaignName) => () => {
    if (name === 'verification') {
      openVerificationModal();
    }
  };

  if (!isNilOrError(authUser) && !isNilOrError(onboardingCampaign)) {
    const onboardingCampaignName = onboardingCampaign.data.attributes.name;

    return (
      <Header className={`e2e-signed-in-header ${className}`} id="hook-header">
        <HeaderImage />

        <VerificationOnboardingStep
          verificationCampaignIsActive={
            onboardingCampaignName === 'verification'
          }
          contentTimeout={contentTimeout}
          contentDelay={contentDelay}
          authUser={authUser}
          onSkip={handleSkip(onboardingCampaignName)}
          onAccept={handleAccept(onboardingCampaignName)}
        />
        <CompleteProfileStep
          activeOnboardingCampaignName={onboardingCampaignName}
          onSkip={handleSkip('complete_profile')}
        />
        <CustomCTAStep
          activeOnboardingCampaignName={onboardingCampaignName}
          onSkip={handleSkip('custom_cta')}
        />
        <FallbackStep activeOnboardingCampaignName={onboardingCampaignName} />
      </Header>
    );
  }

  return null;
};

export default SignedInHeader;
