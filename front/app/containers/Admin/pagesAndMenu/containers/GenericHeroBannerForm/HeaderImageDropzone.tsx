import React from 'react';

// components and theming
import ImagesDropzone from 'components/UI/ImagesDropzone';
import styled, { useTheme } from 'styled-components';
import { PreviewDevice } from './BannerImageFields';

// types
import { ICustomPageAttributes } from 'services/customPages';
import {
  IHomepageSettingsAttributes,
  THomepageBannerLayout,
} from 'services/homepageSettings';
import { UploadFile } from 'typings';

const HeaderImageOverlay = styled.div<{
  overlayColor: string;
  overlayOpacity: number;
}>`
  background: ${({ overlayColor }) => overlayColor};
  opacity: ${({ overlayOpacity }) => overlayOpacity / 100};
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

interface Props {
  overlayOpacity:
    | IHomepageSettingsAttributes['banner_signed_out_header_overlay_opacity']
    | ICustomPageAttributes['banner_overlay_opacity'];
  overlayColor:
    | IHomepageSettingsAttributes['banner_signed_out_header_overlay_color']
    | ICustomPageAttributes['banner_overlay_color'];
  onAdd: (newImage: UploadFile[]) => void;
  onRemove: () => void;
  headerError: string | null;
  header_bg: UploadFile[] | null;
  previewDevice: PreviewDevice;
  layout: THomepageBannerLayout;
}

// move this to homepage settings resource?
export const homepageBannerLayoutHeights = {
  full_width_banner_layout: {
    desktop: 450,
    tablet: 350,
    phone: 300,
  },
  two_column_layout: {
    desktop: 532,
    tablet: 532,
    phone: 240,
  },
  two_row_layout: {
    desktop: 280,
    tablet: 200,
    phone: 200,
  },
};

const HeaderImageDropzone = ({
  overlayColor,
  overlayOpacity,
  onAdd,
  onRemove,
  headerError,
  previewDevice,
  layout,
  header_bg,
}: Props) => {
  const getImagePreviewRatio = () => {
    const layoutHeightOnDevice =
      homepageBannerLayoutHeights[layout][previewDevice];
    const standardDeviceWidth = { desktop: 1530, tablet: 768, phone: 375 }[
      previewDevice
    ];
    const deviceWidthPerLayout =
      previewDevice === 'desktop' && layout === 'two_column_layout' ? 0.5 : 1;
    const ratio =
      layoutHeightOnDevice / (standardDeviceWidth * deviceWidthPerLayout);

    return ratio;
  };

  const theme: any = useTheme();
  const displayOverlayColor = overlayColor ?? theme.colors.tenantPrimary;
  const displayOverlayOpacity =
    overlayOpacity ?? theme.signedOutHeaderOverlayOpacity;

  const previewOverlayElement =
    layout === 'full_width_banner_layout' &&
    displayOverlayColor &&
    displayOverlayOpacity ? (
      <HeaderImageOverlay
        overlayColor={displayOverlayColor}
        overlayOpacity={displayOverlayOpacity}
      />
    ) : null;

  return (
    <ImagesDropzone
      id="header-dropzone"
      acceptedFileTypes={{
        'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
      }}
      images={header_bg}
      imagePreviewRatio={getImagePreviewRatio()}
      onAdd={onAdd}
      onRemove={onRemove}
      errorMessage={headerError}
      previewOverlayElement={previewOverlayElement}
    />
  );
};

export default HeaderImageDropzone;
