import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import AgeCard from './AgeCard';

// styling
import { stylingConsts } from 'utils/styleUtils';
import { BORDER } from '../../constants';

// messages
import messages from '../messages';

// settings
import { ChartWidgetSettings } from '../ChartWidgetSettings';

// types
import { ChartWidgetProps } from '../typings';

const AgeWidget = ({ title, projectId, startAt, endAt }: ChartWidgetProps) => {
  return (
    <Box
      minHeight="26px"
      border={BORDER}
      borderRadius={stylingConsts.borderRadius}
      mt="4px"
      mb="4px"
    >
      <AgeCard
        title={title}
        projectId={projectId}
        startAt={startAt}
        endAt={endAt ?? null}
      />
    </Box>
  );
};

AgeWidget.craft = {
  props: {
    title: '',
    projectFilter: undefined,
    startAt: undefined,
    endAt: null,
  },
  related: {
    settings: ChartWidgetSettings,
  },
  custom: {
    title: messages.usersByAge,
    noPointerEvents: true,
  },
};

export default AgeWidget;
