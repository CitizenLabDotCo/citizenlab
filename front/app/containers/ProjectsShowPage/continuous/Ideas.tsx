import React, { memo, useCallback, useState } from 'react';

// components
import ContentContainer from 'components/ContentContainer';
import { IdeaCardsWithoutFiltersSidebar } from 'components/IdeaCards';
import {
  ProjectPageSectionTitle,
  maxPageWidth,
} from 'containers/ProjectsShowPage/styles';
import SectionContainer from 'components/SectionContainer';
import StatusModule from 'components/StatusModule';

// hooks
import useProjectById from 'api/projects/useProjectById';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from 'containers/ProjectsShowPage/messages';
import { getInputTermMessage } from 'utils/i18n';

// style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { ideaDefaultSortMethodFallback } from 'services/participationContexts';

// typings
import { IProjectData } from 'api/projects/types';
import { IQueryParameters } from 'api/ideas/types';

const Container = styled.div``;

const StyledContentContainer = styled(ContentContainer)`
  background: ${colors.background};
`;

const StyledProjectPageSectionTitle = styled(ProjectPageSectionTitle)`
  margin-bottom: 20px;
`;

interface InnerProps {
  className?: string;
  project: IProjectData;
}

const IdeasContainer = memo<InnerProps>(({ project, className }) => {
  const [ideaQueryParameters, setIdeaQueryParameters] =
    useState<IQueryParameters>({
      projects: [project.id],
      sort: project.attributes.ideas_order ?? ideaDefaultSortMethodFallback,
      'page[number]': 1,
      'page[size]': 24,
    });

  const updateQuery = useCallback((newParams: Partial<IQueryParameters>) => {
    setIdeaQueryParameters((current) => ({ ...current, ...newParams }));
  }, []);

  const projectType = project.attributes.process_type;
  const participationMethod = project.attributes.participation_method;
  const showIdeas = !!(
    projectType === 'continuous' &&
    (participationMethod === 'budgeting' || participationMethod === 'ideation')
  );

  if (!isNilOrError(project) && showIdeas) {
    const inputTerm = project.attributes.input_term;
    const isPBProject = project.attributes.participation_method === 'budgeting';

    return (
      <Container
        id="e2e-continuos-project-idea-cards"
        className={className || ''}
      >
        <StyledContentContainer id="project-ideas" maxWidth={maxPageWidth}>
          <SectionContainer>
            {isPBProject && (
              <>
                <StatusModule
                  // votingMethod={project.attributes.voting_method}
                  votingMethod={'budgeting'} // TODO: Get from data once implemented
                  project={project}
                />
              </>
            )}
            {!isPBProject && (
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
            )}

            <IdeaCardsWithoutFiltersSidebar
              ideaQueryParameters={ideaQueryParameters}
              onUpdateQuery={updateQuery}
              projectId={project.id}
              participationMethod={project.attributes.participation_method}
              defaultSortingMethod={project.attributes.ideas_order}
              participationContextId={project.id}
              participationContextType="project"
              showViewToggle={true}
              defaultView={project.attributes.presentation_mode || null}
              invisibleTitleMessage={messages.a11y_titleInputs}
              showDropdownFilters={isPBProject ? false : true}
              showSearchbar={isPBProject ? false : true}
            />
          </SectionContainer>
        </StyledContentContainer>
      </Container>
    );
  }

  return null;
});

interface Props {
  projectId: string;
  className?: string;
}

const IdeasContainerWrapper = ({ projectId, className }: Props) => {
  const { data: project } = useProjectById(projectId);
  if (!project) return null;

  return <IdeasContainer className={className} project={project.data} />;
};

export default IdeasContainerWrapper;
