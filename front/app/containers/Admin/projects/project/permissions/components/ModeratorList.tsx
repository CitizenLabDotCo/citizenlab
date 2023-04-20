import React, { memo } from 'react';
import { isError } from 'lodash-es';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { List } from 'components/admin/ResourceList';
import { isNilOrError } from 'utils/helperUtils';
import ModeratorListRow from './ModeratorListRow';
import useProjectModerators from 'hooks/useProjectModerators';
import { Box } from '@citizenlab/cl2-component-library';

interface Props {
  projectId: string;
}

const ModeratorList = memo(({ projectId }: Props) => {
  const moderators = useProjectModerators(projectId);

  if (isError(moderators)) {
    return <FormattedMessage {...messages.moderatorsNotFound} />;
  }

  if (!isNilOrError(moderators)) {
    return (
      <Box mb="20px">
        <List>
          <>
            {moderators.map((moderator, index) => {
              return (
                <ModeratorListRow
                  key={moderator.id}
                  isLastItem={index === moderators.length - 1}
                  moderator={moderator}
                  projectId={projectId}
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
