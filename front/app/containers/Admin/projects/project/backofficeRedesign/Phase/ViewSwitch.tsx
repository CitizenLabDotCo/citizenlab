import React from 'react';

import { useRouter } from '@tanstack/react-router';

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
// which one is selected. The router builds the hrefs, so the search params it
// retains (the redesign preview flag) stay on them.
const ViewSwitch = ({
  label,
  views,
  activeView,
  projectId,
  phaseId,
}: Props) => {
  const locale = useLocale();
  const router = useRouter();

  if (views.length < 2) return null;

  return (
    <SegmentedTabs selectedKey={activeView}>
      <SegmentedTabList aria-label={label}>
        {views.map((view) => (
          <SegmentedTab
            key={view.key}
            id={view.key}
            href={
              router.buildLocation({
                to: `/$locale${view.to}` as const,
                params: { locale, projectId, phaseId },
              }).href
            }
          >
            {view.label}
          </SegmentedTab>
        ))}
      </SegmentedTabList>
    </SegmentedTabs>
  );
};

export default ViewSwitch;
