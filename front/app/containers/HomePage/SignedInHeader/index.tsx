import React, { lazy, Suspense } from 'react';

import { Box, media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { OnboardingCampaignName } from 'api/onboarding_campaigns/types';
import useCurrentOnboardingCampaign from 'api/onboarding_campaigns/useCurrentOnboardingCampaign';
import useDismissOnboardingCampaign from 'api/onboarding_campaigns/useDismissOnboardingCampaign';

import { IHomepageBannerSettings } from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/CraftComponents/HomepageBanner';

import {
  Container,
  HeaderImage,
  HeaderImageBackground,
  HeaderImageOverlay,
} from 'components/LandingPages/citizen/FullWidthBannerLayout';

import { trackEventByName } from 'utils/analytics';

import tracks from '../tracks';

const CompleteProfileStep = lazy(() => import('./CompleteProfileStep'));
const VerificationOnboardingStep = lazy(
  () => import('./VerificationOnboardingStep')
);
const CustomCTAStep = lazy(() => import('./CustomCTAStep'));
const FallbackStep = lazy(() => import('./FallbackStep'));

const heights = {
  phone: 300,
  tablet: 250,
  desktop: 200,
};

const Header = styled.div`
  width: 100%;
  height: ${heights.desktop}px;
  margin: 0;
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  ${media.tablet`
    height: ${heights.tablet}px;
  `}

  ${media.phone`
    height: ${heights.phone}px;
  `}
`;

const SignedInHeader = ({
  homepageSettings,
  isContentBuilderDisplay,
}: {
  homepageSettings: Partial<IHomepageBannerSettings>;
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

  if (!currentOnboardingCampaign) return null;

  const onboardingCampaignName = isContentBuilderDisplay
    ? 'default'
    : currentOnboardingCampaign.data.attributes.name;

  const homepageSettingColor =
    homepageSettings.banner_signed_in_header_overlay_color;
  const homepageSettingOpacity =
    homepageSettings.banner_signed_in_header_overlay_opacity;

  return (
    <Container
      data-testid="full-width-banner-layout"
      data-cy="e2e-full-width-banner-layout-container"
      className={`e2e-signed-out-header`}
    >
      <Header id="hook-header">
        <HeaderImage id="hook-header-image">
          <HeaderImageBackground
            data-testid="full-width-banner-layout-header-image"
            data-cy="e2e-full-width-banner-layout-header-image"
            src={homepageSettings.header_bg?.large || null}
          />
          {homepageSettingColor &&
            typeof homepageSettingOpacity === 'number' && (
              <HeaderImageOverlay
                data-cy="e2e-full-width-layout-header-image-overlay"
                overlayColor={homepageSettingColor}
                overlayOpacity={homepageSettingOpacity}
              />
            )}
        </HeaderImage>

        <Box>
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
        </Box>
      </Header>
    </Container>
  );
};

export default SignedInHeader;
