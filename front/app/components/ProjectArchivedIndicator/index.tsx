import React, { memo } from 'react';
// hooks
import useProject from 'hooks/useProject';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
// components
import Warning from 'components/UI/Warning';
// style
import styled from 'styled-components';
import messages from './messages';

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
