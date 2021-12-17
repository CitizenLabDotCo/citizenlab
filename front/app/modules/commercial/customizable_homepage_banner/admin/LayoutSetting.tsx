import React from 'react';

// components
import { Radio, Box, fontSizes } from 'cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';

import FullWidthBannerLayoutActive from './layout_previews/full_width_banner_layout_active.jpg';
import TwoColumnLayoutActive from './layout_previews/two_column_layout_active.jpg';
import TwoRowLayoutActive from './layout_previews/two_row_layout_active.jpg';
import FullWidthBannerLayoutInactive from './layout_previews/full_width_banner_layout_inactive.jpg';
import TwoColumnLayoutInactive from './layout_previews/two_column_layout_inactive.jpg';
import TwoRowLayoutInactive from './layout_previews/two_row_layout_inactive.jpg';

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

const LayoutOption = styled.label`
  display: flex;
  flex-direction: column;
  align-items: start;
  margin-right: 20px;
  font-size: ${fontSizes.base}px;
  cursor: pointer;
`;

const LayoutOptionTop = styled.div`
  display: flex;
  align-items: center;
`;

const LayoutOptionTextWrapper = styled.div`
  margin-bottom: 9px;
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
          <LayoutOptionTop>
            <Radio
              onChange={handleLayoutOnChange}
              currentValue={homepageBannerLayout}
              value="full_width_banner_layout"
              name="homepage-banner-layout"
              id="homepage-banner-full-width-banner-layout"
            />
            <LayoutOptionTextWrapper>
              <FormattedMessage {...messages.fullWidthBannerLayout} />
            </LayoutOptionTextWrapper>
          </LayoutOptionTop>
          <LayoutPreview
            src={
              homepageBannerLayout === 'full_width_banner_layout'
                ? FullWidthBannerLayoutActive
                : FullWidthBannerLayoutInactive
            }
          />
        </LayoutOption>
        <LayoutOption>
          <LayoutOptionTop>
            <Radio
              onChange={handleLayoutOnChange}
              currentValue={homepageBannerLayout}
              value="two_column_layout"
              name="homepage-banner-layout"
              id="homepage-banner-two-column-layout"
            />
            <LayoutOptionTextWrapper>
              <FormattedMessage {...messages.TwoColumnLayout} />
            </LayoutOptionTextWrapper>
          </LayoutOptionTop>
          <LayoutPreview
            src={
              homepageBannerLayout === 'two_column_layout'
                ? TwoColumnLayoutActive
                : TwoColumnLayoutInactive
            }
          />
        </LayoutOption>
        <LayoutOption>
          <LayoutOptionTop>
            <Radio
              onChange={handleLayoutOnChange}
              currentValue={homepageBannerLayout}
              value="two_row_layout"
              name="homepage-banner-layout"
              id="homepage-banner-two-row-layout"
            />
            <LayoutOptionTextWrapper>
              <FormattedMessage {...messages.twoRowLayout} />
            </LayoutOptionTextWrapper>
          </LayoutOptionTop>
          <LayoutPreview
            src={
              homepageBannerLayout === 'two_row_layout'
                ? TwoRowLayoutActive
                : TwoRowLayoutInactive
            }
          />
        </LayoutOption>
      </Box>
    </SectionField>
  );
};

export default LayoutSetting;
