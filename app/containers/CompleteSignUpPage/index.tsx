import React from 'react';
// import { Observable, Subscription } from 'rxjs/Rx';
import { get, isUndefined } from 'lodash';
import { isNilOrError } from 'utils/helperUtils';
import { hasCustomFields } from 'utils/customFields';
import { browserHistory, withRouter, WithRouterProps } from 'react-router';
import { adopt } from 'react-adopt';

// components
import Error from 'components/UI/Error';
import Step2 from 'components/SignUp/Step2';
import SignInUpBanner from 'components/SignInUpBanner';
// import { landingPageIdeasQuery } from 'containers/LandingPage';

// services
import { updateIdea } from 'services/ideas';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetCustomFieldsSchema, { GetCustomFieldsSchemaChildProps } from 'resources/GetCustomFieldsSchema';

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
  align-items: stretch;
  border-top: solid 1px #ddd;
  background: #f9f9fa;
  position: relative;

  ${media.biggerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  `}

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
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
  display: none;

  ${media.biggerThanMaxTablet`
    display: block;
  `}
`;

const Right = Section.extend`
  width: 100%;
  padding-left: 50vw;

  ${media.smallerThanMaxTablet`
    padding: 0;
  `}
`;

const RightInner = styled.div`
  width: 100%;
  max-width: 420px;
  margin-left: auto;
  margin-right: auto;
  padding-top: 60px;
  padding-bottom: 60px;
  padding-left: 30px;
  padding-right: 30px;
`;

const Title = styled.h2`
  width: 100%;
  color: #333;
  font-size: 34px;
  line-height: 42px;
  font-weight: 500;
  text-align: left;
  margin-bottom: 35px;
`;

interface InputProps {}

interface DataProps {
  locale: GetLocaleChildProps;
  authUser: GetAuthUserChildProps;
  idea: GetIdeaChildProps;
  customFieldsSchema: GetCustomFieldsSchemaChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class CompleteSignUpPage extends React.PureComponent<Props & WithRouterProps, State> {
  // subscriptions: Subscription[];

  // constructor(props: Props) {
  //   super(props as any);
  //   this.state = {
  //     authError: false,
  //     loading: false
  //   };
  //   this.subscriptions = [];
  // }

  // componentDidMount() {
  //   const location = browserHistory.getCurrentLocation();
  //   const query = location.query;
  //   const authError = (location.pathname === '/authentication-error');
  //   const authUser$ = authUserStream().observable;
  //   const ideaToPublish$ = (query && query.idea_to_publish ? ideaByIdStream(query.idea_to_publish).observable : Observable.of(null));

  //   this.subscriptions = [
  //     Observable.combineLatest(
  //       authUser$,
  //       ideaToPublish$,
  //     ).subscribe(async ([authUser, ideaToPublish]) => {
  //       const registrationCompletedAt = (authUser ? authUser.data.attributes.registration_completed_at : null);
  //       const isRegistrationCompleted = (isString(registrationCompletedAt) && !isEmpty(registrationCompletedAt));

  //       // remove idea parameter from the url
  //       window.history.replaceState(null, '', window.location.pathname);

  //       if (authUser) {
  //         if (ideaToPublish && ideaToPublish.data.attributes.publication_status === 'draft') {
  //           await updateIdea(ideaToPublish.data.id, { author_id: authUser.data.id, publication_status: 'published' });
  //           ideasStream({ queryParameters: landingPageIdeasQuery }).fetch();
  //         }

  //         if (isRegistrationCompleted) {
  //           this.redirectToLandingPage();
  //         }
  //       } else {
  //         this.redirectToLandingPage();
  //       }

  //       this.setState({ authError, loading: false });
  //     })
  //   ];
  // }

  // componentWillUnmount() {
  //   this.subscriptions.forEach(subscription => subscription.unsubscribe());
  // }

  redirectToLandingPage = () => {
    browserHistory.push('/');
  }

  render() {
    const { location, locale, authUser, idea, customFieldsSchema } = this.props;

    if (get(location.query, 'idea_to_publish', null)) {
      // remove idea parameter from the url
      window.history.replaceState(null, '', window.location.pathname);
    }

    console.log(this.props);

    if (!isNilOrError(locale) && !isUndefined(authUser) && !isUndefined(idea) && !isUndefined(customFieldsSchema)) {
      const authError = (location.pathname === '/authentication-error');
      const registrationCompletedAt = (authUser ? authUser.attributes.registration_completed_at : null);

      if (!isNilOrError(authUser) && !isNilOrError(idea) && idea.attributes.publication_status === 'draft') {
        updateIdea(idea.id, { author_id: authUser.id, publication_status: 'published' });
      }

      if (registrationCompletedAt || !hasCustomFields(customFieldsSchema, locale)) {
        this.redirectToLandingPage();
      }

      return (
        <Container>
          <Left>
            <SignInUpBanner />
          </Left>
          <Right>
            <RightInner>
              {!authError ? (
                <>
                  <Title><FormattedMessage {...messages.title} /></Title>
                  <Step2 onCompleted={this.redirectToLandingPage} />
                </>
              ) : (
                <>
                  <Title><FormattedMessage {...messages.somethingWentWrong} /></Title>
                  <Error text={<FormattedMessage {...messages.notSignedIn} />} />
                </>
              )}
            </RightInner>
          </Right>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  locale: <GetLocale />,
  authUser: <GetAuthUser />,
  idea: ({ location, render }) => <GetIdea id={get(location.query, 'idea_to_publish', null)}>{render}</GetIdea>,
  customFieldsSchema: <GetCustomFieldsSchema />
});

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => <CompleteSignUpPage {...inputProps} {...dataProps} />}
  </Data>
));
