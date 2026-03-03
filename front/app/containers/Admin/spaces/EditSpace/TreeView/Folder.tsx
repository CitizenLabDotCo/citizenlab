import React, { useState } from 'react';

import { Box, IconButton, colors } from '@citizenlab/cl2-component-library';

import Link from './Link';
import Project from './Project';
import { FolderNode } from './types';

interface Props {
  node: FolderNode;
}

const Folder = ({ node }: Props) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <Box>
      <Box
        display="flex"
        alignItems="flex-start"
        py="16px"
        borderBottom={`1px solid ${colors.divider}`}
      >
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
        <Link to={node.path}>{node.name}</Link>
      </Box>
      <Box pl="31px">
        {expanded && (
          <>
            {node.children.map((child) => (
              <Project key={child.id} node={child} />
            ))}
          </>
        )}
      </Box>
    </Box>
  );
};

export default Folder;
