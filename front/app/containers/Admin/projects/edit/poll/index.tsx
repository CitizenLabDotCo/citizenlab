// Libraries
import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import { adopt } from 'react-adopt';
import styled from 'styled-components';
import { isError } from 'lodash-es';

// Services / Data loading
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import GetPollQuestions, {
  GetPollQuestionsChildProps,
} from 'resources/GetPollQuestions';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// Components
import FeatureFlag from 'components/FeatureFlag';
import ExportPollButton from './ExportPollButton';
import PollAdminForm from './PollAdminForm';
import T from 'components/T';
import { SectionTitle, SectionDescription } from 'components/admin/Section';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;
const PhaseContainer = styled.div`
  &:not(:last-child) {
    margin-bottom: 50px;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0;
  margin: 0;
  margin-bottom: 30px;
`;

const Left = styled.div`
  margin-right: 80px;
`;

interface InputProps {}

interface DataProps {
  project: GetProjectChildProps;
  phases: GetPhasesChildProps;
  locale: GetLocaleChildProps;
}

interface Props extends InputProps, DataProps {}

export class AdminProjectPoll extends React.PureComponent<Props> {
  render() {
    const { project, phases, locale } = this.props;
    if (isNilOrError(project) || isNilOrError(locale)) return null;

    if (
      project.attributes.process_type === 'continuous' &&
      project.attributes.participation_method === 'poll'
    ) {
      return (
        <FeatureFlag name="polls">
          <Container>
            <HeaderContainer>
              <Left>
                <SectionTitle>
                  <FormattedMessage {...messages.titlePollTab} />
                </SectionTitle>
                <SectionDescription>
                  <FormattedMessage {...messages.pollTabSubtitle} />
                </SectionDescription>
              </Left>
              <ExportPollButton
                participationContextType="project"
                participationContextId={project.id}
              />
            </HeaderContainer>
            <GetPollQuestions
              participationContextId={project.id}
              participationContextType="project"
            >
              {(pollQuestions: GetPollQuestionsChildProps) => (
                <PollAdminForm
                  participationContextType="project"
                  participationContextId={project.id}
                  pollQuestions={isError(pollQuestions) ? null : pollQuestions}
                />
              )}
            </GetPollQuestions>
          </Container>
        </FeatureFlag>
      );
    }

    if (
      project.attributes.process_type === 'timeline' &&
      !isNilOrError(phases)
    ) {
      const pollPhases = phases.filter(
        (phase) => phase.attributes.participation_method === 'poll'
      );
      if (pollPhases.length === 0) return null;
      return (
        <FeatureFlag name="polls">
          <Container>
            <SectionTitle>
              <FormattedMessage {...messages.titlePollTab} />
            </SectionTitle>
            <SectionDescription>
              <FormattedMessage {...messages.pollTabSubtitle} />
            </SectionDescription>
            {pollPhases.map((phase) => (
              <PhaseContainer key={phase.id}>
                <HeaderContainer>
                  <Left>
                    <h3>
                      <T value={phase.attributes.title_multiloc} />
                    </h3>
                  </Left>
                  <ExportPollButton
                    participationContextId={phase.id}
                    participationContextType="phase"
                  />
                </HeaderContainer>
                <GetPollQuestions
                  participationContextId={phase.id}
                  participationContextType="phase"
                >
                  {(pollQuestions: GetPollQuestionsChildProps) => (
                    <PollAdminForm
                      participationContextType="phase"
                      participationContextId={phase.id}
                      pollQuestions={
                        isError(pollQuestions) ? null : pollQuestions
                      }
                    />
                  )}
                </GetPollQuestions>
              </PhaseContainer>
            ))}
          </Container>
        </FeatureFlag>
      );
    }
    return null;
  }
}

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  phases: ({ params, render }) => (
    <GetPhases projectId={params.projectId}>{render}</GetPhases>
  ),
  project: ({ params, render }) => (
    <GetProject projectId={params.projectId}>{render}</GetProject>
  ),
  locale: <GetLocale />,
});

export default withRouter<InputProps>(
  (inputProps: InputProps & WithRouterProps) => (
    <Data {...inputProps}>
      {(dataProps) => <AdminProjectPoll {...inputProps} {...dataProps} />}
    </Data>
  )
);
