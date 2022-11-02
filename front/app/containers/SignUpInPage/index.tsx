import React, { useEffect, ReactElement, useState } from 'react';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
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

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.main`
  width: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;

  ${media.desktop`
    min-height: calc(
      100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
    );
  `}

  ${media.tablet`
    min-height: calc(100vh - ${(props) => props.theme.mobileMenuHeight}px - ${(
    props
  ) => props.theme.mobileTopBarHeight}px);
  `}
`;

const StyledSignUpIn = styled(SignUpIn)`
  display: flex;
  flex-direction: column;
  width: 580px;
`;

interface InputProps {}

interface DataProps {
  authUser: GetAuthUserChildProps;
  locale: GetLocaleChildProps;
  previousPathName: string | null;
}

interface Props extends DataProps, InputProps, WithRouterProps {}

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
        if (newMetaData) {
          setMetaData(newMetaData);
        }
      }),
      signUpActiveStepChange$.subscribe(() => {
        window.scrollTo(0, 0);
      }),
    ];
    return () => {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
    };
  }, []);

  const onSignUpInCompleted = () => {
    clHistory.push(previousPathName || '/');
  };

  return (
    <>
      <SignUpInPageMeta />
      <Container id="e2e-sign-up-in-page">
        {metaData && (
          <StyledSignUpIn
            metaData={metaData}
            onSignUpInCompleted={onSignUpInCompleted}
          />
        )}
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

export default (inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {(dataProps) => <SignUpPageWithHoC {...inputProps} {...dataProps} />}
  </Data>
);
