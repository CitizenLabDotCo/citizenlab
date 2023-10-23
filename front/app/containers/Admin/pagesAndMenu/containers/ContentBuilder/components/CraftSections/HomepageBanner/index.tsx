import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import InputMultilocWithLocaleSwitcherWrapper from 'components/UI/InputMultilocWithLocaleSwitcher';

// craft
import { useNode } from '@craftjs/core';

// hooks
import SignedOutHeader from 'containers/HomePage/SignedOutHeader';
import { IHomepageSettingsAttributes } from 'api/home_page/types';

type Props = {
  homepageSettings: IHomepageSettingsAttributes;
};

// export interface IHomepageSettingsAttributes extends IHomepageEnabledSettings {
//     banner_signed_out_header_multiloc: Multiloc;
//     bottom_info_section_multiloc: Multiloc;
//     projects_header_multiloc: Multiloc;
//     banner_layout: THomepageBannerLayout;
//     banner_signed_in_header_multiloc: Multiloc;
//     banner_signed_out_header_multiloc: Multiloc;
//     banner_signed_out_subheader_multiloc: Multiloc;
//     banner_signed_out_header_overlay_color: string | null;
//     // Number between 0 and 100, inclusive
//     banner_signed_out_header_overlay_opacity: number | null;
//     header_bg: ImageSizes | null;
//     pinned_admin_publication_ids: string[];
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
  console.log(homepageSettings);
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
    },
  }));

  return (
    <Box background="#ffffff" marginBottom="20px">
      <InputMultilocWithLocaleSwitcherWrapper
        type="text"
        valueMultiloc={homepageSettings.banner_signed_out_header_multiloc}
        onChange={(value) => {
          setProp(
            (props: Props) =>
              (props.homepageSettings.banner_signed_out_header_multiloc = value)
          );
        }}
      />
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
