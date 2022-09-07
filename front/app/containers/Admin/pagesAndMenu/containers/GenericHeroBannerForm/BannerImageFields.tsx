import React, { useState, useEffect, useMemo } from 'react';
import { SectionField } from 'components/admin/Section';
import { useTheme } from 'styled-components';
import {
  Box,
  IOption,
  ColorPickerInput,
  Label,
  Select,
} from '@citizenlab/cl2-component-library';
import HeaderImageDropzone from './HeaderImageDropzone';
import { UploadFile } from 'typings';
import { ISubmitState } from 'components/admin/SubmitWrapper';
import { debounce } from 'lodash-es';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

import { isNil, isNilOrError } from 'utils/helperUtils';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import { HeaderImageProps } from '.';

import { ICustomPagesAttributes } from 'services/customPages';
import { IHomepageSettingsAttributes } from 'services/homepageSettings';

import RangeInput from 'components/UI/RangeInput';
export type PreviewDevice = 'mobile' | 'tablet' | 'desktop';

interface Props extends HeaderImageProps {
  // replace with references to home/custom page?
  bannerOverlayColor:
    | IHomepageSettingsAttributes['banner_signed_out_header_overlay_color']
    | ICustomPagesAttributes['banner_overlay_color'];
  bannerOverlayOpacity:
    | IHomepageSettingsAttributes['banner_signed_out_header_overlay_opacity']
    | ICustomPagesAttributes['banner_overlay_opacity'];
  bannerLayout:
    | IHomepageSettingsAttributes['banner_layout']
    | ICustomPagesAttributes['banner_layout'];
  headerBg:
    | IHomepageSettingsAttributes['header_bg']
    | ICustomPagesAttributes['header_bg'];
  setFormStatus: (submitState: ISubmitState) => void;

}

const BannerImageField = ({
  intl: { formatMessage },
  bannerOverlayColor,
  bannerOverlayOpacity,
  bannerLayout,
  headerBg,
  onAddImage,
  onRemoveImage,
  setFormStatus,
  onOverlayColorChange,
  onOverlayOpacityChange
}: Props & InjectedIntlProps) => {
  const theme: any = useTheme();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerBg]);

  // set error and disable save button if header is removed,
  // the form cannot be saved without an image
  useEffect(() => {
    if (isNil(headerBg)) {
      setBannerError(formatMessage(messages.noHeader));
      setFormStatus('disabled');
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
    15
  );

  const debouncedHandleOverlayOpacityOnChange = useMemo(
    () => debounceHandleOverlayOpacityOnChange,
    [debounceHandleOverlayOpacityOnChange]
  );

  return (
    <>
      <SectionField>
        {!isNilOrError(headerLocalDisplayImage) && (
          <>
            <Label>
              <FormattedMessage {...messages.bgHeaderPreviewSelectLabel} />
            </Label>
            <Box mb="20px">
              <Select
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
          </>
        )}
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
      </SectionField>
      {/*We only allow the overlay for the full-width banner layout for the moment. */}
      {bannerLayout === 'full_width_banner_layout' && headerLocalDisplayImage && (
        <>
          <SectionField>
            <Label>
              <FormattedMessage {...messages.imageOverlayColor} />
            </Label>
            <ColorPickerInput
              type="text"
              value={
                // default values come from the theme
                bannerOverlayColor ?? theme.colorMain
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

export default injectIntl(BannerImageField);
