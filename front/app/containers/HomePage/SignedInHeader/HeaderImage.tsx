import React from 'react';

import { Image, Box, media, isRtl } from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';

import { IHomepageBannerSettings } from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/CraftComponents/HomepageBanner';

const HeaderImageContainerInner = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const StyledImage = styled(Image)`
  width: 100%;
  height: auto; // Maintain aspect ratio for the image.
  object-fit: cover; // Ensure the image covers the entire container.

  ${media.tablet`
    width: 100%;
    height: auto;
    object-fit: cover; // Maintain object-fit to ensure proper scaling.
  `}
`;

const HeaderImage = ({
  homepageSettings,
}: {
  homepageSettings: Partial<IHomepageBannerSettings>;
}) => {
  const theme = useTheme();

  if (homepageSettings) {
    const tenantHeaderImage = homepageSettings.header_bg
      ? homepageSettings.header_bg.large
      : null;
    return (
      <Box position="relative" width="100%" height="auto" overflow="hidden">
        <HeaderImageContainerInner data-cy="e2e-signed-in-header-image-parent">
          {tenantHeaderImage && (
            <StyledImage
              data-cy="e2e-signed-in-header-image"
              alt="" // Image is decorative, so alt tag is empty
              src={tenantHeaderImage}
            />
          )}
          {/* Image overlay */}
          <Box
            data-testid="signed-in-header-image-overlay"
            data-cy="e2e-signed-in-header-image-overlay"
            background={
              homepageSettings.banner_signed_in_header_overlay_color ||
              theme.colors.tenantPrimary
            }
            opacity={
              typeof homepageSettings.banner_signed_in_header_overlay_opacity ===
              'number'
                ? homepageSettings.banner_signed_in_header_overlay_opacity / 100
                : 0.9
            }
            position="absolute"
            top="0"
            bottom="0"
            left="0"
            right="0"
          />
        </HeaderImageContainerInner>
      </Box>
    );
  }

  return null;
};

export default HeaderImage;
