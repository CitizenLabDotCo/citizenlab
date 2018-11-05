import React from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import TypeformSurvey from './TypeformSurvey';
import SurveymonkeySurvey from './SurveymonkeySurvey';
import Warning from 'components/UI/Warning';

// resources
import { IPhaseData } from 'services/phases';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import { surveyTakingState, DisabledReasons } from 'services/surveyTakingRules';

// styling
import styled from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const Container = styled.div``;

interface InputProps {
  surveyEmbedUrl?: string;
  surveyService?: string;
  phase?: IPhaseData;
  projectId: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class Survey extends React.PureComponent<Props, State> {

  disabledMessage: {[key in DisabledReasons]: ReactIntl.FormattedMessage.MessageDescriptor} = {
    projectInactive: messages.surveyDisabledProjectInactive,
    maybeNotPermitted: messages.surveyDisabledMaybeNotPermitted,
    notPermitted: messages.surveyDisabledNotPermitted,
    notActivePhase: messages.surveyDisabledNotActivePhase,
  };

  render() {
    const { surveyEmbedUrl, surveyService, authUser, project, phase } = this.props;

    if (isNilOrError(project)) return null;

    const { show, disabledReason } = surveyTakingState({
      project,
      phaseContext: phase,
      signedIn: !isNilOrError(authUser),
    });

    if (show) {
      if (surveyEmbedUrl && surveyService) {
        const email = (authUser ? authUser.attributes.email : null);

        return (
          <Container className={this.props['className']}>
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
          </Container>
        );
      }
      return null;
    } else {
      const message = disabledReason ? this.disabledMessage[disabledReason] : messages.surveyDisabledNotPossible;
      return (
        <Warning
          icon="lock"
        >
          <FormattedMessage {...message} />
        </Warning>
      );
    }

  }
}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  project: ({ projectId, render }) => <GetProject id={projectId}>{render}</GetProject>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <Survey {...inputProps} {...dataProps} />}
  </Data>
);
