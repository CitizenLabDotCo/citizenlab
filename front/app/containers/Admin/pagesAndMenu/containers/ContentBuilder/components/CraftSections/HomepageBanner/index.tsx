import React from 'react';

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
import { useSearchParams } from 'react-router-dom';
import {
  CTASignedInType,
  CTASignedOutType,
  THomepageBannerLayout,
} from 'api/home_page/types';
import { ImageSizes, Multiloc } from 'typings';
import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';
import { isValidUrl } from 'utils/validate';
import { CONTENT_BUILDER_ERROR_EVENT } from 'components/admin/ContentBuilder/constants';
import eventEmitter from 'utils/eventEmitter';
import LayoutSettingField from './LayoutSettingField';
import OverlayControls from './OverlayControls';

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
  header_bg: ImageSizes | null;

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
  hasError?: boolean;
  errors?: ErrorType[];
};

const HomepageBanner = ({ homepageSettings }: Props) => {
  const [search] = useSearchParams();

  return search.get('variant') === 'signedIn' ? (
    <SignedInHeader homepageSettings={homepageSettings} />
  ) : (
    <SignedOutHeader homepageSettings={homepageSettings} />
  );
};

const HomepageBannerSettings = () => {
  const {
    actions: { setProp },
    homepageSettings,
    id,
    hasError,
    errors,
  } = useNode((node) => ({
    id: node.id,
    hasError: node.data.props.hasError,
    errors: node.data.props.errors,
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

  const [search, setSearchParams] = useSearchParams();
  const { formatMessage } = useIntl();

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
      setProp((props: Props) => {
        const newErrorTypes = props.errors?.includes(field)
          ? [...props.errors]
          : [...(props.errors || []), field];

        props.errors = newErrorTypes;
        props.hasError = true;
        eventEmitter.emit(CONTENT_BUILDER_ERROR_EVENT, {
          [id]: {
            hasError: true,
          },
        });
      });
    } else {
      setProp((props: Props) => {
        const newErrorTypes = props.errors?.filter(
          (errorType) => errorType !== field
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
      setProp((props: Props) => {
        props.homepageSettings[
          field === 'banner_cta_signed_out_type'
            ? 'banner_cta_signed_out_url'
            : 'banner_cta_signed_in_url'
        ] = '';
        const newErrorTypes = props.errors?.filter(
          (errorType) =>
            errorType !==
            (field === 'banner_cta_signed_out_type'
              ? 'banner_cta_signed_out_url'
              : 'banner_cta_signed_in_url')
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
          >
            {formatMessage(messages.registeredUsersView)}
          </Button>
        </Box>
      </Box>

      {search.get('variant') !== 'signedIn' && (
        <>
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
          <Text m={'0px'}>{formatMessage(messages.button)}</Text>
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
                          data-testid="inputMultilocLocaleSwitcher"
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
                        id="buttonConfigInput"
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
          <InputMultilocWithLocaleSwitcher
            label={'Header'}
            type="text"
            placeholder={formatMessage(homepageMessages.defaultSignedInMessage)}
            valueMultiloc={homepageSettings.banner_signed_in_header_multiloc}
            onChange={(value) => {
              setProp((props: Props) => {
                props.homepageSettings.banner_signed_in_header_multiloc = value;
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
          <Text m="0px">{formatMessage(messages.button)}</Text>
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
                          data-testid="inputMultilocLocaleSwitcher"
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
                        id="buttonConfigInput"
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
