import React from 'react';

// craft
import { useEditor, ROOT_NODE } from '@craftjs/core';

// components
import Settings from 'components/admin/ContentBuilder/Settings/Settings';

// events
import eventEmitter from 'utils/eventEmitter';
import { CONTENT_BUILDER_DELETE_ELEMENT_EVENT } from 'components/admin/ContentBuilder/constants';

// typings
import { Selected } from 'components/admin/ContentBuilder/Settings/typings';
import { MessageDescriptor } from 'utils/cl-intl';

const ReportBuilderSettings = () => {
  const { actions, selected, isEnabled } = useEditor((state, query) => {
    const currentNodeId: string = query.getEvent('selected').last();
    let selected: Selected | undefined;

    if (currentNodeId) {
      selected = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.name,
        title: state.nodes[currentNodeId].data.custom?.title as
          | MessageDescriptor
          | undefined,
        settings: state.nodes[currentNodeId].related?.settings,
        isDeletable: query.node(currentNodeId).isDeletable(),
        custom: state.nodes[currentNodeId].data.custom,
      };
    }

    return {
      selected,
      isEnabled: state.options.enabled,
    };
  });

  const closeSettings = () => {
    actions.selectNode();
  };

  const showSettings =
    selected &&
    isEnabled &&
    selected.id !== ROOT_NODE &&
    selected.name !== 'Box';

  if (!showSettings) return null;

  return (
    <Settings
      selected={selected}
      onClose={closeSettings}
      onDelete={() => {
        actions.delete(selected.id);
        eventEmitter.emit(CONTENT_BUILDER_DELETE_ELEMENT_EVENT, selected.id);
      }}
    />
  );
};

export default ReportBuilderSettings;
