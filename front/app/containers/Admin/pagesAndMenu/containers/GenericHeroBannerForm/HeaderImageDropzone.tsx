import React from 'react';
import styled from 'styled-components';

// components and theming
import ImagesDropzone from 'components/UI/ImagesDropzone';
import { TBannerError } from './BannerImageFields';
import { TDevice } from 'components/admin/SelectPreviewDevice';
import { viewportWidths } from '@citizenlab/cl2-component-library';

// types
import {
  ICustomPageAttributes,
  TCustomPageBannerLayout,
} from 'api/custom_pages/types';
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
  overlayOpacity: ICustomPageAttributes['banner_overlay_opacity'];
  overlayColor: ICustomPageAttributes['banner_overlay_color'];
  onAdd: (newImage: UploadFile[]) => void;
  onRemove: () => void;
  headerError: TBannerError;
  header_bg: UploadFile | null;
  previewDevice: TDevice;
  layout: TCustomPageBannerLayout;
}

// move this to homepage settings resource?
export const FIXED_RATIO_LAYOUT_ASPECT_RATIO = 3 / 1;
export const homepageBannerLayoutHeights: {
  [key in TCustomPageBannerLayout]: {
    [key in TDevice]: number;
  };
} = {
  full_width_banner_layout: {
    phone: 350,
    tablet: 350,
    desktop: 450,
  },
  two_column_layout: {
    phone: 240,
    tablet: 532,
    desktop: 532,
  },
  two_row_layout: {
    phone: 200,
    tablet: 280,
    desktop: 280,
  },
  fixed_ratio_layout: {
    // On mobile min-height is 225.
    phone: 225,
    // We define a screen as tablet when width is between 769 and 1200 px.
    // Height will start reducing from our max width of 1200px.
    // We maintain the 3:1 aspect ratio until our min-height of 225px is reached.
    // At this point, the banner will start cutting of from the size to maintain
    // the min-height.
    // So for the fixed-ratio layout, it makes sense to show the same preview for tablet
    // as for desktop
    tablet: 383,
    // Header image is saved as 1920x640px.
    // Image is displayed with max width 1200px and 3:1 aspect ratio.
    // This means width of 383.33px.
    desktop: 383,
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
    // Using the widths as we define them for our breakpoints.
    const viewportWidthsKey = {
      phone: 'phone' as const,
      tablet: 'tablet' as const,
      desktop: 'smallDesktop' as const,
    }[previewDevice];
    const standardDeviceWidth = viewportWidths[viewportWidthsKey];
    const ratio = layoutHeightOnDevice / standardDeviceWidth;

    const ratioPerLayoutPerDevice: {
      [key in TCustomPageBannerLayout]: {
        [key in TDevice]: number;
      };
    } = {
      // For all layouts except fixed-ratio the fixed height in their styles
      // Determine behavior.
      full_width_banner_layout: {
        phone: ratio,
        tablet: ratio,
        desktop: ratio,
      },
      two_column_layout: {
        phone: ratio,
        // On bigger screens, the image is only half the screen's width
        // So the width gets divided by two (or the equivalent of twice the ratio).
        tablet: 2 * ratio,
        desktop: 2 * ratio,
      },
      two_row_layout: {
        phone: ratio,
        tablet: ratio,
        desktop: ratio,
      },
      fixed_ratio_layout: {
        // With our min-height of 225px, we assume a phone screenwidth of
        // 450px for the sake of simplicity. Resulting in 1 / 2 aspect-ratio.
        // Average phone screen width is slightly narrower though.
        // This phone ratio is currently only used to show a preview of the fixed-ratio
        // layout in the admin with the 450px width assumption.
        phone: 1 / 2,
        tablet: 1 / FIXED_RATIO_LAYOUT_ASPECT_RATIO,
        desktop: 1 / FIXED_RATIO_LAYOUT_ASPECT_RATIO,
      },
    };

    return ratioPerLayoutPerDevice[layout][previewDevice];
  };

  const showPreviewOverlayForLayout = (layout: TCustomPageBannerLayout) => {
    const conditions: {
      [key in TCustomPageBannerLayout]: boolean;
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
