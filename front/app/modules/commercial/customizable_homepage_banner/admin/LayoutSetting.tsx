import React from 'react';

// components
import { Label, Radio, Box } from 'cl2-component-library';
import { SectionField } from 'components/admin/Section';

import Layout1 from 'assets/img/landingpage/admin/layout1.svg';
import Layout2 from 'assets/img/landingpage/admin/layout2.svg';
import Layout3 from 'assets/img/landingpage/admin/layout3.svg';

// style
import styled from 'styled-components';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

import { THomepageBannerLayout } from 'services/appConfiguration';

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
  align-items: center;
  margin-right: 20px;
`;

const LayoutLabel = styled(Label)`
  margin-bottom: 20px;
`;

interface Props {
  homepageBannerLayout: THomepageBannerLayout;
  handleLayoutOnChange: (layout: THomepageBannerLayout) => void;
}

const LayoutSetting = ({
  homepageBannerLayout,
  handleLayoutOnChange,
}: Props) => {
  const handleOnChange = (layout: THomepageBannerLayout) => {
    handleLayoutOnChange(layout);
  };
  return (
    <SectionField>
      <LayoutLabel htmlFor="">
        <FormattedMessage {...messages.chooseLayout} />
      </LayoutLabel>
      <Box display="flex">
        <LayoutOption>
          <Radio
            onChange={handleOnChange}
            currentValue={homepageBannerLayout}
            value="layout_1"
            name="homepage-banner-layout"
            id="homepage-banner-layout-1"
            label={<FormattedMessage {...messages.layout1} />}
          />
          <LayoutPreview src={Layout1} />
        </LayoutOption>
        <LayoutOption>
          <Radio
            onChange={handleOnChange}
            currentValue={homepageBannerLayout}
            value="layout_2"
            name="homepage-banner-layout"
            id="homepage-banner-layout-2"
            label={<FormattedMessage {...messages.layout2} />}
          />
          <LayoutPreview src={Layout2} />
        </LayoutOption>
        <LayoutOption>
          <Radio
            onChange={handleOnChange}
            currentValue={homepageBannerLayout}
            value="layout_3"
            name="homepage-banner-layout"
            id="homepage-banner-layout-3"
            label={<FormattedMessage {...messages.layout3} />}
          />
          <LayoutPreview src={Layout3} />
        </LayoutOption>
      </Box>
      {/* <Error apiErrors={apiErrors && apiErrors.voting_method} /> */}
    </SectionField>
  );
};

export default LayoutSetting;
