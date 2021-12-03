import React from 'react';

// components
import { Label, Radio, Box } from 'cl2-component-library';
import { SectionField } from 'components/admin/Section';

import Layout1Active from './layout_previews/layout1_active.jpg';
import Layout2Active from './layout_previews/layout2_active.jpg';
import Layout3Active from './layout_previews/layout3_active.jpg';
import Layout1Inactive from './layout_previews/layout1_inactive.jpg';
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
} from 'services/appConfiguration';

export const ColorPickerSectionField = styled(SectionField)``;

export const WideSectionField = styled(SectionField)`
  max-width: calc(${(props) => props.theme.maxPageWidth}px - 100px);
`;

export const EventsToggleSectionField = styled(SectionField)`
  margin: 0;
`;

const LayoutPreview = styled.img`
  width: 200px;
`;

const LayoutOption = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  margin-right: 20px;
`;

const LayoutLabel = styled(Label)`
  margin-bottom: 20px;
`;

interface Props {
  homepageBannerLayout: THomepageBannerLayout;
  handleOnChange: (
    settingName: TAppConfigurationSetting
  ) => (settingKey: string, settingValue: any) => void;
}

const LayoutSetting = ({ homepageBannerLayout, handleOnChange }: Props) => {
  const handleLayoutOnChange = (layout: THomepageBannerLayout) => {
    handleOnChange('customizable_homepage_banner')('layout', layout);
  };

  return (
    <SectionField>
      <LayoutLabel htmlFor="">
        <FormattedMessage {...messages.chooseLayout} />
      </LayoutLabel>
      <Box display="flex">
        <LayoutOption>
          <Radio
            onChange={handleLayoutOnChange}
            currentValue={homepageBannerLayout}
            value="layout_1"
            name="homepage-banner-layout"
            id="homepage-banner-layout-1"
            label={<FormattedMessage {...messages.layout1} />}
          />
          <LayoutPreview
            src={
              homepageBannerLayout === 'layout_1'
                ? Layout1Active
                : Layout1Inactive
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
