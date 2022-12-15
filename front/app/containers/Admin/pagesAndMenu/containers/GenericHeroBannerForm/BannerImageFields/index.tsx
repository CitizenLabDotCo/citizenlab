import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  Box,
  ColorPickerInput,
  IconTooltip,
  IOption,
  Label,
  Select,
  Text,
  Toggle,
} from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import { ISubmitState } from 'components/admin/SubmitWrapper';
import { debounce } from 'lodash-es';

import { useTheme } from 'styled-components';
import { UploadFile } from 'typings';
import HeaderImageDropzone from '../HeaderImageDropzone';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';

import { convertUrlToUploadFile } from 'utils/fileUtils';
import { isNil, isNilOrError } from 'utils/helperUtils';
import { colors } from 'utils/styleUtils';

import { ICustomPageAttributes } from 'services/customPages';
import { IHomepageSettingsAttributes } from 'services/homepageSettings';

import RangeInput from 'components/UI/RangeInput';
import ImageCropper from 'components/admin/ImageCropper';

const StyledBox = styled(Box)`
  position: relative;

  ::before,
  ::after {
    content: '';
    display: block;
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
  }

  ::after {
    top: -20px;
    left: 25px;
    border-color: transparent transparent #fff transparent;
    border-width: 10px;
  }

  ::before {
    top: -22px;
    left: 24px;
    border-color: transparent transparent ${colors.grey300} transparent;
    border-width: 11px;
  }
`;

export type PreviewDevice = 'mobile' | 'tablet' | 'desktop';

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
  const [overlayEnabled, setOverlayEnabled] = useState(
    typeof bannerOverlayOpacity === 'number' && bannerOverlayOpacity > 0
  );
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

  useEffect(() => {
    if (overlayEnabled) {
      handleOverlayOpacityOnChange(
        bannerOverlayOpacity || theme.signedOutHeaderOverlayOpacity
      );
    } else {
      handleOverlayOpacityOnChange(0);
    }
  }, [overlayEnabled]);

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
    1
  );

  const debouncedHandleOverlayOpacityOnChange = useMemo(
    () => debounceHandleOverlayOpacityOnChange,
    [debounceHandleOverlayOpacityOnChange]
  );

  const handleOverlayEnabling = () => {
    setOverlayEnabled((overlayEnabled) => !overlayEnabled);
  };

  const imageIsNotSaved =
    (headerLocalDisplayImage && !headerLocalDisplayImage[0].remote) || false;

  const displayImageCropper =
    imageIsNotSaved && bannerLayout === 'fixed_ratio_layout';

  const displayPreviewDevice =
    !isNilOrError(headerLocalDisplayImage) &&
    bannerLayout !== 'fixed_ratio_layout';

  const displayOverlayControls =
    (bannerLayout === 'full_width_banner_layout' ||
      (bannerLayout === 'fixed_ratio_layout' && !displayImageCropper)) &&
    headerLocalDisplayImage;

  return (
    <>
      <SubSectionTitle>
        <FormattedMessage {...messages.header_bg} />
        <IconTooltip
          content={
            <FormattedMessage
              {...messages.headerBgTooltip}
              values={{
                supportPageLink: (
                  <a
                    href={formatMessage(messages.imageSupportPageURL)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FormattedMessage
                      {...messages.headerImageSupportPageText}
                    />
                  </a>
                ),
              }}
            />
          }
        />
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
          <Box display="flex" flexDirection="column" gap="20px" mb="32px">
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
          <Box mb="20px">
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
          </Box>
        )}
        {/* We only allow the overlay for the full-width and fixed-ratio banner layout for the moment. */}
        {displayOverlayControls && (
          <>
            <Box mb={overlayEnabled ? '20px' : '0'}>
              <Toggle
                onChange={handleOverlayEnabling}
                checked={overlayEnabled}
                label={
                  <Box color={colors.blue500}>
                    {formatMessage(messages.overlayToggleLabel)}
                  </Box>
                }
              />
            </Box>
            {overlayEnabled && (
              <StyledBox
                p="40px"
                border={`1px solid ${colors.grey300}`}
                borderRadius={theme.borderRadius}
              >
                <Box mb="36px">
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
                </Box>
                <Label>
                  <FormattedMessage {...messages.imageOverlayOpacity} />
                </Label>
                <RangeInput
                  step={1}
                  min={0}
                  max={100}
                  value={
                    typeof bannerOverlayOpacity === 'number'
                      ? bannerOverlayOpacity
                      : theme.signedOutHeaderOverlayOpacity
                  }
                  onChange={debouncedHandleOverlayOpacityOnChange}
                />
              </StyledBox>
            )}
          </>
        )}
      </SectionField>
    </>
  );
};

export default BannerImageField;
