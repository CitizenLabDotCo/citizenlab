import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import TypeformSurvey from './TypeformSurvey';
import SurveymonkeySurvey from './SurveymonkeySurvey';
import GoogleFormsSurvey from './GoogleFormsSurvey';
import Warning from 'components/UI/Warning';
import Button from 'components/UI/Button';

// services
import { surveyTakingState, DisabledReasons } from 'services/surveyTakingRules';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';

// styling
import styled from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const Container = styled.div``;

const StyledButton = styled(Button)`
  color: #1391A1;
  text-decoration: underline;
  transition: all 100ms ease-out;

  &:hover {
    text-decoration: underline;
  }
  display: inline-block
`;

interface InputProps {
  projectId: string | null;
  phaseId?: string | null;
  surveyEmbedUrl: string;
  surveyService: string;
  className?: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
  project: GetProjectChildProps;
  phase: GetPhaseChildProps;
}

interface Props extends InputProps, DataProps { }

interface State { }

class Survey extends PureComponent<Props, State> {
  onVerify = () => {
    console.log('TODO open modal');
  }

  disabledMessage: { [key in DisabledReasons]: ReactIntl.FormattedMessage.MessageDescriptor } = {
    projectInactive: messages.surveyDisabledProjectInactive,
    maybeNotPermitted: messages.surveyDisabledMaybeNotPermitted,
    notPermitted: messages.surveyDisabledNotPermitted,
    notActivePhase: messages.surveyDisabledNotActivePhase,
    notVerified: messages.surveyDisabledNotVerified,
  };

  render() {
    const { surveyEmbedUrl, surveyService, authUser, project, phase, className } = this.props;

    if (isNilOrError(project)) return null;

    const { show, disabledReason } = surveyTakingState({
      project,
      phaseContext: phase,
      signedIn: !isNilOrError(authUser),
    });

    if (show) {
      const email = (authUser ? authUser.attributes.email : null);

      return (
        <Container className={`${className} e2e-${surveyService}-survey`}>
          {surveyService === 'typeform' &&
            <TypeformSurvey
              typeformUrl={surveyEmbedUrl}
              email={(email || null)}
            />
          }

          {surveyService === 'survey_monkey' &&
            <SurveymonkeySurvey
              surveymonkeyUrl={surveyEmbedUrl}
            />
          }

          {surveyService === 'google_forms' &&
            <GoogleFormsSurvey
              googleFormsUrl={surveyEmbedUrl}
            />
          }
        </Container>
      );
    } else {
      const message = disabledReason ? this.disabledMessage[disabledReason] : messages.surveyDisabledNotPossible;

      return (
        <Container className={`warning ${className}`}>
          <Warning icon="lock">
            <FormattedMessage
              {...message}
              values={{
                verificationLink: <StyledButton style="text" padding="0" onClick={this.onVerify}><FormattedMessage {...messages.verificationLinkText} /></StyledButton>,
              }}
            />
          </Warning>
        </Container>
      );
    }
  }
}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  project: ({ projectId, render }) => <GetProject id={projectId}>{render}</GetProject>,
  phase: ({ phaseId, render }) => <GetPhase id={phaseId}>{render}</GetPhase>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <Survey {...inputProps} {...dataProps} />}
  </Data>
);
