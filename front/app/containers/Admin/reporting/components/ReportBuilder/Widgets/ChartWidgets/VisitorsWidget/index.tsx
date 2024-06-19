import React from 'react';

import visitorCardMessages from 'components/admin/GraphCards/VisitorsCard/messages';

import { useIntl } from 'utils/cl-intl';

import Card from '../../_shared/Card';
import messages from '../messages';

import ChartWidgetSettings from './ChartWidgetSettings';
import { Props } from './typings';
import VisitorsCard from './VisitorsCard';

const VisitorsWidget = ({ title, ...props }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Card
      title={title}
      infoTooltipContent={formatMessage(
        visitorCardMessages.cardTitleTooltipMessage
      )}
      pagebreak
    >
      <VisitorsCard {...props} />
    </Card>
  );
};

VisitorsWidget.craft = {
  props: {
    title: {},
    startAt: undefined,
    endAt: undefined,
    resolution: undefined,
    compareStartAt: undefined,
    compareEndAt: undefined,
    hideStatistics: undefined,
  },
  related: {
    settings: ChartWidgetSettings,
  },
};

export const visitorsTitle = messages.visitorTimeline;

export default VisitorsWidget;
