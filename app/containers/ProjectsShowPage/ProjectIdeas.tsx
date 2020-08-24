import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import IdeaCards from 'components/IdeaCards';
import ProjectArchivedIndicator from 'components/ProjectArchivedIndicator';
import PBExpenses from './pb/PBExpenses';

// hooks
import useProject from 'hooks/useProject';
import useWindowSize from 'hooks/useWindowSize';

// i18n
import messages from './messages';

// style
import styled from 'styled-components';
import { viewportWidths, fontSizes } from 'utils/styleUtils';

const Container = styled.div``;

const Title = styled.h2`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.xxxl}px;
  line-height: normal;
  font-weight: 500;
  text-align: left;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  margin: 0;
  margin-bottom: 25px;
  padding: 0;
`;

interface Props {
  projectId: string;
  className?: string;
}

const ProjectIdeas = memo<Props>(({ projectId, className }) => {
  const project = useProject({ projectId });
  const windowSize = useWindowSize();

  if (!isNilOrError(project) && !isNilOrError(windowSize)) {
    const smallerThanBigTablet = windowSize?.windowWidth
      ? windowSize?.windowWidth <= viewportWidths.smallTablet
      : false;
    const isPBProject = project.attributes.participation_method === 'budgeting';
    const projectId = project.id;
    const projectIds = [projectId];

    return (
      <Container className={className || ''}>
        <ProjectArchivedIndicator projectId={projectId} />
        {isPBProject && (
          <PBExpenses
            participationContextId={projectId}
            participationContextType="project"
            viewMode={smallerThanBigTablet ? 'column' : 'row'}
          />
        )}
        <Title>Ideas</Title>
        <IdeaCards
          type="load-more"
          projectIds={projectIds}
          participationMethod={project.attributes.participation_method}
          participationContextId={projectId}
          participationContextType="project"
          showViewToggle={true}
          defaultView={project.attributes.presentation_mode || null}
          invisibleTitleMessage={messages.invisibleTitleIdeasList}
        />
      </Container>
    );
  }

  return null;
});

export default ProjectIdeas;
