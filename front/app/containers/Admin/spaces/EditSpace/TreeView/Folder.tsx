import React, { useState } from 'react';

import {
  Box,
  IconButton,
  colors,
  Tooltip,
  Icon,
} from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import DeleteButton from './_shared/DeleteButton';
import Link from './_shared/Link';
import Row from './_shared/Row';
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
      <Row>
        <Box display="flex" alignItems="flex-start">
          <IconButton
            mr="8px"
            ml="-7px"
            iconName={expanded ? 'chevron-down' : 'chevron-right'}
            iconWidth="20px"
            iconHeight="20px"
            iconColor={node.inSpace ? colors.black : colors.grey600}
            transform="translateY(-1px)"
            onClick={() => setExpanded(!expanded)}
            a11y_buttonActionMessage=""
          />
          <Link
            to={node.path}
            color={node.inSpace ? colors.black : colors.grey600}
            crossedOut={!node.inSpace}
          >
            {node.name}
          </Link>
          {!node.inSpace && (
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
        {node.inSpace && <DeleteButton />}
      </Row>
      <Box pl="31px">
        {expanded && (
          <>
            {node.children.map((child) => (
              <Project key={child.id} node={child} removable={!node.inSpace} />
            ))}
          </>
        )}
      </Box>
    </Box>
  );
};

export default Folder;
