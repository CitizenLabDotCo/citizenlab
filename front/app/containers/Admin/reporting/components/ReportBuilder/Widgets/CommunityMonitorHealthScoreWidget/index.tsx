import React from 'react';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';

import HealthScoreWidget from 'containers/Admin/communityMonitor/components/LiveMonitor/components/HealthScoreWidget';

import Card from '../_shared/Card';

import messages from './messages';
import Settings from './Settings';
import { Props } from './typings';

const CommunityMonitorHealthScoreWidget = ({ quarter, year }: Props) => {
  const { data: project } = useCommunityMonitorProject({});
  const phaseId = project?.data.relationships.current_phase?.data?.id;

  return (
    <Card>
      <HealthScoreWidget phaseId={phaseId} quarter={quarter} year={year} />
    </Card>
  );
};

CommunityMonitorHealthScoreWidget.craft = {
  props: {
    title: {},
  },
  related: {
    settings: Settings,
  },
};

export const communityMonitorHealthScoreTitle =
  messages.communityMonitorHealthScoreTitle;

export default CommunityMonitorHealthScoreWidget;
