import React from 'react';

import { Box, Icon, colors, Tooltip } from '@citizenlab/cl2-component-library';

import { ProjectNode } from 'api/spaces/types';

import { FormattedMessage } from 'utils/cl-intl';

import Link from './_shared/Link';
import RemoveFromSpaceButton from './_shared/RemoveFromSpaceButton';
import Row from './_shared/Row';
import messages from './messages';

interface Props {
  node: ProjectNode;
  removable: boolean;
}

const Project = ({ node, removable }: Props) => {
  return (
    <Row>
      <Box display="flex">
        <Icon
          name="projects"
          mr="12px"
          width="20px"
          height="20px"
          transform="translateY(-1px)"
          fill={removable ? colors.black : colors.grey600}
        />
        <Link to={node.path} color={removable ? colors.black : colors.grey600}>
          {node.name}
        </Link>
        {!removable && (
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
      {removable && <RemoveFromSpaceButton />}
    </Row>
  );
};

export default Project;
