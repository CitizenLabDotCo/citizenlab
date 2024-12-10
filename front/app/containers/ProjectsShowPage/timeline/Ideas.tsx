import React, { useMemo } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import { IdeaSortMethod, IPhaseData } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import { IdeaSortMethodFallback } from 'api/phases/utils';

import messages from 'containers/ProjectsShowPage/messages';

import {
  IdeaCardsWithFiltersSidebar,
  IdeaCardsWithoutFiltersSidebar,
} from 'components/IdeaCards';
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
  topics?: string[];
  idea_status?: string;
}

const IdeasContainer = ({ projectId, phase, className }: InnerProps) => {
  const [searchParams] = useSearchParams();
  const sortParam = searchParams.get('sort') as IdeaSortMethod | null;
  const searchParam = searchParams.get('search');
  const topicsParam = searchParams.get('topics');
  const ideaStatusParam = searchParams.get('idea_status');
  const config = getMethodConfig(phase.attributes.participation_method);

  const ideaQueryParameters = useMemo<QueryParameters>(
    () => ({
      'page[number]': 1,
      'page[size]': config.inputsPageSize || 24,
      projects: [projectId],
      phase: phase.id,
      sort: sortParam ?? phase.attributes.ideas_order ?? IdeaSortMethodFallback,
      search: searchParam ?? undefined,
      topics: topicsParam ? JSON.parse(topicsParam) : undefined,
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
  const isVotingContext = participationMethod === 'voting';

  const inputTerm = phase.attributes.input_term;

  const sharedProps = {
    className: participationMethod,
    ideaQueryParameters,
    onUpdateQuery: updateSearchParams,
    projectId,
    phaseId: phase.id,
    showViewToggle: true,
    invisbleTitleMessage: messages.a11y_titleInputsPhase,
    defaultView: phase.attributes.presentation_mode,
  };

  return (
    <Box
      id="project-ideas"
      className={`e2e-timeline-project-idea-cards ${className || ''}`}
    >
      {isVotingContext ? (
        <IdeaCardsWithoutFiltersSidebar
          defaultSortingMethod={ideaQueryParameters.sort}
          showDropdownFilters={false}
          showSearchbar={false}
          {...sharedProps}
        />
      ) : (
        <>
          <IdeaListScrollAnchor />
          <IdeaCardsWithFiltersSidebar inputTerm={inputTerm} {...sharedProps} />
        </>
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
