import React from 'react';

// components
import TypeformSurvey from './TypeformSurvey';
import SurveymonkeySurvey from './SurveymonkeySurvey';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// styling
import styled from 'styled-components';

const Container = styled.div``;

interface InputProps {
  surveyEmbedUrl?: string;
  surveyService?: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class Survey extends React.PureComponent<Props, State> {
  render() {
    const { surveyEmbedUrl, surveyService, authUser } = this.props;

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
  }
}

export default (inputProps: InputProps) => (
  <GetAuthUser>
    {authUser => <Survey {...inputProps} authUser={authUser} />}
  </GetAuthUser>
);
