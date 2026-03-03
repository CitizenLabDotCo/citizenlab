import React from 'react';

import { Box, Icon, colors, Tooltip } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import DeleteButton from './_shared/DeleteButton';
import Link from './_shared/Link';
import Row from './_shared/Row';
import messages from './messages';
import { ProjectNode } from './types';

interface Props {
  node: ProjectNode;
}

const Project = ({ node }: Props) => {
  return (
    <Row>
      <Box display="flex">
        <Icon
          name="projects"
          mr="12px"
          width="20px"
          height="20px"
          transform="translateY(-1px)"
          fill={node.state === 'locked' ? colors.grey600 : colors.black}
        />
        <Link
          to={node.path}
          color={node.state === 'locked' ? colors.grey600 : colors.black}
        >
          {node.name}
        </Link>
        {node.state === 'locked' && (
          <Tooltip
            content={
              <Box>
                <FormattedMessage {...messages.lockedProject} />
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
      </Box>
      {node.state === 'removable' && <DeleteButton />}
    </Row>
  );
};

export default Project;
