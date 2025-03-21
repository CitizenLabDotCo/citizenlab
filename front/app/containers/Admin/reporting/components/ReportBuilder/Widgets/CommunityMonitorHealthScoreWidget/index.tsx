import React from 'react';

import Card from '../_shared/Card';

import messages from './messages';
import Settings from './Settings';
import { Props } from './typings';

const CommunityMonitorHealthScoreWidget = ({ title }: Props) => {
  return <Card title={title}>Here is a widget!</Card>;
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
