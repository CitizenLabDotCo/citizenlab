import React, { memo } from 'react';

// hooks
import useProjectById from 'api/projects/useProjectById';

// components
import Warning from 'components/UI/Warning';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';

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
