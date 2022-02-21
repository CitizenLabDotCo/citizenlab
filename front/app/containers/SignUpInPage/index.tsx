import React, { useEffect, ReactElement, useState } from 'react';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';

// components
import SignUpInPageMeta from './SignUpInPageMeta';
import SignUpIn, { ISignUpInMetaData } from 'components/SignUpIn';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// utils
import { isNilOrError, endsWith } from 'utils/helperUtils';

// events
import {
  signUpActiveStepChange$,
  openSignUpInModal$,
} from 'components/SignUpIn/events';

// context
import { PreviousPathnameContext } from 'context';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';

const Container = styled.main`
  width: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: row;
  background: ${colors.background};
  position: relative;

  ${media.biggerThanMaxTablet`
    min-height: calc(
      100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
    );
  `}

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${(props) => props.theme.mobileMenuHeight}px - ${(
    props
  ) => props.theme.mobileTopBarHeight}px);
  `}
`;

const Section = styled.div`
  flex: 1;
`;

const Left = styled(Section)`
  display: none;

  ${media.biggerThanMaxTablet`
    display: block;
  `}
`;

const Banner = styled.div`
  width: 100%;
  height: 100%;
  padding: 50px;
  padding-top: 58px;
  padding-left: 70px;
  position: relative;
  background: #fff;
`;

const Slogan = styled.div`
  width: 100%;
  max-width: 400px;
  color: ${(props) => props.theme.colorMain || '#333'};
  font-size: ${fontSizes.xxxxl}px;
  line-height: 44px;
  font-weight: 600;
`;

const Right = styled(Section)``;

const RightInner = styled.div`
  width: 100%;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  padding-top: 60px;
  padding-bottom: 60px;
  padding-left: 20px;
  padding-right: 20px;

  ${media.smallerThanMaxTablet`
    padding-top: 35px;
  `}
`;

export interface DataProps {
  authUser: GetAuthUserChildProps;
  locale: GetLocaleChildProps;
  previousPathName: string | null;
}

export interface Props extends DataProps, WithRouterProps {}

const SignUpPage = ({
  authUser,
  location,
  previousPathName,
}: Props): ReactElement => {
  const { pathname } = location;
  const flow = endsWith(pathname, 'sign-in') ? 'signin' : 'signup';

  const [metaData, setMetaData] = useState<ISignUpInMetaData | undefined>({
    flow,
    pathname,
    inModal: false,
  });

  const isLoggedIn =
    !isNilOrError(authUser) && authUser.attributes.registration_completed_at;

  if (isLoggedIn) {
    clHistory.replace(previousPathName || '/');
  }

  useEffect(() => {
    const subscriptions = [
      openSignUpInModal$.subscribe(({ eventValue: newMetaData }) => {
        if (newMetaData) setMetaData(newMetaData);
      }),
      signUpActiveStepChange$.subscribe(() => {
        window.scrollTo(0, 0);
      }),
    ];
    return () => {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSignUpInCompleted = () => {
    clHistory.push(previousPathName || '/');
  };

  return (
    <>
      <SignUpInPageMeta />

      <Container id="e2e-sign-up-in-page">
        <Left>
          <Banner>
            <Slogan>
              <FormattedMessage {...messages.slogan} />
            </Slogan>
          </Banner>
        </Left>
        <Right>
          <RightInner>
            {metaData && (
              <SignUpIn
                metaData={metaData}
                onSignUpInCompleted={onSignUpInCompleted}
              />
            )}
          </RightInner>
        </Right>
      </Container>
    </>
  );
};

const SignUpPageWithHoC = withRouter(SignUpPage);

const Data = adopt<DataProps, WithRouterProps>({
  authUser: <GetAuthUser />,
  locale: <GetLocale />,
  previousPathName: ({ render }) => (
    <PreviousPathnameContext.Consumer>
      {render as any}
    </PreviousPathnameContext.Consumer>
  ),
});

export default (inputProps: WithRouterProps) => (
  <Data {...inputProps}>
    {(dataProps) => <SignUpPageWithHoC {...inputProps} {...dataProps} />}
  </Data>
);
