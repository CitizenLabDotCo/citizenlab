import React, { useState } from 'react';

import {
  Box,
  IconButton,
  colors,
  Tooltip,
  Icon,
} from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import Link from './Link';
import messages from './messages';
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
          iconColor={
            node.state === 'crossed-out' ? colors.grey600 : colors.black
          }
          transform="translateY(-1px)"
          onClick={() => setExpanded(!expanded)}
          a11y_buttonActionMessage=""
        />
        <Link
          to={node.path}
          color={node.state === 'crossed-out' ? colors.grey600 : colors.black}
          crossedOut={node.state === 'crossed-out'}
        >
          {node.name}
        </Link>
        {node.state === 'crossed-out' && (
          <Tooltip
            content={
              <Box>
                <FormattedMessage {...messages.crossedOutFolder} />
              </Box>
            }
          >
            <Icon
              name="question-circle"
              ml="8px"
              width="20px"
              height="20px"
              transform="translateY(-1px)"
              fill={colors.grey600}
            />
          </Tooltip>
        )}
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
