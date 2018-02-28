import * as React from 'react';
import TypeformSurvey from './TypeformSurvey';
import SurveymonkeySurvey from './SurveymonkeySurvey';
import { authUserStream } from 'services/auth';
import { IUser } from 'services/users';

type Props = {
  surveyEmbedUrl?: string,
  surveyService?: string,
};

type State = {
  user: IUser | null;
  userLoaded: boolean;
};

class Survey extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      user: null,
      userLoaded: false,
    };
  }

  componentDidMount() {
    const authUser$ = authUserStream().observable;
    authUser$.subscribe((user) => {
      this.setState({ user, userLoaded: true });
    },
    () => {
      this.setState({ user: null, userLoaded: true });
    });
  }

  render() {
    const { user, userLoaded } = this.state;
    const { surveyEmbedUrl, surveyService } = this.props;

    if (!surveyEmbedUrl || !userLoaded) return null;

    const email = user && user.data.attributes.email || null;

    return (
      <>
        {surveyService === 'typeform' &&
          <TypeformSurvey
            typeformUrl={surveyEmbedUrl}
            email={email}
          />
        }
        {surveyService === 'survey_monkey' &&
          <SurveymonkeySurvey
            surveymonkeyUrl={surveyEmbedUrl}
          />
        }
      </>
    );
  }

}

export default Survey;
