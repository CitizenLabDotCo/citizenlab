import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import Card from '../../_shared/Card';
import messages from '../messages';

import Chart from './Chart';
import Settings from './Settings';
import { Data } from './typings';

const FAKE_DATA: Data = [
  {
    northeast_quarter: 25,
    northwest_quarter: 17,
    city_center: 32,
    southeast_quarter: 24,
    other: 2,
  },
];

const UsersWidget = () => {
  // TODO add real data
  const data = FAKE_DATA;

  return (
    <Card pagebreak>
      <Box width="100%" pb="0px" display="flex">
        <Box w="300px" display="flex" flexDirection="column">
          <Text mt="1px" fontWeight="bold" fontSize="l">
            Place of residence
          </Text>
        </Box>
        <Chart data={data} />
      </Box>
    </Card>
  );
};

UsersWidget.craft = {
  props: {
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
