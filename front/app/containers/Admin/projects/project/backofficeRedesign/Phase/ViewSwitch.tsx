import React from 'react';

import useLocale from 'hooks/useLocale';

import SegmentedTabs, {
  SegmentedTab,
  SegmentedTabList,
} from 'design-system/SegmentedTabs';
import 'design-system/tokens.css';

import { PhaseView } from './usePhaseViews';

interface Props {
  label: string;
  views: PhaseView[];
  activeView: string;
  projectId: string;
  phaseId: string;
}

// Each view has its own route, so the tabs are links and the route decides
// which one is selected.
const ViewSwitch = ({
  label,
  views,
  activeView,
  projectId,
  phaseId,
}: Props) => {
  const locale = useLocale();

  if (views.length < 2) return null;

  return (
    <SegmentedTabs selectedKey={activeView}>
      <SegmentedTabList aria-label={label}>
        {views.map((view) => (
          <SegmentedTab
            key={view.key}
            id={view.key}
            href={`/${locale}${view.to
              .replace('$projectId', projectId)
              .replace('$phaseId', phaseId)}`}
          >
            {view.label}
          </SegmentedTab>
        ))}
      </SegmentedTabList>
    </SegmentedTabs>
  );
};

export default ViewSwitch;
