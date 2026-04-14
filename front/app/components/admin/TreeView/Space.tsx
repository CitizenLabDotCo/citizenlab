import React, { useState } from 'react';

import {
  Box,
  Icon,
  IconButton,
  colors,
} from '@citizenlab/cl2-component-library';

import { SpaceNode } from 'api/admin_publications/types';

import useLocalize from 'hooks/useLocalize';

import { MessageDescriptor } from 'utils/cl-intl';

import Link from './_shared/Link';
import RemoveButton from './_shared/RemoveButton';
import Row from './_shared/Row';
import Folder from './Folder';
import Project from './Project';

interface Props {
  node: SpaceNode;
  lockedProjectTooltip?: MessageDescriptor;
  lockedFolderTooltip?: MessageDescriptor;
  removeButtonMessage?: MessageDescriptor;
  onRemove?: (
    nodeId: string,
    nodeType: 'project' | 'folder' | 'space'
  ) => Promise<void>;
}

const Space = ({
  node,
  lockedProjectTooltip,
  lockedFolderTooltip,
  removeButtonMessage,
  onRemove,
}: Props) => {
  const localize = useLocalize();
  const [expanded, setExpanded] = useState(true);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemoveSpace = async () => {
    if (!onRemove) return;
    setIsRemoving(true);
    await onRemove(node.id, 'space');
    setIsRemoving(false);
  };

  return (
    <Box>
      <Row>
        <Box display="flex" alignItems="flex-start">
          <Icon
            name="spaces"
            mr="12px"
            width="20px"
            height="20px"
            transform="translateY(-1px)"
            fill={colors.black}
          />
          <Link to={`/admin/projects/spaces/${node.id}`} color={colors.black}>
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
            onClick={handleRemoveSpace}
          />
        )}
      </Row>
      <Box pl="31px">
        {expanded && (
          <>
            {node.children.map((child) =>
              child.type === 'project' ? (
                <Project
                  key={child.id}
                  node={child}
                  lockedProjectTooltip={lockedProjectTooltip}
                  removeButtonMessage={removeButtonMessage}
                  onRemove={onRemove}
                />
              ) : (
                <Folder
                  key={child.id}
                  node={child}
                  lockedProjectTooltip={lockedProjectTooltip}
                  lockedFolderTooltip={lockedFolderTooltip}
                  removeButtonMessage={removeButtonMessage}
                  onRemove={onRemove}
                />
              )
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default Space;
