import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';
import HeaderImageDropzone from '../HeaderImageDropzone';
import ImageCropperContainer from 'components/admin/ImageCropper/Container';
import {
  TLocalHeaderImage,
  Props as BannerImageFieldsProps,
  TPreviewDevice,
  TBannerError,
} from '.';
import { UploadFile } from 'typings';

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
  previewDevice: TPreviewDevice;
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
            aspect={3 / 1}
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
