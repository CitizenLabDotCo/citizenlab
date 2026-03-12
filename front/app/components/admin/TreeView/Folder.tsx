import React, { useState } from 'react';

import { Box, IconButton, colors } from '@citizenlab/cl2-component-library';

import useUpdateProjectFolder from 'api/project_folders/useUpdateProjectFolder';
import { FolderNode } from 'api/spaces/types';

import useLocalize from 'hooks/useLocalize';

import { MessageDescriptor } from 'utils/cl-intl';

import Link from './_shared/Link';
import RemoveFromSpaceButton from './_shared/RemoveFromSpaceButton';
import Row from './_shared/Row';
import Project from './Project';

interface Props {
  node: FolderNode;
  lockedProjectTooltip?: MessageDescriptor;
  removeButtonMessage: MessageDescriptor;
}

const Folder = ({ node, lockedProjectTooltip, removeButtonMessage }: Props) => {
  const localize = useLocalize();
  const [expanded, setExpanded] = useState(true);
  const [isRemoving, setIsRemoving] = useState(false);

  const { mutate: updateFolder } = useUpdateProjectFolder();

  const handleRemoveProject = () => {
    setIsRemoving(true);
    updateFolder(
      { projectFolderId: node.id, space_id: null },
      {
        onSuccess: () => {
          setIsRemoving(false);
        },
      }
    );
  };

  return (
    <Box>
      <Row>
        <Box display="flex" alignItems="flex-start">
          <IconButton
            mr="8px"
            ml="-7px"
            iconName={expanded ? 'chevron-down' : 'chevron-right'}
            iconWidth="20px"
            iconHeight="20px"
            iconColor={colors.black}
            transform="translateY(-1px)"
            onClick={() => setExpanded(!expanded)}
            a11y_buttonActionMessage=""
          />
          <Link to={`/admin/projects/folders/${node.id}`} color={colors.black}>
            {localize(node.title_multiloc)}
          </Link>
        </Box>
        <RemoveFromSpaceButton
          processing={isRemoving}
          message={removeButtonMessage}
          onClick={handleRemoveProject}
        />
      </Row>
      <Box pl="31px">
        {expanded && (
          <>
            {node.children.map((child) => (
              <Project
                key={child.id}
                node={child}
                lockedProjectTooltip={lockedProjectTooltip}
                removeButtonMessage={removeButtonMessage}
              />
            ))}
          </>
        )}
      </Box>
    </Box>
  );
};

export default Folder;
