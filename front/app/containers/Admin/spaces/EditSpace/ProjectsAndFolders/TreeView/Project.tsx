import React, { useState } from 'react';

import { Box, Icon, colors, Tooltip } from '@citizenlab/cl2-component-library';

import useUpdateProject from 'api/projects/useUpdateProject';
import { ProjectNode } from 'api/spaces/types';

import useLocalize from 'hooks/useLocalize';

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
  const [isRemoving, setIsRemoving] = useState(false);
  const localize = useLocalize();
  const { mutate: updateProject } = useUpdateProject();

  const handleRemoveProject = () => {
    setIsRemoving(true);
    updateProject(
      { projectId: node.id, space_id: null },
      {
        onSuccess: () => {
          setIsRemoving(false);
        },
      }
    );
  };

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
        <Link
          to={`/admin/projects/${node.id}`}
          color={removable ? colors.black : colors.grey600}
        >
          {localize(node.title_multiloc)}
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
      {removable && (
        <RemoveFromSpaceButton
          processing={isRemoving}
          onClick={handleRemoveProject}
        />
      )}
    </Row>
  );
};

export default Project;
