import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import ResolutionControl, {
  IResolution,
} from 'components/admin/ResolutionControl';

import { TimeSeriesWidgetProps } from '../typings';

import {
  TitleInput,
  DateRangeInput,
  ProjectInput,
} from './ChartWidgetSettings';

const TimeSeriesWidgetSettings = ({
  resetComparePeriod = false,
  withProjectInput = true,
}) => {
  return (
    <Box>
      <TitleInput />
      <DateRangeInput resetComparePeriod={resetComparePeriod} />
      <ResolutionInput />
      {withProjectInput && <ProjectInput />}
    </Box>
  );
};

export const ResolutionInput = () => {
  const {
    actions: { setProp },
    resolution,
  } = useNode((node) => ({
    resolution: node.data.props.resolution,
  }));

  const handleResolution = (resolution: IResolution) => {
    setProp((props: TimeSeriesWidgetProps) => {
      props.resolution = resolution;
    });
  };

  return (
    <Box mb="20px">
      <ResolutionControl
        value={resolution ?? 'month'}
        onChange={handleResolution}
      />
    </Box>
  );
};

export default TimeSeriesWidgetSettings;
