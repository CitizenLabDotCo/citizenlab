import React from 'react';

import SegmentedTabs, {
  SegmentedTab,
  SegmentedTabList,
} from 'design-system/SegmentedTabs';
import { Key } from 'design-system/types';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import 'design-system/tokens.css';

export type EventView = 'build' | 'manage';

interface Props {
  activeView: EventView;
  onChange: (view: EventView) => void;
}

const EventViewSwitch = ({ activeView, onChange }: Props) => {
  const { formatMessage } = useIntl();

  const handleSelectionChange = (key: Key) => {
    if (key === 'build' || key === 'manage') onChange(key);
  };

  return (
    <SegmentedTabs
      selectedKey={activeView}
      onSelectionChange={handleSelectionChange}
    >
      <SegmentedTabList aria-label={formatMessage(messages.eventView)}>
        <SegmentedTab id="build">
          {formatMessage(messages.buildView)}
        </SegmentedTab>
        <SegmentedTab id="manage">
          {formatMessage(messages.manageView)}
        </SegmentedTab>
      </SegmentedTabList>
    </SegmentedTabs>
  );
};

export default EventViewSwitch;
