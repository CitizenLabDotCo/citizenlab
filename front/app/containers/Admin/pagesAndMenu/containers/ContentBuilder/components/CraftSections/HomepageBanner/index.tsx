import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

// craft
import { useNode } from '@craftjs/core';

// hooks
import SignedOutHeader from 'containers/HomePage/SignedOutHeader';
import { IHomepageSettingsAttributes } from 'api/home_page/types';

type Props = {
  homepageSettings: IHomepageSettingsAttributes;
};

// export interface IHomepageSettingsAttributes extends IHomepageEnabledSettings {
//     bottom_info_section_multiloc: Multiloc; // covered by content builder
//     projects_header_multiloc: Multiloc; // covered by content builder
//     banner_layout: THomepageBannerLayout;

//     banner_signed_out_header_overlay_color: string | null;
//     // Number between 0 and 100, inclusive
//     banner_signed_out_header_overlay_opacity: number | null;
//     header_bg: ImageSizes | null;

//     banner_signed_in_header_multiloc: Multiloc;
//     banner_cta_signed_in_text_multiloc: Multiloc;
//     banner_cta_signed_in_type: CTASignedInType;
//     banner_cta_signed_in_url: string | null;
//     // cta_signed_out
//     banner_cta_signed_out_text_multiloc: Multiloc;
//     banner_cta_signed_out_type: CTASignedOutType;
//     banner_cta_signed_out_url: string | null;
//     // content builder
//     craftjs_json: Record<string, SerializedNode>;
//   }

const HomepageBanner = ({ homepageSettings }: Props) => {
  return <SignedOutHeader homepageSettings={homepageSettings} />;
};

const HomepageBannerSettings = () => {
  const {
    actions: { setProp },
    homepageSettings,
  } = useNode((node) => ({
    homepageSettings: {
      banner_signed_out_header_multiloc:
        node.data.props.homepageSettings.banner_signed_out_header_multiloc,
      banner_signed_out_subheader_multiloc:
        node.data.props.homepageSettings.banner_signed_out_subheader_multiloc,
      banner_signed_out_header_overlay_color:
        node.data.props.homepageSettings.banner_signed_out_header_overlay_color,
    },
  }));

  // const [overlayEnabled, setOverlayEnabled] = useState(
  //   typeof homepageSettings.banner_signed_out_header_overlay_color === 'number'
  // );

  return (
    <Box
      background="#ffffff"
      my="40px"
      display="flex"
      flexDirection="column"
      gap="16px"
    >
      <InputMultilocWithLocaleSwitcher
        label={'Header'}
        type="text"
        valueMultiloc={homepageSettings.banner_signed_out_header_multiloc}
        onChange={(value) => {
          setProp(
            (props: Props) =>
              (props.homepageSettings.banner_signed_out_header_multiloc = value)
          );
        }}
      />
      <InputMultilocWithLocaleSwitcher
        label={'Subheader'}
        type="text"
        valueMultiloc={homepageSettings.banner_signed_out_subheader_multiloc}
        onChange={(value) => {
          setProp(
            (props: Props) =>
              (props.homepageSettings.banner_signed_out_subheader_multiloc =
                value)
          );
        }}
      />
      {/* <>
      <Box>
        <Toggle
          id="overlay-toggle"
          onChange={handleOverlayEnabling}
          checked={overlayEnabled}
          label={
            <Text as="span" color="blue500">
              {formatMessage(messages.overlayToggleLabel)}
            </Text>
          }
        />
      </Box>
      {overlayEnabled &&
        typeof bannerOverlayOpacity === 'number' &&
        bannerOverlayColor && (
        
            <Box mb="36px">
              <ColorPickerInput
                id="image-overlay-color"
                label={formatMessage(messages.imageOverlayColor)}
                type="text"
                value={bannerOverlayColor}
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
              value={bannerOverlayOpacity}
              onChange={debouncedHandleOverlayOpacityOnChange}
            />
  
        )}
    </> */}
    </Box>
  );
};

HomepageBanner.craft = {
  props: {
    homepageSettings: { banner_signed_out_header_multiloc: {} },
  },
  related: {
    settings: HomepageBannerSettings,
  },
};

export default HomepageBanner;
