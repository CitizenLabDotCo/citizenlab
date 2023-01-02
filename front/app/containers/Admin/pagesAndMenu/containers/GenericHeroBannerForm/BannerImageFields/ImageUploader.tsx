import React from 'react';
import { Box, Text } from '@citizenlab/cl2-component-library';
import ImageCropper from 'components/admin/ImageCropper';
import HeaderImageDropzone from '../HeaderImageDropzone';
import Warning from 'components/UI/Warning';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';
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
  const { formatMessage } = useIntl();

  return (
    <>
      {displayImageCropper ? (
        <Box
          display="flex"
          flexDirection="column"
          gap="20px"
          mb={displayOverlayControls ? '32px' : '0'}
        >
          <ImageCropper
            image={headerLocalDisplayImage}
            onComplete={onAddImage}
          />
          <Warning>
            <Text>
              <FormattedMessage
                {...messages.fixedRatioImageCropperInfo}
                values={{
                  link: (
                    <a
                      href={formatMessage(messages.imageSupportPageURL)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FormattedMessage
                        {...messages.fixedRatioImageCropperInfoLink}
                      />
                    </a>
                  ),
                }}
              />
            </Text>
          </Warning>
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
            layout={bannerLayout || 'full_width_banner_layout'}
          />
        </Box>
      )}
    </>
  );
};

export default ImageUploader;
