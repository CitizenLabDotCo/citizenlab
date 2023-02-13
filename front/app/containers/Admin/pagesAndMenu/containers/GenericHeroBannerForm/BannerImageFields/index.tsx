import React, { useEffect, useState } from 'react';
import { Box, IOption } from '@citizenlab/cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import OverlayControls from './OverlayControls';
import ImageUploader from './ImageUploader';
import SelectPreviewDevice, {
  TDevice,
} from 'components/admin/SelectPreviewDevice';
import { UploadFile } from 'typings';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';

import { convertUrlToUploadFile } from 'utils/fileUtils';
import { isNilOrError } from 'utils/helperUtils';
import {
  ICustomPageAttributes,
  TCustomPageBannerLayout,
} from 'services/customPages';
import {
  IHomepageSettingsAttributes,
  THomepageBannerLayout,
} from 'services/homepageSettings';
import ImageInfoTooltip from './ImageInfoTooltip';

export interface Props {
  onAddImage: (newImageBase64: string) => void;
  onRemoveImage: () => void;
  onOverlayChange: (
    opacity:
      | IHomepageSettingsAttributes['banner_signed_out_header_overlay_opacity']
      | ICustomPageAttributes['banner_overlay_opacity'],
    color:
      | IHomepageSettingsAttributes['banner_signed_out_header_overlay_color']
      | ICustomPageAttributes['banner_overlay_color']
  ) => void;
  bannerOverlayColor:
    | IHomepageSettingsAttributes['banner_signed_out_header_overlay_color']
    | ICustomPageAttributes['banner_overlay_color'];
  bannerOverlayOpacity:
    | IHomepageSettingsAttributes['banner_signed_out_header_overlay_opacity']
    | ICustomPageAttributes['banner_overlay_opacity'];
  bannerLayout:
    | IHomepageSettingsAttributes['banner_layout']
    | ICustomPageAttributes['banner_layout'];
  headerBg:
    | IHomepageSettingsAttributes['header_bg']
    | ICustomPageAttributes['header_bg'];
}

export type TLocalHeaderImage = UploadFile | null;
export type TBannerError = string | null;
type TBannerLayoutComponent =
  | 'image_cropper'
  | 'preview_device'
  | 'overlay_controls';

const BannerImageField = ({
  bannerOverlayColor,
  bannerOverlayOpacity,
  bannerLayout,
  headerBg,
  onAddImage,
  onRemoveImage,
  onOverlayChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const [previewDevice, setPreviewDevice] = useState<TDevice>('desktop');
  const [headerLocalDisplayImage, setHeaderLocalDisplayImage] =
    useState<TLocalHeaderImage>(null);
  const [bannerError, setBannerError] = useState<TBannerError>(null);

  useEffect(() => {
    // Not needed when the headerBg is a new, unsaved image.
    // In that case it's a base64 string.
    if (typeof headerBg === 'string') return;

    const headerFileInfo = headerBg?.large;

    convertHeaderToUploadFile(headerFileInfo);
  }, [headerBg]);

  const convertHeaderToUploadFile = async (
    fileInfo: string | null | undefined
  ) => {
    // the image file sent from the API needs to be converted
    // to a format that can be displayed. this is done locally
    // when the image is changed but needs to be done manually
    // to process the initial API response
    if (fileInfo) {
      const tenantHeaderBg = await convertUrlToUploadFile(fileInfo);

      setHeaderLocalDisplayImage(
        !isNilOrError(tenantHeaderBg) ? tenantHeaderBg : null
      );
    }
  };

  const handleOnAddImageToUploader = (newImages: UploadFile[]) => {
    // this base64 value is sent to the API
    onAddImage(newImages[0].base64);
    // this value is used for local display
    setHeaderLocalDisplayImage(newImages[0]);
    setBannerError(null);
  };

  const handleOnRemoveImageFromUploader = () => {
    onRemoveImage();
    setHeaderLocalDisplayImage(null);
    setBannerError(formatMessage(messages.noHeader));
  };

  const hasLocalHeaderImage = !isNilOrError(headerLocalDisplayImage);
  const imageShouldBeSaved = headerLocalDisplayImage
    ? !headerLocalDisplayImage.remote
    : false;

  const showConditions = (bannerLayout: THomepageBannerLayout) => {
    const conditions: {
      [key in THomepageBannerLayout | TCustomPageBannerLayout]: {
        [key in TBannerLayoutComponent]: boolean;
      };
    } = {
      full_width_banner_layout: {
        image_cropper: false,
        preview_device: hasLocalHeaderImage,
        overlay_controls: hasLocalHeaderImage,
      },
      two_row_layout: {
        image_cropper: false,
        preview_device: hasLocalHeaderImage,
        overlay_controls: false,
      },
      two_column_layout: {
        image_cropper: false,
        preview_device: hasLocalHeaderImage,
        overlay_controls: false,
      },
      fixed_ratio_layout: {
        // Only show for an unsaved image
        image_cropper: hasLocalHeaderImage && imageShouldBeSaved,
        preview_device: hasLocalHeaderImage && !imageShouldBeSaved,
        // Only show when we have the image uploader. For this layout
        // that means: image is saved (for an unsaved image we show the cropper)
        overlay_controls: hasLocalHeaderImage && !imageShouldBeSaved,
      },
    };

    return conditions[bannerLayout];
  };

  return (
    <>
      <SubSectionTitle>
        <FormattedMessage {...messages.header_bg} />
        <ImageInfoTooltip />
      </SubSectionTitle>
      <SectionField>
        {showConditions(bannerLayout).preview_device && (
          <Box mb="20px">
            <SelectPreviewDevice
              selectedPreviewDevice={previewDevice}
              onChange={(option: IOption) => setPreviewDevice(option.value)}
            />
          </Box>
        )}
        <ImageUploader
          bannerLayout={bannerLayout}
          bannerOverlayColor={bannerOverlayColor}
          bannerOverlayOpacity={bannerOverlayOpacity}
          displayImageCropper={showConditions(bannerLayout).image_cropper}
          displayOverlayControls={showConditions(bannerLayout).overlay_controls}
          onAddImage={onAddImage}
          onAddImageToUploader={handleOnAddImageToUploader}
          onRemoveImageFromUploader={handleOnRemoveImageFromUploader}
          previewDevice={previewDevice}
          bannerError={bannerError}
          headerLocalDisplayImage={headerLocalDisplayImage}
        />
        {/* We only allow the overlay for the full-width and fixed-ratio banner layout for the moment. */}
        {showConditions(bannerLayout).overlay_controls && (
          <OverlayControls
            bannerOverlayColor={bannerOverlayColor}
            bannerOverlayOpacity={bannerOverlayOpacity}
            onOverlayChange={onOverlayChange}
          />
        )}
      </SectionField>
    </>
  );
};

export default BannerImageField;
