import React, { useState } from 'react';

import { Box, IconButton, colors } from '@citizenlab/cl2-component-library';

import { FolderNode } from 'api/spaces/types';

import Link from './_shared/Link';
import RemoveFromSpaceButton from './_shared/RemoveFromSpaceButton';
import Row from './_shared/Row';
import Project from './Project';

interface Props {
  node: FolderNode;
}

const Folder = ({ node }: Props) => {
  const [expanded, setExpanded] = useState(true);

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
          <Link to={node.path} color={colors.black}>
            {node.name}
          </Link>
        </Box>
        <RemoveFromSpaceButton />
      </Row>
      <Box pl="31px">
        {expanded && (
          <>
            {node.children.map((child) => (
              <Project key={child.id} node={child} removable={false} />
            ))}
          </>
        )}
      </Box>
    </Box>
  );
};

export default Folder;
