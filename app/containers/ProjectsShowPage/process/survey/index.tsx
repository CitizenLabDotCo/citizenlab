import * as React from 'react';
import TypeformSurvey from './TypeformSurvey';
import SurveymonkeySurvey from './SurveymonkeySurvey';

type Props = {
  surveyId?: string,
  surveyService?: string,
};

type State = {};

class Survey extends React.Component<Props, State> {

  render() {
    const { surveyId, surveyService } = this.props;
    if (!surveyId) return null;

    return (
      <>
        {surveyService === 'typeform' &&
          <TypeformSurvey
            typeformUrl={surveyId}
            email="kok"
          />
        }
        {surveyService === 'survey_monkey' &&
          <SurveymonkeySurvey
            surveymonkeyUrl={surveyId}
            email="kok"
          />
        }
      </>
    );
  }

}

export default Survey;
