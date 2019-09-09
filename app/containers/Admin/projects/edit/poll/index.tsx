// Libraries
import React, { Fragment } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import { adopt } from 'react-adopt';
import styled from 'styled-components';
import { isError } from 'lodash-es';

// Services / Data loading
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import GetPollQuestions, { GetPollQuestionsChildProps } from 'resources/GetPollQuestions';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// Components
import FeatureFlag from 'components/FeatureFlag';
import ExportPollButton from './ExportPollButton';
import PollAdminForm from './PollAdminForm';
import T from 'components/T';
import { SectionTitle, SectionSubtitle } from 'components/admin/Section';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 500px;
`;

interface InputProps { }

interface DataProps {
  project: GetProjectChildProps;
  phases: GetPhasesChildProps;
  locale: GetLocaleChildProps;
}

interface Props extends InputProps, DataProps { }

class AdminProjectPoll extends React.PureComponent<Props> {

  renderPolls = () => {
    const { project, phases, locale } = this.props;

    if (isNilOrError(project) || isNilOrError(locale)) return null;

    if (project.attributes.process_type === 'continuous'
      && project.attributes.participation_method === 'poll'
    ) {
      return (
        <>
          <GetPollQuestions
            participationContextId={project.id}
            participationContextType="projects"
          >
            {(pollQuestions: GetPollQuestionsChildProps) => (
              <PollAdminForm
                pcType="projects"
                pcId={project.id}
                pollQuestions={isError(pollQuestions) ? null : pollQuestions}
                locale={locale}
              />
            )}
          </GetPollQuestions>
          <ExportPollButton
            type="projects"
            id={project.id}
          />
        </>
      );
    }

    if (project.attributes.process_type === 'timeline' && !isNilOrError(phases)) {
      return phases.filter(phase => phase.attributes.participation_method === 'poll').map(phase => {
        return (
          <Fragment key={phase.id}>
            <h3>
              <T value={phase.attributes.title_multiloc} />
            </h3>
            <GetPollQuestions
              participationContextId={phase.id}
              participationContextType="phases"
            >
              {(pollQuestions: GetPollQuestionsChildProps) => (
                <PollAdminForm
                  pcType="phases"
                  pcId={phase.id}
                  pollQuestions={isError(pollQuestions) ? null : pollQuestions}
                  locale={locale}
                />
              )}
            </GetPollQuestions>
            <ExportPollButton
              id={phase.id}
              type="phases"
            />
          </Fragment>
        );
      });
    }

    return null;
  }

  render() {
    return (
      <FeatureFlag name="polls">
        <SectionTitle>
          <FormattedMessage {...messages.titlePollTab} />
        </SectionTitle>
        <SectionSubtitle>
          <FormattedMessage {...messages.subtitlePollTab} />
        </SectionSubtitle>
        <Container>
          {this.renderPolls()}
        </Container>
      </FeatureFlag>
    );
  }
}

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  phases: ({ params, render }) => <GetPhases projectId={params.projectId} >{render}</GetPhases>,
  project: ({ params, render }) => <GetProject id={params.projectId} >{render}</GetProject>,
  locale: <GetLocale />
});

export default withRouter<InputProps>((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => <AdminProjectPoll {...inputProps} {...dataProps} />}
  </Data>
));
