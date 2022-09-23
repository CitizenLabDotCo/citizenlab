import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import ContentContainer from 'components/ContentContainer';
import IdeaCards from 'components/IdeaCards';
import SectionContainer from 'components/SectionContainer';
import {
  maxPageWidth,
  ProjectPageSectionTitle,
} from 'containers/ProjectsShowPage/styles';
import PBExpenses from '../shared/pb/PBExpenses';

// hooks
import { useWindowSize } from '@citizenlab/cl2-component-library';
import useProject from 'hooks/useProject';

// i18n
import messages from 'containers/ProjectsShowPage/messages';
import { FormattedMessage } from 'react-intl';
import { getInputTermMessage } from 'utils/i18n';

// style
import styled from 'styled-components';
import { colors, viewportWidths } from 'utils/styleUtils';

const Container = styled.div``;

const StyledContentContainer = styled(ContentContainer)`
  background: ${colors.background};
`;

const StyledProjectPageSectionTitle = styled(ProjectPageSectionTitle)`
  margin-bottom: 20px;
`;

const StyledPBExpenses = styled(PBExpenses)`
  padding: 20px;
  margin-bottom: 50px;
`;

interface Props {
  projectId: string;
  className?: string;
}

const IdeasContainer = memo<Props>(({ projectId, className }) => {
  const project = useProject({ projectId });
  const windowSize = useWindowSize();

  const projectType = project?.attributes.process_type;
  const participationMethod = project?.attributes.participation_method;
  const showIdeas = !!(
    projectType === 'continuous' &&
    (participationMethod === 'budgeting' || participationMethod === 'ideation')
  );

  if (!isNilOrError(project) && showIdeas) {
    const inputTerm = project.attributes.input_term;
    const smallerThanBigTablet = windowSize?.windowWidth
      ? windowSize?.windowWidth <= viewportWidths.smallTablet
      : false;
    const isPBProject = project.attributes.participation_method === 'budgeting';

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
              projectId={projectId}
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

  return null;
});

export default IdeasContainer;
