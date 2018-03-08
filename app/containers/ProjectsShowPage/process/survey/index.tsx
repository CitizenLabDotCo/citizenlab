import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import TypeformSurvey from './TypeformSurvey';
import SurveymonkeySurvey from './SurveymonkeySurvey';
import { authUserStream } from 'services/auth';
import { IUser } from 'services/users';
import styled from 'styled-components';

const Container = styled.div``;

type Props = {
  surveyEmbedUrl?: string,
  surveyService?: string,
};

type State = {
  user: IUser | null;
  loaded: boolean;
};

class Survey extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      user: null,
      loaded: false,
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const authUser$ = authUserStream().observable;

    this.subscriptions = [
      authUser$.subscribe((user) => {
        this.setState({ user, loaded: true });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { user, loaded } = this.state;
    const { surveyEmbedUrl, surveyService } = this.props;

    if (surveyEmbedUrl && surveyService && loaded) {
      const email = (user ? user.data.attributes.email : null);

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

export default Survey;
