import React from 'react';
import styled from 'styled-components';

// components and theming
import ImagesDropzone from 'components/UI/ImagesDropzone';
import { TPreviewDevice, TBannerError } from './BannerImageFields';

// types
import {
  ICustomPageAttributes,
  TCustomPageBannerLayout,
} from 'services/customPages';
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
  headerError: TBannerError;
  header_bg: UploadFile | null;
  previewDevice: TPreviewDevice;
  layout: THomepageBannerLayout;
}

// move this to homepage settings resource?
export const homepageBannerLayoutHeights: {
  [key in THomepageBannerLayout]: {
    [key in TPreviewDevice]: number;
  };
} = {
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
  fixed_ratio_layout: {
    desktop: 450,
    tablet: 450,
    phone: 225,
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
    const standardWidthPerDeviceType: { [key in TPreviewDevice]: number } = {
      desktop: 1530,
      tablet: 768,
      phone: 375,
    };
    const standardDeviceWidth = standardWidthPerDeviceType[previewDevice];
    const deviceWidthPerLayout =
      previewDevice === 'desktop' && layout === 'two_column_layout' ? 0.5 : 1;
    const ratio =
      layoutHeightOnDevice / (standardDeviceWidth * deviceWidthPerLayout);

    return ratio;
  };

  const showPreviewOverlayForLayout = (
    layout: THomepageBannerLayout | TCustomPageBannerLayout
  ) => {
    const conditions: {
      [key in THomepageBannerLayout | TCustomPageBannerLayout]: boolean;
    } = {
      full_width_banner_layout: true,
      two_row_layout: false,
      two_column_layout: false,
      fixed_ratio_layout: true,
    };

    return conditions[layout];
  };

  const previewOverlayElement =
    showPreviewOverlayForLayout(layout) &&
    // We check for typeof of opacity because 0 would coerce to false.
    typeof overlayOpacity === 'number' &&
    overlayColor ? (
      <HeaderImageOverlay
        overlayColor={overlayColor}
        overlayOpacity={overlayOpacity}
      />
    ) : null;

  return (
    <ImagesDropzone
      id="header-dropzone"
      acceptedFileTypes={{
        'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
      }}
      images={header_bg ? [header_bg] : null}
      imagePreviewRatio={getImagePreviewRatio()}
      onAdd={onAdd}
      onRemove={onRemove}
      errorMessage={headerError}
      previewOverlayElement={previewOverlayElement}
    />
  );
};

export default HeaderImageDropzone;
