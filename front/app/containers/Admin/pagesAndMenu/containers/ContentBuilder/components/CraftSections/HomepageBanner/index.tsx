import React from 'react';

// components
import { Box, Toggle, Button, colors } from '@citizenlab/cl2-component-library';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

// craft
import { useNode } from '@craftjs/core';

// hooks
import SignedOutHeader from 'containers/HomePage/SignedOutHeader';
import { IHomepageSettingsAttributes } from 'api/home_page/types';

import messages from '../../../messages';
import SignedInHeader from 'containers/HomePage/SignedInHeader';

type Props = {
  homepageSettings: IHomepageSettingsAttributes;
  variant: 'signedOut' | 'signedIn';
};

const HomepageBanner = ({ homepageSettings, variant }: Props) => {
  return variant === 'signedIn' ? (
    <SignedInHeader homepageSettings={homepageSettings} />
  ) : (
    <SignedOutHeader homepageSettings={homepageSettings} />
  );
};

const HomepageBannerSettings = () => {
  const {
    actions: { setProp },
    homepageSettings,
    variant = 'signedOut',
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
    },
  }));

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
              setProp((props: Props) => (props.variant = 'signedOut'));
            }}
            buttonStyle={variant === 'signedOut' ? 'white' : 'text'}
          >
            Signed out
          </Button>
        </Box>
        <Box flex="1">
          <Button
            onClick={() => {
              setProp((props: Props) => (props.variant = 'signedIn'));
            }}
            buttonStyle={variant === 'signedIn' ? 'white' : 'text'}
          >
            Signed in
          </Button>
        </Box>
      </Box>
      {variant === 'signedOut' && (
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
        </>
      )}
      {variant === 'signedIn' && (
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
