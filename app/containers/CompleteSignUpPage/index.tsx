import React, { PureComponent } from 'react';
import { isString, isObject, isUndefined, includes } from 'lodash-es';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';
import { adopt } from 'react-adopt';

// components
import Error from 'components/UI/Error';
import Step2 from 'components/SignUp/Step2';
import SignInUpBanner from 'components/SignInUpBanner';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media, fontSizes, colors } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  border-top: solid 1px #ddd;
  background: ${colors.background};
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

const Left = styled(Section)`
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

const Right = styled(Section)`
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

const Title = styled.h1`
  width: 100%;
  color: #333;
  font-size: ${fontSizes.xxxxl}px;
  line-height: 42px;
  font-weight: 500;
  text-align: left;
  margin-bottom: 35px;
  outline: none;
  `;

interface InputProps {}

interface DataProps {
  locale: GetLocaleChildProps;
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class CompleteSignUpPage extends PureComponent<Props & WithRouterProps, State> {

  redirect = () => {
    clHistory.push('/');
  }

  focusTitle = (titleEl: HTMLHeadingElement) => {
    // focus step 2 page title to make the custom field easily reachable with keyboard navigation
    // hitting the tab key once should bring the user to the first custom field
    // before the user had to navigate the entire navbar first
    titleEl && titleEl.focus();
  }

  render() {
    const { location, authUser } = this.props;

    if (!isUndefined(authUser)) {
      const authError = includes(location.pathname, 'authentication-error');
      const registrationCompletedAt = (authUser ? authUser.attributes.registration_completed_at : null);

      if (!authError && (!isObject(authUser) || (isObject(authUser) && isString(registrationCompletedAt)))) {
        this.redirect();
        return null;
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
                  <Title tabIndex={0} ref={this.focusTitle}><FormattedMessage {...messages.title} /></Title>
                  <Step2 onCompleted={this.redirect} />
                </>
              ) : (
                <>
                  <Title tabIndex={0} ref={this.focusTitle}><FormattedMessage {...messages.somethingWentWrong} /></Title>
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
  authUser: <GetAuthUser />
});

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => <CompleteSignUpPage {...inputProps} {...dataProps} />}
  </Data>
));
