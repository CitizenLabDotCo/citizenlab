import React from 'react';

// components
import Settings from './Settings';

// craft
import { useEditor, ROOT_NODE } from '@craftjs/core';

// intl
import { MessageDescriptor } from 'utils/cl-intl';

// events
import eventEmitter from 'utils/eventEmitter';
import { CONTENT_BUILDER_DELETE_ELEMENT_EVENT } from 'components/admin/ContentBuilder/constants';

// typings
import { Selected } from './typings';

const ContentBuilderSettings = () => {
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

  return selected &&
    isEnabled &&
    selected.id !== ROOT_NODE &&
    selected.name !== 'Box' ? (
    <Settings
      selected={selected}
      onClose={closeSettings}
      onDelete={() => {
        actions.delete(selected.id);
        eventEmitter.emit(CONTENT_BUILDER_DELETE_ELEMENT_EVENT, selected.id);
      }}
    />
  ) : null;
};

export default ContentBuilderSettings;
