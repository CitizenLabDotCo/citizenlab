import React, { lazy, Suspense } from 'react';

import { Box, media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { OnboardingCampaignName } from 'api/onboarding_campaigns/types';
import useCurrentOnboardingCampaign from 'api/onboarding_campaigns/useCurrentOnboardingCampaign';
import useDismissOnboardingCampaign from 'api/onboarding_campaigns/useDismissOnboardingCampaign';

import { IHomepageBannerSettings } from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/Widgets/HomepageBanner';
import { homepageBannerLayoutHeights } from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/HeaderImageDropzone';

import {
  Container,
  HeaderImage,
  HeaderImageBackground,
  HeaderImageOverlay,
} from 'components/LandingPages/citizen/FullWidthBannerLayout';

import { trackEventByName } from 'utils/analytics';

import tracks from '../tracks';

import Skeleton from './Skeleton';

const CompleteProfileStep = lazy(() => import('./CompleteProfileStep'));
const VerificationOnboardingStep = lazy(
  () => import('./VerificationOnboardingStep')
);
const CustomCTAStep = lazy(() => import('./CustomCTAStep'));
const FallbackStep = lazy(() => import('./FallbackStep'));

export const defaultHeights = {
  phone: 300,
  tablet: 250,
  desktop: 200,
};

const Header = styled.div<{
  desktopHeight: number;
  tabletHeight: number;
  phoneHeight: number;
}>`
  width: 100%;
  height: ${(props) => props.desktopHeight}px;
  margin: 0;
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  ${media.tablet`
    height: ${(props) => props.tabletHeight}px;
  `}

  ${media.phone`
    height: ${(props) => props.phoneHeight}px;
  `}
`;

const SignedInHeader = ({
  homepageSettings,
  isContentBuilderDisplay,
}: {
  homepageSettings: Partial<IHomepageBannerSettings>;
  isContentBuilderDisplay?: boolean;
}) => {
  const { data: currentOnboardingCampaign, isInitialLoading } =
    useCurrentOnboardingCampaign();
  const { mutate: dismissOnboardingCampaign } = useDismissOnboardingCampaign();

  const handleSkip = (name: OnboardingCampaignName) => () => {
    trackEventByName(tracks.clickSkipButton, {
      location: 'signed-in header',
      context: name,
    });
    dismissOnboardingCampaign(name);
  };

  const homepageSettingColor =
    homepageSettings.banner_signed_in_header_overlay_color;
  const homepageSettingOpacity =
    homepageSettings.banner_signed_in_header_overlay_opacity;

  // When consistent height is enabled, use layout defaults for signed-in banner
  const useConsistentHeight =
    homepageSettings.banner_use_consistent_height === true;

  // Get layout-specific defaults
  const bannerLayout =
    homepageSettings.banner_layout || 'full_width_banner_layout';
  const layoutDefaults = homepageBannerLayoutHeights[bannerLayout];

  let desktopHeight: number;
  let tabletHeight: number;
  let phoneHeight: number;

  if (useConsistentHeight) {
    // Use the same height as the signed-out banner (custom values if set, otherwise layout defaults)
    desktopHeight =
      homepageSettings.banner_signed_out_header_height_desktop ??
      layoutDefaults.desktop;
    tabletHeight =
      homepageSettings.banner_signed_out_header_height_tablet ??
      layoutDefaults.tablet;
    phoneHeight =
      homepageSettings.banner_signed_out_header_height_phone ??
      layoutDefaults.phone;
  } else {
    // Use the custom signed-in heights, or fall back to default heights
    desktopHeight =
      homepageSettings.banner_signed_in_header_height_desktop ??
      defaultHeights.desktop;
    tabletHeight =
      homepageSettings.banner_signed_in_header_height_tablet ??
      defaultHeights.tablet;
    phoneHeight =
      homepageSettings.banner_signed_in_header_height_phone ??
      defaultHeights.phone;
  }

  if (isInitialLoading) {
    return (
      <Skeleton
        homepageSettingColor={homepageSettingColor ?? undefined}
        homepageSettingOpacity={homepageSettingOpacity ?? undefined}
        desktopHeight={desktopHeight}
        tabletHeight={tabletHeight}
        phoneHeight={phoneHeight}
      />
    );
  }

  if (!currentOnboardingCampaign) return null;

  const onboardingCampaignName = isContentBuilderDisplay
    ? 'default'
    : currentOnboardingCampaign.data.attributes.name;

  return (
    <Container
      data-testid="full-width-banner-layout"
      data-cy="e2e-full-width-banner-layout-container"
      className={`e2e-signed-in-header`}
    >
      <Header
        id="hook-header"
        desktopHeight={desktopHeight}
        tabletHeight={tabletHeight}
        phoneHeight={phoneHeight}
      >
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
