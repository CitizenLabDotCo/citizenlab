import React from 'react';

import { useEditor, ROOT_NODE } from '@craftjs/core';

import { CONTENT_BUILDER_DELETE_ELEMENT_EVENT } from 'components/admin/ContentBuilder/constants';

import { MessageDescriptor } from 'utils/cl-intl';
import eventEmitter from 'utils/eventEmitter';

import Settings from './Settings';
import { SelectedNode } from './typings';

const ContentBuilderSettings = () => {
  const { actions, selectedNode, isEnabled } = useEditor((state, query) => {
    const currentNodeId: string = query.getEvent('selected').last();
    let selectedNode: SelectedNode | undefined;

    if (currentNodeId) {
      selectedNode = {
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
      selectedNode,
      isEnabled: state.options.enabled,
    };
  });

  const closeSettings = () => {
    actions.selectNode();
  };

  return selectedNode &&
    isEnabled &&
    selectedNode.id !== ROOT_NODE &&
    selectedNode.name !== 'Box' ? (
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
  ) : null;
};

export default ContentBuilderSettings;
