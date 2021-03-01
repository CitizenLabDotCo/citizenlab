import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import ContentContainer from 'components/ContentContainer';
import IdeaCards from 'components/IdeaCards';
import PBExpenses from '../shared/pb/PBExpenses';
import {
  SectionContainer,
  ProjectPageSectionTitle,
  maxPageWidth,
} from 'containers/ProjectsShowPage/styles';

// hooks
import useProject from 'hooks/useProject';
import useWindowSize from 'hooks/useWindowSize';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from 'containers/ProjectsShowPage/messages';
import { getInputTermMessage } from 'utils/i18n';

// style
import styled from 'styled-components';
import { viewportWidths, colors } from 'utils/styleUtils';

const Container = styled.div``;

const StyledContentContainer = styled(ContentContainer)`
  background: ${colors.background};
`;

const StyledProjectPageSectionTitle = styled(ProjectPageSectionTitle)`
  margin-bottom: 20px;
`;

const StyledPBExpenses = styled(PBExpenses)`
  margin-bottom: 50px;
`;

interface Props {
  projectId: string;
  className?: string;
}

const IdeasContainer = memo<Props>(({ projectId, className }) => {
  const project = useProject({ projectId });
  const windowSize = useWindowSize();

  if (!isNilOrError(project)) {
    const projectType = project?.attributes.process_type;
    const participationMethod = project?.attributes.participation_method;
    const showIdeas = !!(
      projectType === 'continuous' &&
      (participationMethod === 'budgeting' ||
        participationMethod === 'ideation')
    );
    const inputTerm = project.attributes.input_term;

    if (showIdeas) {
      const smallerThanBigTablet = windowSize?.windowWidth
        ? windowSize?.windowWidth <= viewportWidths.smallTablet
        : false;
      const isPBProject =
        project.attributes.participation_method === 'budgeting';
      const projectId = project.id;
      const projectIds = [projectId];

      return (
        <Container
          id="e2e-continuos-project-idea-cards"
          className={className || ''}
        >
          <StyledContentContainer id="project-ideas" maxWidth={maxPageWidth}>
            <SectionContainer>
              {isPBProject && (
                <StyledPBExpenses
                  participationContextId={projectId}
                  participationContextType="project"
                  viewMode={smallerThanBigTablet ? 'column' : 'row'}
                />
              )}
              <StyledProjectPageSectionTitle>
                <FormattedMessage
                  {...getInputTermMessage(inputTerm, {
                    idea: messages.ideas,
                    option: messages.options,
                    project: messages.projects,
                    question: messages.questions,
                    issue: messages.issues,
                    contribution: messages.contributions,
                  })}
                />
              </StyledProjectPageSectionTitle>
              <IdeaCards
                type="load-more"
                projectIds={projectIds}
                participationMethod={project.attributes.participation_method}
                participationContextId={projectId}
                participationContextType="project"
                showViewToggle={true}
                defaultSortingMethod={project.attributes.ideas_order || null}
                defaultView={project.attributes.presentation_mode || null}
                invisibleTitleMessage={messages.a11y_titleInputs}
              />
            </SectionContainer>
          </StyledContentContainer>
        </Container>
      );
    }
  }

  return null;
});

export default IdeasContainer;
