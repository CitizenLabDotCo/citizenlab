import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import Card from '../../_shared/Card';
import { ChartWidgetProps } from '../typings';

import Chart from './Chart';
import messages from './messages';
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

const DemographicsWidget = (_props: Omit<ChartWidgetProps, 'title'>) => {
  // TODO add real data
  const data = FAKE_DATA;

  return (
    <Card pagebreak>
      <Box width="100%" pb="0px" display="flex">
        <Box w="300px" display="flex" flexDirection="column">
          <Text mt="1px" fontWeight="bold" fontSize="m" pr="16px">
            Place of residence
          </Text>
        </Box>
        <Chart data={data} />
      </Box>
    </Card>
  );
};

DemographicsWidget.craft = {
  props: {
    projectId: undefined,
    startAt: undefined,
    endAt: null,
  },
  related: {
    settings: Settings,
  },
};

export const demographicsTitle = messages.demographics;

export default DemographicsWidget;
