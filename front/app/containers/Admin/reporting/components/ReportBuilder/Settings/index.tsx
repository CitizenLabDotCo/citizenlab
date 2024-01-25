import React from 'react';

// craft
import { useEditor, ROOT_NODE } from '@craftjs/core';

// components
import Settings from 'components/admin/ContentBuilder/Settings/Settings';

// events
import eventEmitter from 'utils/eventEmitter';
import { CONTENT_BUILDER_DELETE_ELEMENT_EVENT } from 'components/admin/ContentBuilder/constants';

// constants
import { WIDGET_TITLES } from 'containers/Admin/reporting/constants';

// typings
import { SelectedNode } from 'components/admin/ContentBuilder/Settings/typings';

const ReportBuilderSettings = () => {
  const { actions, selectedNode, isEnabled } = useEditor((state, query) => {
    const currentNodeId: string = query.getEvent('selected').last();
    let selectedNode: SelectedNode | undefined;

    if (currentNodeId) {
      const name = state.nodes[currentNodeId].data.name;

      selectedNode = {
        id: currentNodeId,
        name,
        title: WIDGET_TITLES[name],
        settings: state.nodes[currentNodeId].related?.settings,
        isDeletable: query.node(currentNodeId).isDeletable(),
        custom: state.nodes[currentNodeId].data.custom,
      };
    }

    return {
      selectedNode,
      isEnabled: state.options.enabled,
    };
  });

  const closeSettings = () => {
    actions.selectNode();
  };

  const showSettings =
    selectedNode &&
    isEnabled &&
    selectedNode.id !== ROOT_NODE &&
    selectedNode.name !== 'Box';

  if (!showSettings) return null;

  return (
    <Settings
      selectedNode={selectedNode}
      onClose={closeSettings}
      onDelete={() => {
        actions.delete(selectedNode.id);
        eventEmitter.emit(
          CONTENT_BUILDER_DELETE_ELEMENT_EVENT,
          selectedNode.id
        );
      }}
    />
  );
};

export default ReportBuilderSettings;
