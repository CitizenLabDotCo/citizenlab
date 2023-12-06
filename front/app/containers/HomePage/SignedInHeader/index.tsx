import React, { lazy, Suspense } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
const CompleteProfileStep = lazy(() => import('./CompleteProfileStep'));
const VerificationOnboardingStep = lazy(
  () => import('./VerificationOnboardingStep')
);
const CustomCTAStep = lazy(() => import('./CustomCTAStep'));
const FallbackStep = lazy(() => import('./FallbackStep'));
import HeaderImage from './HeaderImage';
import Avatar from 'components/Avatar';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';

// style
import styled from 'styled-components';
import { media, fontSizes, isRtl } from 'utils/styleUtils';

// hooks
import useCurrentOnboardingCampaign from 'api/onboarding_campaigns/useCurrentOnboardingCampaign';
import useDismissOnboardingCampaign from 'api/onboarding_campaigns/useDismissOnboardingCampaign';
import { OnboardingCampaignName } from 'api/onboarding_campaigns/types';
import { IHomepageSettingsAttributes } from 'api/home_page/types';

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
    padding-right: 15px;
  `}
`;

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

export const StyledAvatar = styled(Avatar)`
  margin-right: -3px;
  z-index: 2;
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

const SignedInHeader = ({
  homepageSettings,
  isContentBuilderDisplay,
}: {
  homepageSettings: Partial<IHomepageSettingsAttributes>;
  isContentBuilderDisplay?: boolean;
}) => {
  const { data: currentOnboardingCampaign } = useCurrentOnboardingCampaign();
  const { mutate: dismissOnboardingCampaign } = useDismissOnboardingCampaign();

  const handleSkip = (name: OnboardingCampaignName) => () => {
    trackEventByName(tracks.clickSkipButton, {
      extra: { location: 'signed-in header', context: name },
    });
    dismissOnboardingCampaign(name);
  };

  if (!isNilOrError(currentOnboardingCampaign)) {
    const onboardingCampaignName = isContentBuilderDisplay
      ? 'default'
      : currentOnboardingCampaign.data.attributes.name;

    return (
      <Header className={`e2e-signed-in-header`} id="hook-header">
        <HeaderImage homepageSettings={homepageSettings} />
        <Suspense fallback={null}>
          <VerificationOnboardingStep
            currentOnboardingCampaignName={onboardingCampaignName}
            onSkip={handleSkip('verification')}
          />
          <CompleteProfileStep
            currentOnboardingCampaignName={onboardingCampaignName}
            onSkip={handleSkip('complete_profile')}
          />
          {/*
            This step is configured via AdminHQ.
            See https://citizenlab.atlassian.net/browse/CL-2289
          */}
          <CustomCTAStep
            currentOnboardingCampaignName={onboardingCampaignName}
            onSkip={handleSkip('custom_cta')}
          />
          <FallbackStep
            currentOnboardingCampaignName={onboardingCampaignName}
            homepageSettings={homepageSettings}
          />
        </Suspense>
      </Header>
    );
  }

  return null;
};

export default SignedInHeader;
