import React from 'react';

import { useEditor, ROOT_NODE } from '@craftjs/core';

import useDeleteFileAttachment from 'api/file_attachments/useDeleteFileAttachment';

import { CONTENT_BUILDER_DELETE_ELEMENT_EVENT } from 'components/admin/ContentBuilder/constants';

import { MessageDescriptor } from 'utils/cl-intl';
import eventEmitter from 'utils/eventEmitter';

import Settings from '../../admin/ContentBuilder/Settings/Settings';
import { SelectedNode } from '../../admin/ContentBuilder/Settings/typings';

const ContentBuilderSettings = () => {
  const { actions, selectedNode, isEnabled } = useEditor((state, query) => {
    const currentNodeId: string = query.getEvent('selected').last();
    let selectedNode: SelectedNode | undefined;

    if (currentNodeId) {
      selectedNode = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.name,
        props: state.nodes[currentNodeId].data.props,
        title: state.nodes[currentNodeId].data.custom?.title as
          | MessageDescriptor
          | undefined,
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

  const { mutate: deleteFileAttachment } = useDeleteFileAttachment({});

  const closeSettings = () => {
    actions.selectNode();
  };

  const cleanupFileAttachment = () => {
    // If we're deleting a file widget,
    // we should also delete the associated file attachment.
    deleteFileAttachment(selectedNode?.props.fileAttachmentId);
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

        // If the deleted node is a file attachment, also clean up the associated file attachment data.
        if (selectedNode.custom?.title.defaultMessage === 'File Attachment') {
          cleanupFileAttachment();
        }

        eventEmitter.emit(
          CONTENT_BUILDER_DELETE_ELEMENT_EVENT,
          selectedNode.id
        );
      }}
    />
  ) : null;
};

export default ContentBuilderSettings;
