import React from 'react';

// components
import GenderCard from './GenderCard';
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

const GenderWidget = ({
  title,
  projectId,
  startAt,
  endAt,
}: ChartWidgetProps) => {
  return (
    <PageBreakBox
      minHeight="26px"
      border={BORDER}
      borderRadius={stylingConsts.borderRadius}
      mt="4px"
      mb="4px"
    >
      <GenderCard
        title={title}
        projectId={projectId}
        startAt={startAt}
        endAt={endAt ?? null}
      />
    </PageBreakBox>
  );
};

GenderWidget.craft = {
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
    title: messages.usersByGender,
    noPointerEvents: true,
  },
};

export default GenderWidget;
