import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// router
import { browserHistory } from 'react-router';

// components
import Step2 from 'components/SignUp/Step2';
import SignInUpBanner from 'components/SignInUpBanner';
import { landingPageIdeasQuery } from 'containers/LandingPage';

// services
import { authUserStream } from 'services/auth';
import { currentTenantStream } from 'services/tenant';
import { ideaByIdStream, ideasStream, updateIdea } from 'services/ideas';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: row;
  background: #f9f9fa;
  position: relative;

  ${media.biggerThanMaxTablet`
    overflow: hidden;
    height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  `}
`;

const Section = styled.div`
  flex: 1;
  height: 100%;
`;

const Left = Section.extend`
  width: 50vw;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
  display: none;

  ${media.biggerThanMaxTablet`
    display: block;
  `}
`;

const Right = Section.extend`
  width: 100%;

  ${media.biggerThanMaxTablet`
    padding-left: 50vw;
    overflow: hidden;
    overflow-y: auto;
  `}
`;

const RightInner = styled.div`
  width: 100%;
  max-width: 420px;
  margin-left: auto;
  margin-right: auto;
  padding-top: 40px;
  padding-bottom: 100px;
  padding-left: 30px;
  padding-right: 30px;

  ${media.smallerThanMaxTablet`
    padding-bottom: 70px;
  `}
`;

const Title = styled.h2`
  width: 100%;
  color: #333;
  font-size: 36px;
  line-height: 42px;
  font-weight: 500;
  text-align: left;
  margin-bottom: 35px;
`;

type Props = {};

type State = {
  loading: boolean;
};

export default class CompleteSignUpPage extends React.PureComponent<Props, State> {
  
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      loading: false
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const query = browserHistory.getCurrentLocation().query;
    const authUser$ = authUserStream().observable;
    const currentTenant$ = currentTenantStream().observable;
    const ideaToPublish$ = (query && query.idea_to_publish ? ideaByIdStream(query.idea_to_publish).observable : Rx.Observable.of(null));

    this.subscriptions = [
      Rx.Observable.combineLatest(
        currentTenant$,
      ).subscribe(([currentTenant]) => {
        const { birthyear, domicile, gender } = currentTenant.data.attributes.settings.demographic_fields;
        const demographicFieldsEnabled = _.get(currentTenant, `data.attributes.settings.demographic_fields.enabled`);
        const hasOneOrMoreActiveDemographicFields = [birthyear, domicile, gender].some(value => value === true);

        if (!demographicFieldsEnabled || !hasOneOrMoreActiveDemographicFields) {
          // exit
          this.handleOnCompleted();
        } else {
          this.setState({ loading: false });
        }
      }),

      Rx.Observable.combineLatest(
        authUser$,
        ideaToPublish$
      ).subscribe(async ([authUser, ideaToPublish]) => {
        if (authUser && ideaToPublish && ideaToPublish.data.attributes.publication_status === 'draft') {
          await updateIdea(ideaToPublish.data.id, { author_id: authUser.data.id, publication_status: 'published' });
          ideasStream({ queryParameters: landingPageIdeasQuery }).fetch();
        }

        // remove idea parameter from the url
        window.history.replaceState(null, '', window.location.pathname);
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleOnCompleted = () => {
    browserHistory.push('/');
  }

  render() {
    const { loading } = this.state;

    if (!loading) {
      return (
        <Container>
          <Left>
            <SignInUpBanner />
          </Left>
          <Right>
            <RightInner>
              <Title><FormattedMessage {...messages.title} /></Title>
              <Step2 onCompleted={this.handleOnCompleted} />
            </RightInner>
          </Right>
        </Container>
      );
    }

    return null;
  }
}
