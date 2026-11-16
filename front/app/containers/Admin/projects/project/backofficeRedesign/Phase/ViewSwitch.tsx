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

  // A view the phase has no tab for cannot be reached. With a reason it stays
  // focusable and says why in its tooltip; without one it is plainly disabled.
  const lockedKeys = views
    .filter((view) => !view.to && !view.lockedReason)
    .map((view) => view.key);

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
      disabledKeys={lockedKeys}
    >
      <SegmentedTabList aria-label={label}>
        {views.map((view) => (
          <SegmentedTab
            key={view.key}
            id={view.key}
            disabledReason={view.to ? undefined : view.lockedReason}
          >
            {view.label}
          </SegmentedTab>
        ))}
      </SegmentedTabList>
    </SegmentedTabs>
  );
};

export default ViewSwitch;
