import React from 'react';
import styled, { useTheme } from 'styled-components';
import { Image, Box, media, isRtl } from '@citizenlab/cl2-component-library';
import { IHomepageBannerSettings } from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/CraftComponents/HomepageBanner';

const HeaderImageContainer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const HeaderImageContainerInner = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const StyledImage = styled(Image)`
  width: 100%;
  height: auto;

  ${media.tablet`
    width: 100%;
    height: 100%;
    object-fit: cover;
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
      <HeaderImageContainer>
        <HeaderImageContainerInner data-cy="e2e-signed-in-header-image-parent">
          {/*
            With the fixed ratio layout, the image would be pixeled so we
            don't show it for that layout.
            Ticket: https://citizenlab.atlassian.net/browse/CL-2215
          */}
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
            // With this fixed ratio layout, we don't have an image (see above),
            // so we set opacity to 1.
            // Ticket: https://citizenlab.atlassian.net/browse/CL-2215

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
      </HeaderImageContainer>
    );
  }

  return null;
};

export default HeaderImage;
