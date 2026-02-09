import React, { lazy, Suspense, useMemo } from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';
import { useParams, useSearchParams } from 'react-router-dom';

import { IdeaSortMethod, IPhaseData } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import { IdeaSortMethodFallback } from 'api/phases/utils';

import messages from 'containers/ProjectsShowPage/messages';

const IdeasWithFiltersSidebar = lazy(
  () => import('components/IdeaCards/IdeasWithFiltersSidebar')
);

import { IdeaCardsWithoutFiltersSidebar } from 'components/IdeaCards';
import { Props as WithFiltersProps } from 'components/IdeaCards/IdeasWithFiltersSidebar';
import IdeaListScrollAnchor from 'components/IdeaListScrollAnchor';

import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';

interface InnerProps {
  projectId: string;
  phase: IPhaseData;
  className?: string;
}

interface QueryParameters {
  'page[number]': number;
  'page[size]': number;
  projects: string[];
  phase: string;

  // filters
  search?: string;
  sort: IdeaSortMethod;
  input_topics?: string[];
  idea_status?: string;
}

const IdeasContainer = ({ projectId, phase, className }: InnerProps) => {
  const { slug } = useParams() as { slug: string };
  const [searchParams] = useSearchParams();
  const sortParam = searchParams.get('sort') as IdeaSortMethod | null;
  const searchParam = searchParams.get('search');
  const topicsParam = searchParams.get('topics');
  const ideaStatusParam = searchParams.get('idea_status');
  const config = getMethodConfig(phase.attributes.participation_method, {
    showIdeaFilters: phase.attributes.voting_filtering_enabled,
  });
  // Feed view is now handled through the view switcher in IdeasView
  const ideaQueryParameters = useMemo<QueryParameters>(
    () => ({
      'page[number]': 1,
      'page[size]': config.inputsPageSize || 24,
      projects: [projectId],
      phase: phase.id,
      sort: sortParam ?? phase.attributes.ideas_order ?? IdeaSortMethodFallback,
      search: searchParam ?? undefined,
      input_topics: topicsParam ? JSON.parse(topicsParam) : undefined,
      idea_status: ideaStatusParam ?? undefined,
    }),
    [
      config,
      projectId,
      sortParam,
      searchParam,
      phase,
      topicsParam,
      ideaStatusParam,
    ]
  );

  const participationMethod = phase.attributes.participation_method;

  const inputTerm = phase.attributes.input_term;

  const sharedProps: WithFiltersProps = {
    ideaQueryParameters,
    onUpdateQuery: updateSearchParams,
    projectId,
    phaseId: phase.id,
    projectSlug: slug,
    defaultView: phase.attributes.presentation_mode,
  };
  const sidebarFiltersEnabled = config.showIdeaFilters === true;

  return (
    <Box
      id="project-ideas"
      className={`e2e-timeline-project-idea-cards ${className || ''}`}
    >
      {sidebarFiltersEnabled ? (
        <>
          <IdeaListScrollAnchor />
          <Suspense fallback={<Spinner />}>
            <IdeasWithFiltersSidebar inputTerm={inputTerm} {...sharedProps} />
          </Suspense>
        </>
      ) : (
        <IdeaCardsWithoutFiltersSidebar
          defaultSortingMethod={ideaQueryParameters.sort}
          invisibleTitleMessage={messages.a11y_titleInputsPhase}
          showDropdownFilters={config.showIdeaFilters ?? false}
          showSearchbar={participationMethod !== 'voting'}
          {...sharedProps}
        />
      )}
    </Box>
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
