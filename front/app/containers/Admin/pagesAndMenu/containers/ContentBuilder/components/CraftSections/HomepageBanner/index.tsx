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
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

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
  banner_signed_in_header_multiloc: Multiloc;
  banner_signed_out_header_multiloc: Multiloc;
  banner_signed_out_subheader_multiloc: Multiloc;
  banner_signed_out_header_overlay_color: string | null;
  // Number between 0 and 100, inclusive
  banner_signed_out_header_overlay_opacity: number | null;
  header_bg: ImageSizes | null;
  banner_cta_signed_in_text_multiloc: Multiloc;
  banner_cta_signed_in_type: CTASignedInType;
  banner_cta_signed_in_url: string | null;
  // cta_signed_out
  banner_cta_signed_out_text_multiloc: Multiloc;
  banner_cta_signed_out_type: CTASignedOutType;
  banner_cta_signed_out_url: string | null;
  banner_avatars_enabled: boolean;
}

type Props = {
  homepageSettings: IHomepageSettingsAttributes;
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
  } = useNode((node) => ({
    variant: node.data.props.variant,
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
    },
  }));

  const [search, setSearchParams] = useSearchParams();
  return (
    <Box
      background="#ffffff"
      my="40px"
      display="flex"
      flexDirection="column"
      gap="16px"
    >
      <Toggle
        label="Show avatars"
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
          >
            Signed out
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
          >
            Signed in
          </Button>
        </Box>
      </Box>

      {search.get('variant') !== 'signedIn' && (
        <>
          <InputMultilocWithLocaleSwitcher
            label={'Header'}
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
            label={'Subheader'}
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
          <Text>Button</Text>
          {CTA_SIGNED_OUT_TYPES.map((option: CTASignedOutType) => {
            const labelMessages: Record<CTASignedOutType, MessageDescriptor> = {
              customized_button: messages.customized_button,
              no_button: messages.no_button,
              sign_up_button: messages.sign_up_button,
            };
            const labelMessage = labelMessages[option];
            return (
              <div key={option}>
                <Radio
                  key={`cta-type-${option}`}
                  onChange={(value) => {
                    setProp(
                      (props: Props) =>
                        (props.homepageSettings.banner_cta_signed_out_type =
                          value)
                    );
                  }}
                  currentValue={homepageSettings.banner_cta_signed_out_type}
                  value={option}
                  label={<FormattedMessage {...labelMessage} />}
                  name={'cta_${identifier}_type'}
                  id={`cta-type-${option}`}
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
                        {/* 
                        <Error
                          fieldName={buttonTextMultilocFieldName}
                          apiErrors={apiErrors?.[buttonTextMultilocFieldName]}
                        /> */}
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
                          setProp(
                            (props: Props) =>
                              (props.homepageSettings.banner_cta_signed_out_url =
                                value)
                          )
                        }
                        value={homepageSettings.banner_cta_signed_out_url || ''}
                      />
                      {/* <Error
                        fieldName={buttonUrlFieldName}
                        apiErrors={apiErrors?.[buttonUrlFieldName]}
                      /> */}
                    </Box>
                  )}
              </div>
            );
          })}
        </>
      )}

      {search.get('variant') === 'signedIn' && (
        <>
          <InputMultilocWithLocaleSwitcher
            label={'Header'}
            type="text"
            valueMultiloc={homepageSettings.banner_signed_in_header_multiloc}
            onChange={(value) => {
              setProp(
                (props: Props) =>
                  (props.homepageSettings.banner_signed_in_header_multiloc =
                    value)
              );
            }}
          />
          <Text>Button</Text>
          {CTA_SIGNED_IN_TYPES.map((option: CTASignedInType) => {
            const labelMessages: Record<CTASignedInType, MessageDescriptor> = {
              customized_button: messages.customized_button,
              no_button: messages.no_button,
            };
            const labelMessage = labelMessages[option];
            return (
              <div key={option}>
                <Radio
                  key={`cta-type-${option}`}
                  onChange={(value) => {
                    setProp(
                      (props: Props) =>
                        (props.homepageSettings.banner_cta_signed_in_type =
                          value)
                    );
                  }}
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
                          onChange={(value) =>
                            setProp(
                              (props: Props) =>
                                (props.homepageSettings.banner_cta_signed_in_text_multiloc =
                                  value)
                            )
                          }
                        />
                        {/* 
                        <Error
                          fieldName={buttonTextMultilocFieldName}
                          apiErrors={apiErrors?.[buttonTextMultilocFieldName]}
                        /> */}
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
                          setProp(
                            (props: Props) =>
                              (props.homepageSettings.banner_cta_signed_in_url =
                                value)
                          )
                        }
                        value={homepageSettings.banner_cta_signed_in_url || ''}
                      />
                      {/* <Error
                        fieldName={buttonUrlFieldName}
                        apiErrors={apiErrors?.[buttonUrlFieldName]}
                      /> */}
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
  custom: {
    title: messages.homepageBannerTitle,
    noPointerEvents: true,
  },
};

export default HomepageBanner;
