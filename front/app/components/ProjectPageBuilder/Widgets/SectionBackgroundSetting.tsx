import React from 'react';

import { Box, Label, Radio } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import {
  SectionBackgroundChoice,
  useDefaultSectionBackground,
} from './SectionBackground';

type WidgetProps = {
  sectionBackground?: SectionBackgroundChoice;
};

const SectionBackgroundSetting = () => {
  const {
    actions: { setProp },
    sectionBackground,
  } = useNode((node) => ({
    sectionBackground: node.data.props.sectionBackground as
      | SectionBackgroundChoice
      | undefined,
  }));

  const defaultBackground = useDefaultSectionBackground();
  const currentValue = sectionBackground ?? defaultBackground;
  const handleChange = (value: SectionBackgroundChoice) => {
    setProp((props: WidgetProps) => (props.sectionBackground = value));
  };

  return (
    <Box mb="30px">
      <Label>
        <FormattedMessage {...messages.sectionBackgroundLabel} />
      </Label>
      <Radio
        onChange={handleChange}
        currentValue={currentValue}
        id="section-background-colored"
        name="sectionBackground"
        value="colored"
        label={<FormattedMessage {...messages.sectionBackgroundColored} />}
        isRequired
      />
      <Radio
        onChange={handleChange}
        currentValue={currentValue}
        id="section-background-white"
        name="sectionBackground"
        value="white"
        label={<FormattedMessage {...messages.sectionBackgroundWhite} />}
        isRequired
      />
    </Box>
  );
};

export default SectionBackgroundSetting;
