import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import ContentContainer from 'components/ContentContainer';
import IdeaCards from 'components/IdeaCards';
import ProjectArchivedIndicator from 'components/ProjectArchivedIndicator';
import PBExpenses from './pb/PBExpenses';

// hooks
import useProject from 'hooks/useProject';
import useWindowSize from 'hooks/useWindowSize';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { viewportWidths, fontSizes, colors } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
`;

const StyledContentContainer = styled(ContentContainer)`
  padding-top: 60px;
  padding-bottom: 80px;
  background: ${colors.background};
  border-top: solid 1px #e8e8e8;
  border-bottom: solid 1px #e8e8e8;
`;

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
    const projectType = project?.attributes.process_type;
    const participationMethod = project?.attributes.participation_method;
    const showIdeas = !!(
      projectType === 'continuous' &&
      (participationMethod === 'budgeting' ||
        participationMethod === 'ideation')
    );

    if (showIdeas) {
      const smallerThanBigTablet = windowSize?.windowWidth
        ? windowSize?.windowWidth <= viewportWidths.smallTablet
        : false;
      const isPBProject =
        project.attributes.participation_method === 'budgeting';
      const projectId = project.id;
      const projectIds = [projectId];

      return (
        <Container className={className || ''}>
          <StyledContentContainer id="project-ideas">
            <ProjectArchivedIndicator projectId={projectId} />
            {isPBProject && (
              <PBExpenses
                participationContextId={projectId}
                participationContextType="project"
                viewMode={smallerThanBigTablet ? 'column' : 'row'}
              />
            )}
            <Title>
              <FormattedMessage {...messages.ideas} />
            </Title>
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
          </StyledContentContainer>
        </Container>
      );
    }
  }

  return null;
});

export default ProjectIdeas;
