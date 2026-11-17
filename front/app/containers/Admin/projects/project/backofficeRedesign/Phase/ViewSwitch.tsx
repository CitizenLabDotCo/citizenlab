import React from 'react';

import SegmentedTabs, {
  SegmentedTab,
  SegmentedTabList,
} from 'design-system/SegmentedTabs';
import 'design-system/tokens.css';

import clHistory from 'utils/cl-router/history';

import { PhaseView } from './usePhaseViews';

interface Props {
  label: string;
  views: PhaseView[];
  activeView: string;
  projectId: string;
  phaseId: string;
}

const ViewSwitch = ({
  label,
  views,
  activeView,
  projectId,
  phaseId,
}: Props) => {
  if (views.length < 2) return null;

  const handleSelectionChange = (key: React.Key) => {
    if (key === activeView) return;

    const to = views.find((view) => view.key === key)?.to;
    if (!to) return;

    clHistory.push(
      to.replace('$projectId', projectId).replace('$phaseId', phaseId)
    );
  };

  return (
    <SegmentedTabs
      selectedKey={activeView}
      onSelectionChange={handleSelectionChange}
    >
      <SegmentedTabList aria-label={label}>
        {views.map((view) => (
          <SegmentedTab key={view.key} id={view.key}>
            {view.label}
          </SegmentedTab>
        ))}
      </SegmentedTabList>
    </SegmentedTabs>
  );
};

export default ViewSwitch;
