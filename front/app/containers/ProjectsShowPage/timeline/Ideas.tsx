import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import IdeaCards from 'components/IdeaCards';
import { ProjectPageSectionTitle } from 'containers/ProjectsShowPage/styles';

// resources
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from 'containers/ProjectsShowPage/messages';
import { getInputTermMessage } from 'utils/i18n';

// style
import styled from 'styled-components';

const Container = styled.div``;

const StyledProjectPageSectionTitle = styled(ProjectPageSectionTitle)`
  margin-bottom: 20px;
`;

interface InputProps {
  projectId: string;
  phaseId: string;
  className?: string;
}

interface DataProps {
  phase: GetPhaseChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class IdeasContainer extends PureComponent<Props, State> {
  render() {
    const { projectId, phaseId, phase, className } = this.props;
    const projectIds = [projectId];

    if (!isNilOrError(phase)) {
      const participationMethod = phase.attributes.participation_method;
      const inputTerm = phase.attributes.input_term;

      if (
        participationMethod === 'ideation' ||
        participationMethod === 'budgeting'
      ) {
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
            <IdeaCards
              className={participationMethod}
              type="load-more"
              projectIds={projectIds}
              phaseId={phaseId}
              showViewToggle={true}
              defaultSortingMethod={phase.attributes.ideas_order || null}
              defaultView={phase.attributes.presentation_mode}
              participationMethod={participationMethod}
              participationContextId={phase.id}
              participationContextType="phase"
              invisibleTitleMessage={messages.a11y_titleInputsPhase}
            />
          </Container>
        );
      }
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  phase: ({ phaseId, render }) => <GetPhase id={phaseId}>{render}</GetPhase>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <IdeasContainer {...inputProps} {...dataProps} />}
  </Data>
);
