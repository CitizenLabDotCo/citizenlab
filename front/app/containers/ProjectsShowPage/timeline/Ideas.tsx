import React, { useState, useCallback, useEffect } from 'react';

// hooks
import usePhase from 'api/phases/usePhase';

// components
import { IdeaCardsWithoutFiltersSidebar } from 'components/IdeaCards';
import { ProjectPageSectionTitle } from 'containers/ProjectsShowPage/styles';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from 'containers/ProjectsShowPage/messages';
import { getInputTermMessage } from 'utils/i18n';

// style
import styled from 'styled-components';

// utils
import { ideaDefaultSortMethodFallback } from 'services/participationContexts';

// typings
import { IQueryParameters } from 'api/ideas/types';
import { IPhaseData } from 'api/phases/types';

const Container = styled.div``;

const StyledProjectPageSectionTitle = styled(ProjectPageSectionTitle)`
  margin-bottom: 20px;
`;

interface InnerProps {
  projectId: string;
  phase: IPhaseData;
  className?: string;
}

const IdeasContainer = ({ projectId, phase, className }: InnerProps) => {
  const [ideaQueryParameters, setIdeaQueryParameters] =
    useState<IQueryParameters>({
      projects: [projectId],
      phase: phase.id,
      sort: phase.attributes.ideas_order ?? ideaDefaultSortMethodFallback,
      'page[number]': 1,
      'page[size]': 24,
    });

  useEffect(() => {
    setIdeaQueryParameters((current) => ({
      ...current,
      phase: phase.id,
      sort: phase.attributes.ideas_order ?? ideaDefaultSortMethodFallback,
    }));
  }, [phase]);

  const updateQuery = useCallback((newParams: Partial<IQueryParameters>) => {
    setIdeaQueryParameters((current) => ({ ...current, ...newParams }));
  }, []);

  const participationMethod = phase.attributes.participation_method;
  if (
    !(participationMethod === 'ideation' || participationMethod === 'budgeting')
  ) {
    return null;
  }

  const inputTerm = phase.attributes.input_term;

  return (
    <Container
      id="project-ideas"
      className={`e2e-timeline-project-idea-cards ${className || ''}`}
    >
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
      <IdeaCardsWithoutFiltersSidebar
        ideaQueryParameters={ideaQueryParameters}
        onUpdateQuery={updateQuery}
        className={participationMethod}
        projectId={projectId}
        showViewToggle={true}
        defaultSortingMethod={phase.attributes.ideas_order || null}
        defaultView={phase.attributes.presentation_mode}
        participationMethod={participationMethod}
        participationContextId={phase.id}
        participationContextType="phase"
        invisibleTitleMessage={messages.a11y_titleInputsPhase}
        phaseId={phase.id}
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
