import React from 'react';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import {
  IAppConfigurationStyle,
  THomepageBannerLayout,
} from 'services/appConfiguration';
import { UploadFile } from 'typings';
import { PreviewDevice } from './';
import styled from 'styled-components';

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
  latestAppConfigStyleSettings?: IAppConfigurationStyle;
  onAdd: (newImage: UploadFile[]) => void;
  onRemove: () => void;
  headerError: string | null;
  header_bg: UploadFile[] | null;
  previewDevice: PreviewDevice;
  layout: THomepageBannerLayout;
}

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
  latestAppConfigStyleSettings,
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

  const overlayColor =
    latestAppConfigStyleSettings?.signedOutHeaderOverlayColor;
  const overlayOpacity =
    latestAppConfigStyleSettings?.signedOutHeaderOverlayOpacity;
  const previewOverlayElement =
    layout === 'full_width_banner_layout' && overlayColor && overlayOpacity ? (
      <HeaderImageOverlay
        overlayColor={overlayColor}
        overlayOpacity={overlayOpacity}
      />
    ) : null;

  return (
    <ImagesDropzone
      id="landingpage-header-dropzone"
      acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
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
