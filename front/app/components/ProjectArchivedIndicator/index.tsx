import React, { memo } from 'react';

import styled from 'styled-components';

import useProjectById from 'api/projects/useProjectById';

import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

const Container = styled.div`
  width: 100%;
`;

interface Props {
  projectId: string;
  className?: string;
}

const ProjectArchivedIndicator = memo<Props>(({ projectId, className }) => {
  const { data: project } = useProjectById(projectId);

  if (project?.data.attributes.publication_status === 'archived') {
    return (
      <Container className={className || ''}>
        <Warning>
          <FormattedMessage {...messages.archivedProject} />
        </Warning>
      </Container>
    );
  }

  return null;
});

export default ProjectArchivedIndicator;
