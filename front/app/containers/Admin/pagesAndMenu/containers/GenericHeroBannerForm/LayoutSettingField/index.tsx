import React from 'react';

// components
import { Box, fontSizes, Radio } from '@citizenlab/cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';

import FullWidthBannerLayoutActive from './layout_previews/full_width_banner_layout_active.jpg';
import FullWidthBannerLayoutInactive from './layout_previews/full_width_banner_layout_inactive.jpg';
import TwoColumnLayoutActive from './layout_previews/two_column_layout_active.jpg';
import TwoColumnLayoutInactive from './layout_previews/two_column_layout_inactive.jpg';
import TwoRowLayoutActive from './layout_previews/two_row_layout_active.jpg';
import TwoRowLayoutInactive from './layout_previews/two_row_layout_inactive.jpg';

// style
import styled from 'styled-components';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

import {
  ICustomPageAttributes,
  TCustomPageBannerLayout,
} from 'services/customPages';
import {
  IHomepageSettingsAttributes,
  THomepageBannerLayout,
} from 'services/homepageSettings';

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

export interface Props {
  bannerLayout:
    | ICustomPageAttributes['banner_layout']
    | IHomepageSettingsAttributes['banner_layout'];
  onChange: (
    bannerLayout: THomepageBannerLayout | TCustomPageBannerLayout
  ) => void;
}

const LayoutSettingField = ({ bannerLayout, onChange }: Props) => {
  return (
    <SectionField key="layout">
      <SubSectionTitle>
        <FormattedMessage {...messages.chooseLayout} />
      </SubSectionTitle>
      <Box display="flex">
        <LayoutOption>
          <LayoutOptionTop>
            <Radio
              onChange={onChange}
              currentValue={bannerLayout}
              value="full_width_banner_layout"
              name="banner-layout"
              id="banner-full-width-banner-layout"
            />
            <LayoutOptionTextWrapper>
              <FormattedMessage {...messages.fullWidthBannerLayout} />
            </LayoutOptionTextWrapper>
          </LayoutOptionTop>
          <LayoutPreview
            src={
              bannerLayout === 'full_width_banner_layout'
                ? FullWidthBannerLayoutActive
                : FullWidthBannerLayoutInactive
            }
          />
        </LayoutOption>
        <LayoutOption>
          <LayoutOptionTop data-cy="e2e-two-column-layout-option">
            <Radio
              onChange={onChange}
              currentValue={bannerLayout}
              value="two_column_layout"
              name="banner-layout"
              id="banner-two-column-layout"
            />
            <LayoutOptionTextWrapper>
              <FormattedMessage {...messages.TwoColumnLayout} />
            </LayoutOptionTextWrapper>
          </LayoutOptionTop>
          <LayoutPreview
            src={
              bannerLayout === 'two_column_layout'
                ? TwoColumnLayoutActive
                : TwoColumnLayoutInactive
            }
          />
        </LayoutOption>
        <LayoutOption>
          <LayoutOptionTop>
            <Radio
              onChange={onChange}
              currentValue={bannerLayout}
              value="two_row_layout"
              name="banner-layout"
              id="banner-two-row-layout"
            />
            <LayoutOptionTextWrapper>
              <FormattedMessage {...messages.twoRowLayout} />
            </LayoutOptionTextWrapper>
          </LayoutOptionTop>
          <LayoutPreview
            src={
              bannerLayout === 'two_row_layout'
                ? TwoRowLayoutActive
                : TwoRowLayoutInactive
            }
          />
        </LayoutOption>
      </Box>
    </SectionField>
  );
};

export default LayoutSettingField;
