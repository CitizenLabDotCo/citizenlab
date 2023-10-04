import React, { useMemo } from 'react';

// hooks
import usePhase from 'api/phases/usePhase';

// components
import { IdeaCardsWithoutFiltersSidebar } from 'components/IdeaCards';
import { ProjectPageSectionTitle } from 'containers/ProjectsShowPage/styles';

// router
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from 'containers/ProjectsShowPage/messages';
import { getInputTermMessage } from 'utils/i18n';

// style
import styled from 'styled-components';

// utils
import { ideaDefaultSortMethodFallback } from 'utils/participationContexts';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';

// typings
import { IPhaseData } from 'api/phases/types';
import { Sort } from 'components/IdeaCards/shared/Filters/SortFilterDropdown';

const Container = styled.div``;

const StyledProjectPageSectionTitle = styled(ProjectPageSectionTitle)`
  margin-bottom: 20px;
`;

interface InnerProps {
  projectId: string;
  phase: IPhaseData;
  className?: string;
}

interface QueryParameters {
  // constants
  'page[number]': number;
  'page[size]': number;
  projects: string[];
  phase: string;

  // filters
  search?: string;
  sort: Sort;
  topics?: string[];
}

const IdeasContainer = ({ projectId, phase, className }: InnerProps) => {
  const [searchParams] = useSearchParams();
  const sortParam = searchParams.get('sort') as Sort | null;
  const searchParam = searchParams.get('search');
  const topicsParam = searchParams.get('topics');
  const config = getMethodConfig(phase.attributes.participation_method);

  const ideaQueryParameters = useMemo<QueryParameters>(
    () => ({
      'page[number]': 1,
      'page[size]': config.inputsListPageSize || 24,
      projects: [projectId],
      phase: phase.id,
      sort:
        sortParam ??
        phase.attributes.ideas_order ??
        ideaDefaultSortMethodFallback,
      search: searchParam ?? undefined,
      topics: topicsParam ? JSON.parse(topicsParam) : undefined,
    }),
    [config, projectId, sortParam, searchParam, phase, topicsParam]
  );

  const participationMethod = phase.attributes.participation_method;
  const isVotingContext = participationMethod === 'voting';

  if (
    !(participationMethod === 'ideation' || participationMethod === 'voting')
  ) {
    return null;
  }

  const inputTerm = phase.attributes.input_term;

  return (
    <Container
      id="project-ideas"
      className={`e2e-timeline-project-idea-cards ${className || ''}`}
    >
      {!isVotingContext && (
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
        className={participationMethod}
        projectId={projectId}
        showViewToggle={true}
        defaultSortingMethod={ideaQueryParameters.sort || null}
        defaultView={phase.attributes.presentation_mode}
        invisibleTitleMessage={messages.a11y_titleInputsPhase}
        phaseId={phase.id}
        showDropdownFilters={isVotingContext ? false : true}
        showSearchbar={isVotingContext ? false : true}
      />
    </Container>
  );
};

interface Props {
  projectId: string;
  phaseId: string;
  className?: string;
}

const IdeasContainerOuter = ({ phaseId, projectId, className }: Props) => {
  const { data: phase } = usePhase(phaseId);
  if (!phase) return null;

  return (
    <IdeasContainer
      projectId={projectId}
      phase={phase.data}
      className={className}
    />
  );
};

export default IdeasContainerOuter;
