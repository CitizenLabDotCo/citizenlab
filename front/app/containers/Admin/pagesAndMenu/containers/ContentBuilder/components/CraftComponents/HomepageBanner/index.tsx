import React, { useEffect, useState, useCallback } from 'react';

// components
import {
  Box,
  Toggle,
  Button,
  colors,
  Radio,
  Label,
  Input,
  Text,
} from '@citizenlab/cl2-component-library';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import Error from 'components/UI/Error';
import homepageMessages from 'containers/HomePage/messages';

// craft
import { useNode } from '@craftjs/core';

// hooks
import SignedOutHeader from 'containers/HomePage/SignedOutHeader';

import messages from './messages';
import SignedInHeader from 'containers/HomePage/SignedInHeader';
import { useLocation, useSearchParams } from 'react-router-dom';
import {
  CTASignedInType,
  CTASignedOutType,
  THomepageBannerLayout,
} from 'api/home_page/types';
import { Multiloc, UploadFile } from 'typings';
import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';
import { isValidUrl } from 'utils/validate';
import {
  CONTENT_BUILDER_ERROR_EVENT,
  IMAGE_UPLOADING_EVENT,
} from 'components/admin/ContentBuilder/constants';
import eventEmitter from 'utils/eventEmitter';
import LayoutSettingField from './LayoutSettingField';
import OverlayControls from './OverlayControls';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import useAddContentBuilderImage from 'api/content_builder_images/useAddContentBuilderImage';
import ImageCropperContainer from 'components/admin/ImageCropper/Container';
import useAuthUser from 'api/me/useAuthUser';
import Fragment from 'components/Fragment';
import useLocale from 'hooks/useLocale';

const CTA_SIGNED_OUT_TYPES: CTASignedOutType[] = [
  'sign_up_button',
  'no_button',
  'customized_button',
];

const CTA_SIGNED_IN_TYPES: CTASignedInType[] = [
  'no_button',
  'customized_button',
];

export interface IHomepageSettingsAttributes {
  banner_layout: THomepageBannerLayout;

  // signed_out
  banner_signed_out_header_multiloc: Multiloc;
  banner_signed_out_subheader_multiloc: Multiloc;
  banner_signed_out_header_overlay_color: string | null;
  // Number between 0 and 100, inclusive
  banner_signed_out_header_overlay_opacity: number | null;
  banner_avatars_enabled: boolean;
  // cta_signed_out
  banner_cta_signed_out_text_multiloc: Multiloc;
  banner_cta_signed_out_type: CTASignedOutType;
  banner_cta_signed_out_url: string | null;
  // signed_in
  banner_signed_in_header_multiloc: Multiloc;
  banner_signed_in_header_overlay_color?: string | null;
  // Number between 0 and 100, inclusive
  banner_signed_in_header_overlay_opacity?: number | null;
  // cta_signed_in
  banner_cta_signed_in_text_multiloc: Multiloc;
  banner_cta_signed_in_type: CTASignedInType;
  banner_cta_signed_in_url: string | null;
}

type ErrorType = 'banner_cta_signed_out_url' | 'banner_cta_signed_in_url';

type Props = {
  homepageSettings: IHomepageSettingsAttributes;
  image?: {
    dataCode?: string;
    imageUrl?: string;
  };
  hasError?: boolean;
  errors?: ErrorType[];
};

const HomepageBanner = ({ homepageSettings, image }: Props) => {
  const { pathname } = useLocation();
  const { data: authUser } = useAuthUser();
  const [search] = useSearchParams();
  const locale = useLocale();

  const isHomepage = pathname === `/${locale}` || pathname === `/${locale}/`;
  const showSignedInHeader =
    (isHomepage && authUser?.data !== undefined) ||
    search.get('variant') === 'signedIn';

  console.log(isHomepage);
  return (
    <div data-cy="e2e-homepage-banner">
      {showSignedInHeader ? (
        <SignedInHeader
          homepageSettings={{
            ...homepageSettings,
            header_bg: {
              large: image?.imageUrl || null,
              medium: image?.imageUrl || null,
              small: image?.imageUrl || null,
            },
          }}
          isContentBuilderDisplay={!isHomepage}
        />
      ) : (
        <Fragment name="signed-out-header">
          <SignedOutHeader
            homepageSettings={{
              ...homepageSettings,
              header_bg: {
                large: image?.imageUrl || null,
                medium: image?.imageUrl || null,
                small: image?.imageUrl || null,
              },
            }}
          />
        </Fragment>
      )}
    </div>
  );
};

const HomepageBannerSettings = () => {
  const {
    actions: { setProp },
    homepageSettings,
    id,
    image,
  } = useNode((node) => ({
    id: node.id,
    image: node.data.props.image,
    homepageSettings: {
      banner_signed_out_header_multiloc:
        node.data.props.homepageSettings.banner_signed_out_header_multiloc,
      banner_signed_out_subheader_multiloc:
        node.data.props.homepageSettings.banner_signed_out_subheader_multiloc,
      banner_signed_out_header_overlay_color:
        node.data.props.homepageSettings.banner_signed_out_header_overlay_color,
      banner_avatars_enabled:
        node.data.props.homepageSettings.banner_avatars_enabled,
      banner_signed_in_header_multiloc:
        node.data.props.homepageSettings.banner_signed_in_header_multiloc,
      banner_cta_signed_in_text_multiloc:
        node.data.props.homepageSettings.banner_cta_signed_in_text_multiloc,
      banner_cta_signed_in_type:
        node.data.props.homepageSettings.banner_cta_signed_in_type,
      banner_cta_signed_in_url:
        node.data.props.homepageSettings.banner_cta_signed_in_url,
      banner_cta_signed_out_text_multiloc:
        node.data.props.homepageSettings.banner_cta_signed_out_text_multiloc,
      banner_cta_signed_out_type:
        node.data.props.homepageSettings.banner_cta_signed_out_type,
      banner_cta_signed_out_url:
        node.data.props.homepageSettings.banner_cta_signed_out_url,
      banner_layout: node.data.props.homepageSettings.banner_layout,
      banner_signed_out_header_overlay_opacity:
        node.data.props.homepageSettings
          .banner_signed_out_header_overlay_opacity,
      banner_signed_in_header_overlay_opacity:
        node.data.props.homepageSettings
          .banner_signed_in_header_overlay_opacity,
      banner_signed_in_header_overlay_color:
        node.data.props.homepageSettings.banner_signed_in_header_overlay_color,
    },
  }));

  const [errors, setErrors] = useState<ErrorType[]>([]);
  const [hasError, setHasError] = useState(false);
  const [search, setSearchParams] = useSearchParams();
  const { formatMessage } = useIntl();

  const [imageFiles, setImageFiles] = useState<UploadFile[]>([]);
  const { mutateAsync: addContentBuilderImage } = useAddContentBuilderImage();
  const [initialRender, setInitialRender] = useState(true);

  useEffect(() => {
    if (image?.imageUrl && initialRender) {
      (async () => {
        eventEmitter.emit(IMAGE_UPLOADING_EVENT, true);
        const imageFile = await convertUrlToUploadFile(image?.imageUrl);
        if (imageFile) {
          setImageFiles([imageFile]);
        }
        eventEmitter.emit(IMAGE_UPLOADING_EVENT, false);
        setInitialRender(false);
      })();
    }
  }, [image?.imageUrl, initialRender]);

  const handleOnAdd = useCallback(
    async (base64: string) => {
      try {
        const response = await addContentBuilderImage(base64);
        setProp((props: Props) => {
          props.image = {
            dataCode: response.data.attributes.code,
            imageUrl: response.data.attributes.image_url,
          };
        });
      } catch {
        // Do nothing
      }
    },
    [addContentBuilderImage, setProp]
  );

  const handleOnRemove = () => {
    setProp((props: Props) => {
      props.image = {
        dataCode: undefined,
        imageUrl: undefined,
      };
    });
    setImageFiles([]);
  };

  const labelMessages: Record<CTASignedOutType, MessageDescriptor> = {
    customized_button: messages.customized_button,
    no_button: messages.no_button,
    sign_up_button: messages.sign_up_button,
  };

  const handleUrlChange = (
    value: string,
    field: 'banner_cta_signed_out_url' | 'banner_cta_signed_in_url'
  ) => {
    const validation = isValidUrl(value);
    setProp((props: Props) => (props.homepageSettings[field] = value));

    if (!validation) {
      const newErrorTypes = errors?.includes(field)
        ? [...errors]
        : [...(errors || []), field];

      setErrors(newErrorTypes);
      setHasError(true);

      eventEmitter.emit(CONTENT_BUILDER_ERROR_EVENT, {
        [id]: {
          hasError: true,
        },
      });
    } else {
      const newErrorTypes = errors?.filter((errorType) => errorType !== field);
      setErrors(newErrorTypes || []);
      if (newErrorTypes && newErrorTypes.length === 0) {
        setHasError(false);
        eventEmitter.emit(CONTENT_BUILDER_ERROR_EVENT, {
          [id]: {
            hasError: false,
          },
        });
      }
    }
  };

  const handleCtaTypeChange = (
    value: CTASignedOutType | CTASignedInType,
    field: 'banner_cta_signed_out_type' | 'banner_cta_signed_in_type'
  ) => {
    setProp((props: Props) => {
      if (field === 'banner_cta_signed_out_type') {
        props.homepageSettings[field] = value;
      } else {
        props.homepageSettings[field] = value as CTASignedInType;
      }
    });
    if (value !== 'customized_button') {
      const newErrorTypes = errors?.filter(
        (errorType) =>
          errorType !==
          (field === 'banner_cta_signed_out_type'
            ? 'banner_cta_signed_out_url'
            : 'banner_cta_signed_in_url')
      );
      setErrors(newErrorTypes || []);
      if (newErrorTypes && newErrorTypes.length === 0) {
        setHasError(false);
        eventEmitter.emit(CONTENT_BUILDER_ERROR_EVENT, {
          [id]: {
            hasError: false,
          },
        });
      }
      setProp((props: Props) => {
        props.homepageSettings[
          field === 'banner_cta_signed_out_type'
            ? 'banner_cta_signed_out_url'
            : 'banner_cta_signed_in_url'
        ] = '';
      });
    }
  };

  return (
    <Box
      background="#ffffff"
      mb="40px"
      display="flex"
      flexDirection="column"
      gap="16px"
    >
      <LayoutSettingField
        bannerLayout={homepageSettings.banner_layout}
        onChange={(value) => {
          setProp(
            (props: Props) =>
              (props.homepageSettings.banner_layout =
                value as THomepageBannerLayout)
          );
        }}
      />
      <div data-cy="e2e-banner-avatar-toggle">
        <Toggle
          label={
            <Box>
              <Text m={'0px'} color="primary">
                {formatMessage(messages.showAvatars)}
              </Text>
              <Text m={'0px'} color="textSecondary" fontSize="s">
                {formatMessage(messages.showAvatarsDescription)}
              </Text>
            </Box>
          }
          checked={homepageSettings.banner_avatars_enabled}
          onChange={() => {
            setProp(
              (props: Props) =>
                (props.homepageSettings.banner_avatars_enabled =
                  !homepageSettings.banner_avatars_enabled)
            );
          }}
        />
      </div>

      <Label htmlFor="bannerImage">{formatMessage(messages.bannerImage)}</Label>
      {homepageSettings.banner_layout === 'fixed_ratio_layout' &&
      imageFiles.length > 0 ? (
        <ImageCropperContainer
          image={imageFiles[0] || null}
          onComplete={handleOnAdd}
          aspectRatioWidth={3}
          aspectRatioHeight={1}
          onRemove={handleOnRemove}
        />
      ) : (
        <ImagesDropzone
          id="bannerImage"
          images={imageFiles}
          imagePreviewRatio={1 / 2}
          maxImagePreviewWidth="360px"
          objectFit="contain"
          acceptedFileTypes={{
            'image/*': ['.jpg', '.jpeg', '.png'],
          }}
          onAdd={(images) => {
            setImageFiles(images);
            handleOnAdd(images[0].base64);
          }}
          onRemove={handleOnRemove}
        />
      )}

      <Box
        display="flex"
        borderRadius="3px"
        p="4px"
        background={colors.grey400}
      >
        <Box flex="1">
          <Button
            onClick={() => {
              setSearchParams({ variant: 'signedOut' });
            }}
            buttonStyle={
              search.get('variant') !== 'signedIn' ? 'white' : 'text'
            }
            fontSize="14px"
            id="e2e-signed-out-button"
          >
            {formatMessage(messages.nonRegistedredUsersView)}
          </Button>
        </Box>
        <Box flex="1">
          <Button
            onClick={() => {
              setSearchParams({ variant: 'signedIn' });
            }}
            buttonStyle={
              search.get('variant') === 'signedIn' ? 'white' : 'text'
            }
            fontSize="14px"
            id="e2e-signed-in-button"
          >
            {formatMessage(messages.registeredUsersView)}
          </Button>
        </Box>
      </Box>

      {search.get('variant') !== 'signedIn' && (
        <>
          <Text m={'0px'} color="textSecondary">
            {formatMessage(messages.signedOutDescription)}
          </Text>
          {homepageSettings.banner_layout !== 'two_row_layout' && (
            <OverlayControls
              variant="signedOut"
              bannerOverlayColor={
                homepageSettings.banner_signed_out_header_overlay_color
              }
              bannerOverlayOpacity={
                homepageSettings.banner_signed_out_header_overlay_opacity
              }
              onOverlayChange={(opacity, color) => {
                setProp((props: Props) => {
                  props.homepageSettings.banner_signed_out_header_overlay_color =
                    color;
                  props.homepageSettings.banner_signed_out_header_overlay_opacity =
                    opacity;
                });
              }}
            />
          )}
          <div data-cy="e2e-signed-out-header-section">
            <InputMultilocWithLocaleSwitcher
              label={formatMessage(messages.bannerText)}
              placeholder={formatMessage(homepageMessages.titleCity)}
              type="text"
              valueMultiloc={homepageSettings.banner_signed_out_header_multiloc}
              onChange={(value) => {
                setProp(
                  (props: Props) =>
                    (props.homepageSettings.banner_signed_out_header_multiloc =
                      value)
                );
              }}
            />
          </div>
          <div data-cy="e2e-signed-out-subheader-section">
            <InputMultilocWithLocaleSwitcher
              label={formatMessage(messages.bannerSubtext)}
              placeholder={formatMessage(homepageMessages.subtitleCity)}
              type="text"
              valueMultiloc={
                homepageSettings.banner_signed_out_subheader_multiloc
              }
              onChange={(value) => {
                setProp(
                  (props: Props) =>
                    (props.homepageSettings.banner_signed_out_subheader_multiloc =
                      value)
                );
              }}
            />
          </div>
          <Label>{formatMessage(messages.button)}</Label>
          {CTA_SIGNED_OUT_TYPES.map((option: CTASignedOutType) => {
            const labelMessage = labelMessages[option];
            return (
              <div key={option}>
                <Radio
                  key={`cta-type-${option}`}
                  onChange={(value) =>
                    handleCtaTypeChange(value, 'banner_cta_signed_out_type')
                  }
                  currentValue={homepageSettings.banner_cta_signed_out_type}
                  value={option}
                  label={<FormattedMessage {...labelMessage} />}
                  id={`cta-type-${option}`}
                  name={`cta-type-${option}`}
                />
                {option === 'customized_button' &&
                  homepageSettings.banner_cta_signed_out_type ===
                    'customized_button' && (
                    <Box ml="28px">
                      <Box mb="20px">
                        <InputMultilocWithLocaleSwitcher
                          id="customizedButtonText"
                          type="text"
                          valueMultiloc={
                            homepageSettings.banner_cta_signed_out_text_multiloc
                          }
                          label={
                            <FormattedMessage
                              {...messages.customized_button_text_label}
                            />
                          }
                          onChange={(value) =>
                            setProp(
                              (props: Props) =>
                                (props.homepageSettings.banner_cta_signed_out_text_multiloc =
                                  value)
                            )
                          }
                        />
                      </Box>
                      <Label htmlFor="buttonConfigInput">
                        <FormattedMessage
                          {...messages.customized_button_url_label}
                        />
                      </Label>
                      <Input
                        id="customizedButtonUrl"
                        type="text"
                        placeholder="https://..."
                        onChange={(value) =>
                          handleUrlChange(value, 'banner_cta_signed_out_url')
                        }
                        value={homepageSettings.banner_cta_signed_out_url || ''}
                      />
                      {hasError &&
                        errors.includes('banner_cta_signed_out_url') && (
                          <Error
                            marginTop="8px"
                            text={formatMessage(messages.invalidUrl)}
                          />
                        )}
                    </Box>
                  )}
              </div>
            );
          })}
        </>
      )}

      {search.get('variant') === 'signedIn' && (
        <>
          <Text m={'0px'} color="textSecondary">
            {formatMessage(messages.signedInDescription)}
          </Text>
          <OverlayControls
            variant="signedIn"
            noOpacitySlider={
              homepageSettings.banner_layout === 'fixed_ratio_layout'
            }
            bannerOverlayColor={
              homepageSettings.banner_signed_in_header_overlay_color
            }
            bannerOverlayOpacity={
              homepageSettings.banner_signed_in_header_overlay_opacity
            }
            onOverlayChange={(opacity, color) => {
              setProp((props: Props) => {
                props.homepageSettings.banner_signed_in_header_overlay_color =
                  color;
                props.homepageSettings.banner_signed_in_header_overlay_opacity =
                  opacity;
              });
            }}
          />
          <div data-cy="e2e-signed-in-header-section">
            <InputMultilocWithLocaleSwitcher
              label={'Header'}
              type="text"
              placeholder={formatMessage(
                homepageMessages.defaultSignedInMessage
              )}
              valueMultiloc={homepageSettings.banner_signed_in_header_multiloc}
              onChange={(value) => {
                setProp((props: Props) => {
                  props.homepageSettings.banner_signed_in_header_multiloc =
                    value;
                  props.homepageSettings.banner_cta_signed_in_url = '';
                  const newErrorTypes = props.errors?.filter(
                    (errorType) => errorType !== 'banner_cta_signed_in_url'
                  );
                  props.errors = newErrorTypes || [];
                  if (newErrorTypes && newErrorTypes.length === 0) {
                    props.hasError = false;
                    eventEmitter.emit(CONTENT_BUILDER_ERROR_EVENT, {
                      [id]: {
                        hasError: false,
                      },
                    });
                  }
                });
              }}
            />
          </div>
          <Label>{formatMessage(messages.button)}</Label>
          {CTA_SIGNED_IN_TYPES.map((option: CTASignedInType) => {
            const labelMessage = labelMessages[option];
            return (
              <div key={option}>
                <Radio
                  key={`cta-type-${option}`}
                  onChange={(value) =>
                    handleCtaTypeChange(value, 'banner_cta_signed_in_type')
                  }
                  currentValue={homepageSettings.banner_cta_signed_in_type}
                  value={option}
                  label={<FormattedMessage {...labelMessage} />}
                  name={`cta-type-${option}`}
                  id={`cta-type-${option}`}
                />
                {option === 'customized_button' &&
                  homepageSettings.banner_cta_signed_in_type ===
                    'customized_button' && (
                    <Box ml="28px">
                      <Box mb="20px">
                        <InputMultilocWithLocaleSwitcher
                          id="customizedButtonText"
                          type="text"
                          valueMultiloc={
                            homepageSettings.banner_cta_signed_in_text_multiloc
                          }
                          label={
                            <FormattedMessage
                              {...messages.customized_button_text_label}
                            />
                          }
                          onChange={(value) => {
                            setProp(
                              (props: Props) =>
                                (props.homepageSettings.banner_cta_signed_in_text_multiloc =
                                  value)
                            );
                          }}
                        />
                      </Box>
                      <Label htmlFor="buttonConfigInput">
                        <FormattedMessage
                          {...messages.customized_button_url_label}
                        />
                      </Label>
                      <Input
                        id="customizedButtonUrl"
                        data-testid="buttonConfigInput"
                        type="text"
                        placeholder="https://..."
                        onChange={(value) =>
                          handleUrlChange(value, 'banner_cta_signed_in_url')
                        }
                        value={homepageSettings.banner_cta_signed_in_url || ''}
                      />

                      {hasError &&
                        errors.includes('banner_cta_signed_in_url') && (
                          <Error
                            marginTop="8px"
                            text={formatMessage(messages.invalidUrl)}
                          />
                        )}
                    </Box>
                  )}
              </div>
            );
          })}
        </>
      )}
    </Box>
  );
};

HomepageBanner.craft = {
  props: {
    homepageSettings: {
      banner_signed_out_header_multiloc: {},
      banner_signed_out_subheader_multiloc: {},
      banner_avatars_enabled: true,
    },
  },
  related: {
    settings: HomepageBannerSettings,
  },
  rules: {
    canDrag: () => false,
  },
  custom: {
    title: messages.homepageBannerTitle,
    noPointerEvents: true,
    noDelete: true,
  },
};

export default HomepageBanner;
