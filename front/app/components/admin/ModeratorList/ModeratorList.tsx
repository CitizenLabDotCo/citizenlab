import React, { memo } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useProjectModerators from 'api/project_moderators/useProjectModerators';
import useProjectById from 'api/projects/useProjectById';

import { List } from 'components/admin/ResourceList';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import ModeratorListRow from './ModeratorListRow';

interface Props {
  projectId: string;
}

const ModeratorList = memo(({ projectId }: Props) => {
  const { data: moderators, isError } = useProjectModerators({ projectId });
  const { data: project } = useProjectById(projectId);
  const folderId = project?.data.attributes.folder_id ?? null;

  if (isError) {
    return <FormattedMessage {...messages.moderatorsNotFound} />;
  }

  if (moderators) {
    return (
      <Box mb="20px">
        <List>
          <>
            {moderators.data.map((moderator, index) => {
              return (
                <ModeratorListRow
                  key={moderator.id}
                  isLastItem={index === moderators.data.length - 1}
                  moderator={moderator}
                  projectId={projectId}
                  folderId={folderId}
                />
              );
            })}
          </>
        </List>
      </Box>
    );
  }

  return null;
});

export default ModeratorList;
