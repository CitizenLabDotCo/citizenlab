import React, { useState } from 'react';

import { Box, Button, Select } from '@citizenlab/cl2-component-library';

import { FolderNode, ProjectNode } from 'api/admin_publications/types';
import useUpdateProjectFolder from 'api/project_folders/useUpdateProjectFolder';
import useUpdateProject from 'api/projects/useUpdateProject';

import useLocalize from 'hooks/useLocalize';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

type NodeType = 'project' | 'folder';

interface Props {
  spaceId: string;
  // Projects and folders the current user is allowed to add to this space.
  addableNodes: (ProjectNode | FolderNode)[];
  opened: boolean;
  onClose: () => void;
}

const AddToSpaceModal = ({ spaceId, addableNodes, opened, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { mutate: updateProject, isLoading: isUpdatingProject } =
    useUpdateProject();
  const { mutate: updateFolder, isLoading: isUpdatingFolder } =
    useUpdateProjectFolder();

  const [nodeType, setNodeType] = useState<NodeType>('project');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const candidates = addableNodes.filter((node) => node.type === nodeType);

  const handleClose = () => {
    setNodeType('project');
    setSelectedId(null);
    onClose();
  };

  const handleAdd = () => {
    if (!selectedId) return;

    if (nodeType === 'project') {
      updateProject(
        { projectId: selectedId, space_id: spaceId },
        { onSuccess: handleClose }
      );
    } else {
      updateFolder(
        { projectFolderId: selectedId, space_id: spaceId },
        { onSuccess: handleClose }
      );
    }
  };

  const typeOptions = [
    { value: 'project', label: formatMessage(messages.project) },
    { value: 'folder', label: formatMessage(messages.folder) },
  ];

  const candidateOptions = candidates.map((node) => ({
    value: node.id,
    label: localize(node.title_multiloc),
  }));

  return (
    <Modal
      opened={opened}
      close={handleClose}
      header={formatMessage(messages.addNewProjectOrFolder)}
    >
      <Box p="32px">
        <Box display="flex" gap="16px" mb="32px">
          <Box width="140px">
            <Select
              value={nodeType}
              options={typeOptions}
              dataCy="e2e-add-to-space-type-select"
              onChange={(option) => {
                setNodeType(option.value);
                setSelectedId(null);
              }}
            />
          </Box>
          <Box flex="1">
            <Select
              value={selectedId}
              options={candidateOptions}
              dataCy="e2e-add-to-space-item-select"
              placeholder={formatMessage(
                nodeType === 'project'
                  ? messages.projectsPlaceholder
                  : messages.foldersPlaceholder
              )}
              onChange={(option) => setSelectedId(option.value ?? null)}
            />
          </Box>
        </Box>
        <Box display="flex" justifyContent="flex-end" gap="12px">
          <Button buttonStyle="secondary-outlined" onClick={handleClose}>
            {formatMessage(messages.cancel)}
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!selectedId}
            processing={isUpdatingProject || isUpdatingFolder}
            dataCy="e2e-add-to-space-submit"
          >
            {formatMessage(messages.addToSpace)}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddToSpaceModal;
