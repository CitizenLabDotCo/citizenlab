import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { UploadFile } from 'typings';

import ImageCropperContainer from 'components/admin/ImageCropper/Container';
import { TDevice } from 'components/admin/SelectPreviewDevice';

import HeaderImageDropzone from '../HeaderImageDropzone';

import {
  TLocalHeaderImage,
  Props as BannerImageFieldsProps,
  TBannerError,
} from '.';

interface Props {
  headerLocalDisplayImage: TLocalHeaderImage;
  displayImageCropper: boolean;
  displayOverlayControls: boolean;
  onAddImageToUploader: (newImage: UploadFile[]) => void;
  onRemoveImageFromUploader: () => void;
  onAddImage: BannerImageFieldsProps['onAddImage'];
  bannerOverlayOpacity: BannerImageFieldsProps['bannerOverlayOpacity'];
  bannerOverlayColor: BannerImageFieldsProps['bannerOverlayColor'];
  bannerLayout: BannerImageFieldsProps['bannerLayout'];
  bannerError: TBannerError;
  previewDevice: TDevice;
}

const ImageUploader = ({
  headerLocalDisplayImage,
  displayImageCropper,
  displayOverlayControls,
  onAddImageToUploader,
  onRemoveImageFromUploader,
  onAddImage,
  bannerOverlayColor,
  bannerOverlayOpacity,
  bannerLayout,
  bannerError,
  previewDevice,
}: Props) => {
  return (
    <>
      {displayImageCropper ? (
        <Box
          display="flex"
          flexDirection="column"
          gap="20px"
          mb={displayOverlayControls ? '32px' : '0'}
        >
          <ImageCropperContainer
            image={headerLocalDisplayImage}
            onComplete={onAddImage}
            aspectRatioWidth={3}
            aspectRatioHeight={1}
            onRemove={onRemoveImageFromUploader}
          />
        </Box>
      ) : (
        <Box mb="20px" data-cy="e2e-homepage-banner-image-dropzone">
          <HeaderImageDropzone
            onAdd={onAddImageToUploader}
            onRemove={onRemoveImageFromUploader}
            overlayColor={bannerOverlayColor}
            overlayOpacity={bannerOverlayOpacity}
            headerError={bannerError}
            header_bg={headerLocalDisplayImage}
            previewDevice={previewDevice}
            layout={bannerLayout}
          />
        </Box>
      )}
    </>
  );
};

export default ImageUploader;
