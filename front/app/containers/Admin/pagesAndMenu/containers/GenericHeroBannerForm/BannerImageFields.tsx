import React, { useEffect, useMemo, useState } from 'react';

import {
  Box,
  ColorPickerInput,
  IOption,
  Label,
  Select,
} from '@citizenlab/cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import { ISubmitState } from 'components/admin/SubmitWrapper';
import { debounce } from 'lodash-es';

import { useTheme } from 'styled-components';
import { UploadFile } from 'typings';
import HeaderImageDropzone from './HeaderImageDropzone';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

import { convertUrlToUploadFile } from 'utils/fileUtils';
import { isNil, isNilOrError } from 'utils/helperUtils';

import { ICustomPageAttributes } from 'services/customPages';
import { IHomepageSettingsAttributes } from 'services/homepageSettings';

import RangeInput from 'components/UI/RangeInput';
import ImageCropperContainer from 'components/admin/ImageCropper/Container';
import ImageInfoTooltip from 'components/admin/ImageCropper/ImageInfoTooltip';

export type PreviewDevice = 'phone' | 'tablet' | 'desktop';

export interface Props {
  onAddImage: (newImageBase64: string) => void;
  onRemoveImage: () => void;
  onOverlayColorChange: (color: string) => void;
  onOverlayOpacityChange: (color: number) => void;
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
  setFormStatus: (submitState: ISubmitState) => void;
}

const BannerImageField = ({
  bannerOverlayColor,
  bannerOverlayOpacity,
  bannerLayout,
  headerBg,
  onAddImage,
  onRemoveImage,
  setFormStatus,
  onOverlayColorChange,
  onOverlayOpacityChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const theme = useTheme();
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [headerLocalDisplayImage, setHeaderLocalDisplayImage] = useState<
    UploadFile[] | null
  >(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  useEffect(() => {
    // the image file sent from the API needs to be converted
    // to a format that can be displayed. this is done locally
    // when the image is changed but needs to be done manually
    // to process the initial API response
    const convertHeaderToUploadFile = async (fileInfo) => {
      if (fileInfo) {
        const tenantHeaderBg = await convertUrlToUploadFile(fileInfo);
        const headerBgUploadFile = !isNilOrError(tenantHeaderBg)
          ? [tenantHeaderBg]
          : [];
        setHeaderLocalDisplayImage(headerBgUploadFile);
        setBannerError(null);
      }
    };

    const headerFileInfo = headerBg?.large;
    convertHeaderToUploadFile(headerFileInfo);
  }, [headerBg]);

  // set error and disable save button if header is removed,
  // the form cannot be saved without an image
  useEffect(() => {
    if (isNil(headerBg)) {
      setBannerError(formatMessage(messages.noHeader));
      return;
    }

    setBannerError(null);
  }, [headerBg, formatMessage, setFormStatus]);

  const bannerImageAddHandler = (newImage: UploadFile[]) => {
    // this base64 value is sent to the API
    onAddImage(newImage[0].base64);
    // this value is used for local display
    setHeaderLocalDisplayImage([newImage[0]]);
  };

  const bannerImageRemoveHandler = () => {
    onRemoveImage();
    setHeaderLocalDisplayImage(null);
  };

  const handleOverlayColorOnChange = (color: string) => {
    onOverlayColorChange(color);
  };

  const handleOverlayOpacityOnChange = (opacity: number) => {
    onOverlayOpacityChange(opacity);
  };

  const debounceHandleOverlayOpacityOnChange = debounce(
    handleOverlayOpacityOnChange,
    10
  );

  const debouncedHandleOverlayOpacityOnChange = useMemo(
    () => debounceHandleOverlayOpacityOnChange,
    [debounceHandleOverlayOpacityOnChange]
  );

  const imageIsNotSaved =
    headerLocalDisplayImage && !headerLocalDisplayImage[0].remote;

  const displayImageCropper =
    imageIsNotSaved && bannerLayout === 'fixed_ratio_layout';

  const displayPreviewDevice =
    !isNilOrError(headerLocalDisplayImage) &&
    bannerLayout !== 'fixed_ratio_layout';

  const displayOverlayControls =
    (bannerLayout === 'full_width_banner_layout' ||
      bannerLayout === 'fixed_ratio_layout') &&
    headerLocalDisplayImage;

  return (
    <>
      <SubSectionTitle>
        <FormattedMessage {...messages.header_bg} />
        <ImageInfoTooltip />
      </SubSectionTitle>
      <SectionField>
        {displayPreviewDevice && (
          <Box mb="20px">
            <Select
              label={formatMessage(messages.bgHeaderPreviewSelectLabel)}
              id="display-preview-device"
              options={[
                {
                  value: 'desktop',
                  label: formatMessage(messages.desktop),
                },
                {
                  value: 'tablet',
                  label: formatMessage(messages.tablet),
                },
                {
                  value: 'phone',
                  label: formatMessage(messages.phone),
                },
              ]}
              onChange={(option: IOption) => setPreviewDevice(option.value)}
              value={previewDevice}
            />
          </Box>
        )}
        {displayImageCropper ? (
          <Box display="flex" flexDirection="column" gap="8px">
            <ImageCropperContainer
              image={headerLocalDisplayImage}
              onComplete={onAddImage}
              aspect={3 / 1}
            />
          </Box>
        ) : (
          <HeaderImageDropzone
            onAdd={bannerImageAddHandler}
            onRemove={bannerImageRemoveHandler}
            overlayColor={bannerOverlayColor}
            overlayOpacity={bannerOverlayOpacity}
            headerError={bannerError}
            header_bg={headerLocalDisplayImage}
            previewDevice={previewDevice}
            layout={bannerLayout || 'full_width_banner_layout'}
          />
        )}
      </SectionField>
      {/* We only allow the overlay for the full-width and fixed-ratio banner layout for the moment. */}
      {displayOverlayControls && (
        <>
          <SectionField>
            <ColorPickerInput
              id="image-overlay-color"
              label={formatMessage(messages.imageOverlayColor)}
              type="text"
              value={
                // default values come from the theme
                bannerOverlayColor ?? theme.colors.tenantPrimary
              }
              onChange={handleOverlayColorOnChange}
            />
          </SectionField>
          <SectionField>
            <Label>
              <FormattedMessage {...messages.imageOverlayOpacity} />
            </Label>
            <RangeInput
              step={1}
              min={0}
              max={100}
              value={
                bannerOverlayOpacity || theme.signedOutHeaderOverlayOpacity
              }
              onChange={debouncedHandleOverlayOpacityOnChange}
            />
          </SectionField>
        </>
      )}
    </>
  );
};

export default BannerImageField;
