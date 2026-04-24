import React, { useState } from 'react';

import {
  Box,
  IconButton,
  Icon,
  Tooltip,
  colors,
} from '@citizenlab/cl2-component-library';

import { FolderNode } from 'api/admin_publications/types';

import useLocalize from 'hooks/useLocalize';

import { MessageDescriptor, FormattedMessage } from 'utils/cl-intl';

import Link from './_shared/Link';
import RemoveButton from './_shared/RemoveButton';
import Row from './_shared/Row';
import Project from './Project';

interface Props {
  node: FolderNode;
  lockedProjectTooltip?: MessageDescriptor;
  lockedFolderTooltip?: MessageDescriptor;
  removeButtonMessage?: MessageDescriptor;
  onRemove?: (nodeId: string, nodeType: 'project' | 'folder') => Promise<void>;
}

const Folder = ({
  node,
  lockedProjectTooltip,
  lockedFolderTooltip,
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
            fill={lockedFolderTooltip ? colors.grey600 : colors.black}
          />
          <Link
            to={`/admin/projects/folders/${node.id}`}
            color={lockedFolderTooltip ? colors.grey600 : colors.black}
          >
            {localize(node.title_multiloc)}
          </Link>
          {lockedFolderTooltip && (
            <Tooltip
              content={
                <Box>
                  <FormattedMessage {...lockedFolderTooltip} />
                </Box>
              }
            >
              <Icon
                name="lock"
                ml="8px"
                width="20px"
                height="20px"
                transform="translateY(-1px)"
                fill={colors.grey600}
              />
            </Tooltip>
          )}
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
        {!lockedFolderTooltip && removeButtonMessage && onRemove && (
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
