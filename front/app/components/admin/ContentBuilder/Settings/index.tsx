import React from 'react';

import { useEditor, ROOT_NODE } from '@craftjs/core';

import { CONTENT_BUILDER_DELETE_ELEMENT_EVENT } from 'components/admin/ContentBuilder/constants';
import Settings from 'components/admin/ContentBuilder/Settings/Settings';
import { SelectedNode } from 'components/admin/ContentBuilder/Settings/typings';

import { MessageDescriptor } from 'utils/cl-intl';
import eventEmitter from 'utils/eventEmitter';

interface Props {
  titles: Record<string, MessageDescriptor>;
}

const SettingsWrapper = ({ titles }: Props) => {
  const { actions, selectedNode, isEnabled } = useEditor((state, query) => {
    const currentNodeId: string = query.getEvent('selected').last();
    let selectedNode: SelectedNode | undefined;

    if (currentNodeId) {
      const name = state.nodes[currentNodeId].data.name;

      selectedNode = {
        id: currentNodeId,
        name,
        title: titles[name],
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

export default SettingsWrapper;
