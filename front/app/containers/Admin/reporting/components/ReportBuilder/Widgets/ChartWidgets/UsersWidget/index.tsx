import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import Card from '../../_shared/Card';
import messages from '../messages';
import { ChartWidgetProps } from '../typings';

import Chart from './Chart';
import Settings from './Settings';

const FAKE_DATA = [];

const UsersWidget = ({ title }: ChartWidgetProps) => {
  // TODO add real data
  const data = FAKE_DATA;

  return (
    <Card title={title} pagebreak>
      <Box width="100%" height="220px" mt="20px" pb="10px">
        <Chart data={data} />
      </Box>
    </Card>
  );
};

UsersWidget.craft = {
  props: {
    title: {},
    projectId: undefined,
    startAt: undefined,
    endAt: null,
  },
  related: {
    settings: Settings,
  },
};

export const usersTitle = messages.users;

export default UsersWidget;
