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
    &.objectFitCoverSupported {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &:not(.objectFitCoverSupported) {
      width: auto;
      height: 100%;
    }
  `}
`;

const HeaderImage = () => {
  const homepageSettings = useHomepageSettings();
  const theme = useTheme();
  const objectFitCoverSupported =
    window['CSS'] && CSS.supports('object-fit: cover');

  if (!isNilOrError(homepageSettings)) {
    const tenantHeaderImage = homepageSettings.attributes.header_bg
      ? homepageSettings.attributes.header_bg.large
      : null;
    const isFixedBannerLayout =
      homepageSettings.attributes.banner_layout === 'fixed_ratio_layout';

    return (
      <HeaderImageContainer>
        <HeaderImageContainerInner>
          {/*
            With this fixed ratio layout, the image would be messed up.
            Ticket: https://citizenlab.atlassian.net/browse/CL-2215
          */}
          {tenantHeaderImage && !isFixedBannerLayout && (
            <StyledImage
              alt="" // Image is decorative, so alt tag is empty
              src={tenantHeaderImage}
              className={
                objectFitCoverSupported ? 'objectFitCoverSupported' : ''
              }
            />
          )}
          {/* Image overlay */}
          <Box
            background={
              theme.signedInHeaderOverlayColor || theme.colors.tenantPrimary
            }
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
