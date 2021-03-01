import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useProject from 'hooks/useProject';

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
  const project = useProject({ projectId });

  if (
    !isNilOrError(project) &&
    project.attributes.publication_status === 'archived'
  ) {
    return (
      <Container className={className || ''}>
        <Warning text={<FormattedMessage {...messages.archivedProject} />} />
      </Container>
    );
  }

  return null;
});

export default ProjectArchivedIndicator;
