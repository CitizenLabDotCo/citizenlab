import React from 'react';
import styled, { useTheme } from 'styled-components';
import { Image, Box } from '@citizenlab/cl2-component-library';
import { media, isRtl } from 'utils/styleUtils';
import useHomepageSettings from 'hooks/useHomepageSettings';
import { isNilOrError } from 'utils/helperUtils';

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

const HeaderImage = () => {
  const homepageSettings = useHomepageSettings();
  const theme = useTheme();

  if (!isNilOrError(homepageSettings)) {
    const tenantHeaderImage = homepageSettings.attributes.header_bg
      ? homepageSettings.attributes.header_bg.large
      : null;
    const isFixedBannerLayout =
      homepageSettings.attributes.banner_layout === 'fixed_ratio_layout';

    return (
      <HeaderImageContainer>
        <HeaderImageContainerInner data-cy="e2e-signed-in-header-image-parent">
          {/*
            With the fixed ratio layout, the image would be pixeled so we
            don't show it for that layout.
            Ticket: https://citizenlab.atlassian.net/browse/CL-2215
          */}
          {tenantHeaderImage && !isFixedBannerLayout && (
            <StyledImage
              data-cy="e2e-signed-in-header-image"
              alt="" // Image is decorative, so alt tag is empty
              src={tenantHeaderImage}
            />
          )}
          {/* Image overlay */}
          <Box
            data-testid="signed-in-header-image-overlay"
            background={
              theme.signedInHeaderOverlayColor || theme.colors.tenantPrimary
            }
            // With this fixed ratio layout, we don't have an image (see above),
            // so we set opacity to 1.
            // Ticket: https://citizenlab.atlassian.net/browse/CL-2215

            opacity={
              isFixedBannerLayout ? 1 : theme.signedInHeaderOverlayOpacity / 100
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
