import React, { memo, useMemo } from 'react';

// components
import ContentContainer from 'components/ContentContainer';
import { IdeaCardsWithoutFiltersSidebar } from 'components/IdeaCards';
import {
  ProjectPageSectionTitle,
  maxPageWidth,
} from 'containers/ProjectsShowPage/styles';
import SectionContainer from 'components/SectionContainer';
import StatusModule from 'components/StatusModule';

// router
import { useSearchParams } from 'react-router-dom';

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
import { ideaDefaultSortMethodFallback } from 'utils/participationContexts';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';

// typings
import { IProjectData } from 'api/projects/types';
import { Sort } from 'components/IdeaCards/shared/Filters/SortFilterDropdown';

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

interface QueryParameters {
  // constants
  'page[number]': number;
  'page[size]': number;
  projects: string[];

  // filters
  search?: string;
  sort: Sort;
  topics?: string[];
}

const IdeasContainer = memo<InnerProps>(({ project, className }) => {
  const [searchParams] = useSearchParams();
  const sortParam = searchParams.get('sort') as Sort | null;
  const searchParam = searchParams.get('search');
  const topicsParam = searchParams.get('topics');
  const config = getMethodConfig(project.attributes.participation_method);

  const ideaQueryParameters = useMemo<QueryParameters>(
    () => ({
      'page[number]': 1,
      'page[size]': config.inputsPageSize || 24,
      projects: [project.id],
      sort:
        sortParam ??
        project.attributes.ideas_order ??
        ideaDefaultSortMethodFallback,
      search: searchParam ?? undefined,
      topics: topicsParam ? JSON.parse(topicsParam) : undefined,
    }),
    [
      config,
      project.id,
      project.attributes.ideas_order,
      sortParam,
      searchParam,
      topicsParam,
    ]
  );

  const projectType = project.attributes.process_type;
  const participationMethod = project.attributes.participation_method;
  const showIdeas = !!(
    projectType === 'continuous' &&
    (participationMethod === 'voting' || participationMethod === 'ideation')
  );

  if (showIdeas) {
    const inputTerm = project.attributes.input_term;
    const isVotingProject =
      project.attributes.participation_method === 'voting';

    return (
      <Container
        id="e2e-continuous-project-idea-cards"
        className={className || ''}
      >
        <StyledContentContainer id="project-ideas" maxWidth={maxPageWidth}>
          <SectionContainer>
            {isVotingProject && (
              <>
                <StatusModule
                  votingMethod={project?.attributes.voting_method}
                  project={project}
                />
              </>
            )}
            {!isVotingProject && (
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
              onUpdateQuery={updateSearchParams}
              projectId={project.id}
              defaultSortingMethod={ideaQueryParameters.sort}
              showViewToggle={true}
              defaultView={project.attributes.presentation_mode}
              invisibleTitleMessage={messages.a11y_titleInputs}
              showDropdownFilters={isVotingProject ? false : true}
              showSearchbar={isVotingProject ? false : true}
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
