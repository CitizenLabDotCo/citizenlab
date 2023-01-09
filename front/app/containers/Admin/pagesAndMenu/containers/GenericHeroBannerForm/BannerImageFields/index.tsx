import React, { useEffect, useState } from 'react';
import {
  Box,
  IconTooltip,
  IOption,
  Select,
} from '@citizenlab/cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import OverlayControls from './OverlayControls';
import ImageUploader from './ImageUploader';

import { ISubmitState } from 'components/admin/SubmitWrapper';
import { UploadFile } from 'typings';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';

import { convertUrlToUploadFile } from 'utils/fileUtils';
import { isNil, isNilOrError } from 'utils/helperUtils';

import { ICustomPageAttributes } from 'services/customPages';
import { IHomepageSettingsAttributes } from 'services/homepageSettings';

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
  setFormStatus: (submitState: ISubmitState) => void;
}

export type TPreviewDevice = 'phone' | 'tablet' | 'desktop';
export type TLocalHeaderImage = UploadFile[] | null;
export type TBannerError = string | null;

const BannerImageField = ({
  bannerOverlayColor,
  bannerOverlayOpacity,
  bannerLayout,
  headerBg,
  onAddImage,
  onRemoveImage,
  setFormStatus,
  onOverlayChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const [previewDevice, setPreviewDevice] = useState<TPreviewDevice>('desktop');
  const [headerLocalDisplayImage, setHeaderLocalDisplayImage] =
    useState<TLocalHeaderImage>(null);
  const [bannerError, setBannerError] = useState<TBannerError>(null);

  useEffect(() => {
    // https://stackoverflow.com/questions/54954385/react-useeffect-causing-cant-perform-a-react-state-update-on-an-unmounted-comp
    const ac = new AbortController();
    // the image file sent from the API needs to be converted
    // to a format that can be displayed. this is done locally
    // when the image is changed but needs to be done manually
    // to process the initial API response
    const convertHeaderToUploadFile = async (
      fileInfo: string | null | undefined
    ) => {
      if (fileInfo) {
        const tenantHeaderBg = await convertUrlToUploadFile(fileInfo);
        setHeaderLocalDisplayImage(
          !isNilOrError(tenantHeaderBg) ? [tenantHeaderBg] : []
        );
        setBannerError(null);
      }
    };
    const headerFileInfo = headerBg?.large;
    convertHeaderToUploadFile(headerFileInfo);

    // https://stackoverflow.com/questions/54954385/react-useeffect-causing-cant-perform-a-react-state-update-on-an-unmounted-comp
    return () => ac.abort();
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

  const handleOnAddImageToUploader = (newImage: UploadFile[]) => {
    // this base64 value is sent to the API
    onAddImage(newImage[0].base64);
    // this value is used for local display
    setHeaderLocalDisplayImage([newImage[0]]);
  };

  const handleOnRemoveImageFromUploader = () => {
    onRemoveImage();
    setHeaderLocalDisplayImage(null);
  };

  const imageIsSaved = headerLocalDisplayImage?.[0].remote || false;
  const hasLocalHeaderImage = !isNilOrError(headerLocalDisplayImage);

  const displayImageCropper =
    hasLocalHeaderImage &&
    !imageIsSaved &&
    bannerLayout === 'fixed_ratio_layout';

  const displayPreviewDevice =
    hasLocalHeaderImage && bannerLayout !== 'fixed_ratio_layout';

  const displayOverlayControls =
    hasLocalHeaderImage &&
    (bannerLayout === 'full_width_banner_layout' ||
      (bannerLayout === 'fixed_ratio_layout' && imageIsSaved));

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
        <ImageUploader
          bannerLayout={bannerLayout}
          bannerOverlayColor={bannerOverlayColor}
          bannerOverlayOpacity={bannerOverlayOpacity}
          displayImageCropper={displayImageCropper}
          displayOverlayControls={displayOverlayControls}
          onAddImage={onAddImage}
          onAddImageToUploader={handleOnAddImageToUploader}
          onRemoveImageFromUploader={handleOnRemoveImageFromUploader}
          previewDevice={previewDevice}
          bannerError={bannerError}
          headerLocalDisplayImage={headerLocalDisplayImage}
        />
        {/* We only allow the overlay for the full-width and fixed-ratio banner layout for the moment. */}
        {displayOverlayControls && (
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
