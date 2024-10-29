import React, { memo } from 'react';

import { Box, BoxProps } from '@citizenlab/cl2-component-library';

import useProjectById from 'api/projects/useProjectById';

import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  projectId: string;
} & BoxProps;

const ProjectArchivedIndicator = memo<Props>(({ projectId, ...rest }) => {
  const { data: project } = useProjectById(projectId);

  if (project?.data.attributes.publication_status === 'archived') {
    return (
      <Box width="100%" {...rest}>
        <Warning>
          <FormattedMessage {...messages.archivedProject} />
        </Warning>
      </Box>
    );
  }

  return null;
});

export default ProjectArchivedIndicator;
