import React, { useState } from 'react';

import { Box, Icon, colors, Tooltip } from '@citizenlab/cl2-component-library';

import useUpdateProject from 'api/projects/useUpdateProject';
import { ProjectNode } from 'api/spaces/types';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

import Link from './_shared/Link';
import RemoveButton from './_shared/RemoveButton';
import Row from './_shared/Row';

interface Props {
  node: ProjectNode;
  lockedProjectTooltip?: MessageDescriptor;
  removeButtonMessage: MessageDescriptor;
}

const Project = ({
  node,
  lockedProjectTooltip,
  removeButtonMessage,
}: Props) => {
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
          fill={lockedProjectTooltip ? colors.grey600 : colors.black}
        />
        <Link
          to={`/admin/projects/${node.id}`}
          color={lockedProjectTooltip ? colors.grey600 : colors.black}
        >
          {localize(node.title_multiloc)}
        </Link>
        {lockedProjectTooltip && (
          <Tooltip
            content={
              <Box>
                <FormattedMessage {...lockedProjectTooltip} />
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
      {!lockedProjectTooltip && (
        <RemoveButton
          processing={isRemoving}
          message={removeButtonMessage}
          onClick={handleRemoveProject}
        />
      )}
    </Row>
  );
};

export default Project;
