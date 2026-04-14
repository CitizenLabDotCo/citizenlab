import React, { useState } from 'react';

import {
  Box,
  IconButton,
  Icon,
  colors,
} from '@citizenlab/cl2-component-library';

import { FolderNode } from 'api/admin_publications/types';

import useLocalize from 'hooks/useLocalize';

import { MessageDescriptor } from 'utils/cl-intl';

import Link from './_shared/Link';
import RemoveButton from './_shared/RemoveButton';
import Row from './_shared/Row';
import Project from './Project';

interface Props {
  node: FolderNode;
  lockedProjectTooltip?: MessageDescriptor;
  removeButtonMessage?: MessageDescriptor;
  onRemove?: (nodeId: string, nodeType: 'project' | 'folder') => Promise<void>;
}

const Folder = ({
  node,
  lockedProjectTooltip,
  removeButtonMessage,
  onRemove,
}: Props) => {
  const localize = useLocalize();
  const [expanded, setExpanded] = useState(true);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemoveFolder = async () => {
    if (!onRemove) return;
    setIsRemoving(true);
    await onRemove(node.id, 'folder');
    setIsRemoving(false);
  };

  return (
    <Box>
      <Row>
        <Box display="flex" alignItems="flex-start">
          <Icon
            name="folder-outline"
            mr="12px"
            width="20px"
            height="20px"
            transform="translateY(-1px)"
            fill={colors.black}
          />
          <Link to={`/admin/projects/folders/${node.id}`} color={colors.black}>
            {localize(node.title_multiloc)}
          </Link>
          <IconButton
            ml="4px"
            iconName={expanded ? 'chevron-down' : 'chevron-right'}
            iconWidth="20px"
            iconHeight="20px"
            iconColor={colors.black}
            transform="translateY(-1px)"
            onClick={() => setExpanded(!expanded)}
            a11y_buttonActionMessage=""
          />
        </Box>
        {removeButtonMessage && onRemove && (
          <RemoveButton
            processing={isRemoving}
            message={removeButtonMessage}
            onClick={handleRemoveFolder}
          />
        )}
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
                onRemove={onRemove}
              />
            ))}
          </>
        )}
      </Box>
    </Box>
  );
};

export default Folder;
