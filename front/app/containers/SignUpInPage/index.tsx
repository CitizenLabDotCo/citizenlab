import React, { useEffect, useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import clHistory from 'utils/cl-router/history';
import { useBreakpoint, Box } from '@citizenlab/cl2-component-library';

// components
import SignUpInPageMeta from './SignUpInPageMeta';
import SignUpIn, { ISignUpInMetaData } from './SignUpIn';

// utils
import { isNilOrError } from 'utils/helperUtils';

// events
import { signUpActiveStepChange$, openSignUpInModal$ } from './events';

// context
import { PreviousPathnameContext } from 'context';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import useAuthUser from 'hooks/useAuthUser';

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

interface Props {
  flow: 'signin' | 'signup';
}

const SignUpInPage = ({ flow }: Props) => {
  const previousPathName = useContext(PreviousPathnameContext);
  const { pathname } = useLocation();
  const authUser = useAuthUser();
  const [metaData, setMetaData] = useState<ISignUpInMetaData>({
    flow,
    pathname,
    inModal: false,
  });
  const phone = useBreakpoint('phone');

  const isLoggedIn =
    !isNilOrError(authUser) && authUser.attributes.registration_completed_at;

  if (isLoggedIn) {
    clHistory.replace(previousPathName || '/');
  }

  useEffect(() => {
    setMetaData({
      ...metaData,
      pathname,
      flow,
    });
  }, [flow, pathname]);

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
          <Box maxWidth="580px" padding={phone ? '0 20px' : '0 40px'}>
            <SignUpIn
              metaData={metaData}
              onSignUpInCompleted={onSignUpInCompleted}
            />
          </Box>
        )}
      </Container>
    </>
  );
};

export default SignUpInPage;
