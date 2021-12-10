import React from 'react';

// components
import { Radio, Box } from 'cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';

import FullWidthBannerLayoutActive from './layout_previews/full_width_banner_layout_active.jpg';
import Layout2Active from './layout_previews/layout2_active.jpg';
import Layout3Active from './layout_previews/layout3_active.jpg';
import FullWidthBannerLayoutInactive from './layout_previews/full_width_banner_layout_inactive.jpg';
import Layout2Inactive from './layout_previews/layout2_inactive.jpg';
import Layout3Inactive from './layout_previews/layout3_inactive.jpg';

// style
import styled from 'styled-components';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

import {
  THomepageBannerLayout,
  TAppConfigurationSetting,
  IAppConfigurationSettings,
} from 'services/appConfiguration';

const LayoutPreview = styled.img`
  width: 200px;
`;

const LayoutOption = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  margin-right: 20px;
`;

interface Props {
  latestAppConfigSettings:
    | IAppConfigurationSettings
    | Partial<IAppConfigurationSettings>;
  handleOnChange: (
    settingName: TAppConfigurationSetting
  ) => (settingKey: string, settingValue: any) => void;
}

const LayoutSetting = ({ latestAppConfigSettings, handleOnChange }: Props) => {
  const handleLayoutOnChange = (layout: THomepageBannerLayout) => {
    handleOnChange('customizable_homepage_banner')('layout', layout);
  };

  const homepageBannerLayout =
    latestAppConfigSettings.customizable_homepage_banner?.layout;
  return (
    <SectionField key="layout">
      <SubSectionTitle>
        <FormattedMessage {...messages.chooseLayout} />
      </SubSectionTitle>
      <Box display="flex">
        <LayoutOption>
          <Radio
            onChange={handleLayoutOnChange}
            currentValue={homepageBannerLayout}
            value="full_width_banner_layout"
            name="homepage-banner-layout"
            id="homepage-banner-layout-1"
            label={<FormattedMessage {...messages.layout1} />}
          />
          <LayoutPreview
            src={
              homepageBannerLayout === 'full_width_banner_layout'
                ? FullWidthBannerLayoutActive
                : FullWidthBannerLayoutInactive
            }
          />
        </LayoutOption>
        <LayoutOption>
          <Radio
            onChange={handleLayoutOnChange}
            currentValue={homepageBannerLayout}
            value="layout_2"
            name="homepage-banner-layout"
            id="homepage-banner-layout-2"
            label={<FormattedMessage {...messages.layout2} />}
          />
          <LayoutPreview
            src={
              homepageBannerLayout === 'layout_2'
                ? Layout2Active
                : Layout2Inactive
            }
          />
        </LayoutOption>
        <LayoutOption>
          <Radio
            onChange={handleLayoutOnChange}
            currentValue={homepageBannerLayout}
            value="layout_3"
            name="homepage-banner-layout"
            id="homepage-banner-layout-3"
            label={<FormattedMessage {...messages.layout3} />}
          />
          <LayoutPreview
            src={
              homepageBannerLayout === 'layout_3'
                ? Layout3Active
                : Layout3Inactive
            }
          />
        </LayoutOption>
      </Box>
      {/* <Error apiErrors={apiErrors && apiErrors.voting_method} /> */}
    </SectionField>
  );
};

export default LayoutSetting;
