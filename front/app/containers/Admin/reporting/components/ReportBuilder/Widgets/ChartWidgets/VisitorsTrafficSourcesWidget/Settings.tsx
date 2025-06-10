import React from 'react';

import { Box, Select } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import { useIntl } from 'utils/cl-intl';

import {
  TitleInput,
  DateRangeInput,
  ProjectInput,
} from '../_shared/ChartWidgetSettings';

import messages from './messages';
import { Props, View } from './typings';

const Settings = () => {
  return (
    <Box>
      <TitleInput />
      <DateRangeInput />
      <ProjectInput />
      <ViewInput />
    </Box>
  );
};

const ViewInput = () => {
  const {
    actions: { setProp },
    view,
  } = useNode((node) => ({
    view: node.data.props.view,
  }));

  const { formatMessage } = useIntl();

  const handleChangeView = (view: View) => {
    setProp((props: Props) => {
      props.view = view;
    });
  };

  const options = [
    { value: 'chart', label: formatMessage(messages.chart) },
    { value: 'table', label: formatMessage(messages.table) },
  ];

  return (
    <Box mb="20px">
      <Select
        label={formatMessage(messages.view)}
        value={view}
        onChange={(e) => handleChangeView(e.value)}
        options={options}
      />
    </Box>
  );
};

export default Settings;
