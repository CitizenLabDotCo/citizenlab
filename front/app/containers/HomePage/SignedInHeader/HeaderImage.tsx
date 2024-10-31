import React from 'react';

import { Image, Box } from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';

import { IHomepageBannerSettings } from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/CraftComponents/HomepageBanner';

const StyledImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const HeaderImage = ({
  homepageSettings,
}: {
  homepageSettings: Partial<IHomepageBannerSettings>;
}) => {
  const theme = useTheme();

  const tenantHeaderImage = homepageSettings.header_bg
    ? homepageSettings.header_bg.large
    : null;

  return (
    <>
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
    </>
  );
};

export default HeaderImage;
