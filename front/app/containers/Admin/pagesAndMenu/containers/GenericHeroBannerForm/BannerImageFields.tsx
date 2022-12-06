import Cropper from 'react-easy-crop';
import 'react-image-crop/dist/ReactCrop.css';

import {
  Box,
  ColorPickerInput,
  IconTooltip,
  IOption,
  Label,
  Select,
} from '@citizenlab/cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import { ISubmitState } from 'components/admin/SubmitWrapper';
import { debounce } from 'lodash-es';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useTheme } from 'styled-components';
import { UploadFile } from 'typings';
import HeaderImageDropzone from './HeaderImageDropzone';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';

import { convertUrlToUploadFile } from 'utils/fileUtils';
import { isNil, isNilOrError } from 'utils/helperUtils';

import { ICustomPageAttributes } from 'services/customPages';
import { IHomepageSettingsAttributes } from 'services/homepageSettings';

import RangeInput from 'components/UI/RangeInput';

export type PreviewDevice = 'mobile' | 'tablet' | 'desktop';

interface Props {
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
    | ICustomPageAttributes['banner_layout']
    | 'fixed_ratio';
  headerBg:
    | IHomepageSettingsAttributes['header_bg']
    | ICustomPageAttributes['header_bg'];
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
  onOverlayOpacityChange,
}: Props & WrappedComponentProps) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    15
  );

  const debouncedHandleOverlayOpacityOnChange = useMemo(
    () => debounceHandleOverlayOpacityOnChange,
    [debounceHandleOverlayOpacityOnChange]
  );

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
                    href={formatMessage(messages.headerImageSupportPageURL)}
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
      {bannerLayout === 'fixed_ratio' && (
        <CropComponent
          headerLocalDisplayImage={headerLocalDisplayImage}
          onRemoveImage={bannerImageRemoveHandler}
          onAddImage={bannerImageAddHandler}
        />
      )}
      {bannerLayout !== 'fixed_ratio' && (
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
      )}
      {/* We only allow the overlay for the full-width banner layout for the moment. */}
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

export default injectIntl(BannerImageField);

type CropComponentProps = {
  headerLocalDisplayImage: UploadFile[] | null;
  onRemoveImage: () => void;
  onAddImage: (newImage: UploadFile[]) => void;
};

const CropComponent = ({
  headerLocalDisplayImage,
  onRemoveImage,
  onAddImage,
}: CropComponentProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  const remoteImage =
    !headerLocalDisplayImage ||
    (headerLocalDisplayImage && headerLocalDisplayImage[0].remote);

  const displayImageHeaderDropzone = remoteImage;
  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    if (headerLocalDisplayImage) {
      try {
        const croppedImage = await getCroppedImg(
          headerLocalDisplayImage[0].base64,
          croppedAreaPixels
        );

        setCroppedImage(croppedImage);
      } catch (e) {
        console.error(e);
      }
    }
  }, [croppedAreaPixels, headerLocalDisplayImage]);

  const bannerImageRemoveHandler = () => {
    onRemoveImage();
    setCroppedImage(null);
  };

  return (
    <div>
      <div style={{ position: 'relative', height: '300px' }}>
        {displayImageHeaderDropzone && (
          <HeaderImageDropzone
            onAdd={onAddImage}
            onRemove={bannerImageRemoveHandler}
            overlayColor={null}
            overlayOpacity={null}
            headerError={null}
            header_bg={headerLocalDisplayImage}
            previewDevice={'desktop'}
            layout={'full_width_banner_layout'}
          />
        )}
        {!displayImageHeaderDropzone && (
          <Cropper
            image={headerLocalDisplayImage[0].base64}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            showGrid={false}
          />
        )}
      </div>
      <button onClick={showCroppedImage}>show</button>
      {croppedImage && <img src={croppedImage} alt="" />}
    </div>
  );
};

export const createImage = (url: string): Promise<any> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Record<string, any>
): Promise<any> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // set canvas size to match the bounding box
  canvas.width = image.width;
  canvas.height = image.height;

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(image.width / 2, image.height / 2);

  ctx.scale(1, 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  // draw rotated image
  ctx.drawImage(image, 0, 0);

  // croppedAreaPixels values are bounding box relative
  // extract the cropped image using these values
  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  );

  // set canvas width to final desired crop size - this will clear existing context
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // paste generated rotate image at the top left corner
  ctx.putImageData(data, 0, 0);

  // As Base64 string
  return canvas.toDataURL('image/jpeg');
}
