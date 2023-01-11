import React from 'react';

// components
import AgeCard from './AgeCard';
import PageBreakBox from '../../PageBreakBox';

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
    <PageBreakBox
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
    </PageBreakBox>
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
