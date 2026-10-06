import React from 'react';

import { useEditor, ROOT_NODE, SerializedNodes } from '@craftjs/core';

import SettingsWrapper from 'components/admin/ContentBuilder/Settings';

import ChatPanel from '../ChatPanel';
import { WIDGET_TITLES } from '../Widgets';

interface Props {
  reportId: string;
  setSaved: (savedNodes: SerializedNodes) => void;
}

// The right rail is one slot with two occupants: the settings of the widget you
// picked, or — when nothing is picked — the chat about the report as a whole.
// The condition mirrors the one SettingsWrapper uses to decide it has something
// to show; it renders nothing when that is false.
const useHasWidgetSelected = () =>
  useEditor((state, query) => {
    const selectedId: string | undefined = query.getEvent('selected').last();
    if (!selectedId || !state.options.enabled) return { selected: false };

    const node = state.nodes[selectedId];
    return {
      selected: selectedId !== ROOT_NODE && node.data.name !== 'Box',
    };
  }).selected;

const ReportBuilderSettings = ({ reportId, setSaved }: Props) => {
  const hasWidgetSelected = useHasWidgetSelected();

  if (hasWidgetSelected) return <SettingsWrapper titles={WIDGET_TITLES} />;

  return <ChatPanel reportId={reportId} setSaved={setSaved} />;
};

export default ReportBuilderSettings;
