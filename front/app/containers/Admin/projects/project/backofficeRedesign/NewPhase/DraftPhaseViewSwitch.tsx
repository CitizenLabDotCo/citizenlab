import React from 'react';

import SegmentedTabs, {
  SegmentedTab,
  SegmentedTabList,
} from 'design-system/SegmentedTabs';

import { useIntl } from 'utils/cl-intl';

import headerMessages from '../Header/messages';
import messages from '../Phase/messages';
import { PhaseViewKey } from '../Phase/usePhaseViews';

const VIEWS = [
  { key: 'build', label: messages.buildView },
  { key: 'manage', label: messages.manageView },
  { key: 'insights', label: messages.insightsView },
] as const;

interface Props {
  activeView: PhaseViewKey;
  onChange: (view: PhaseViewKey) => void;
}

const DraftPhaseViewSwitch = ({ activeView, onChange }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <SegmentedTabs
      selectedKey={activeView}
      onSelectionChange={(key) => {
        const view = VIEWS.find((view) => view.key === key);
        if (view) onChange(view.key);
      }}
    >
      <SegmentedTabList
        aria-label={formatMessage(headerMessages.phaseViewSwitch)}
      >
        {VIEWS.map(({ key, label }) => (
          <SegmentedTab key={key} id={key}>
            {formatMessage(label)}
          </SegmentedTab>
        ))}
      </SegmentedTabList>
    </SegmentedTabs>
  );
};

export default DraftPhaseViewSwitch;
