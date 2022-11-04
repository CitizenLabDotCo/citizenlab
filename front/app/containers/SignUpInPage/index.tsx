import React, { useEffect, useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import clHistory from 'utils/cl-router/history';
import { Box } from '@citizenlab/cl2-component-library';

// components
import SignUpInPageMeta from './SignUpInPageMeta';
import SignUpIn, { ISignUpInMetaData } from './SignUpIn';
import PageContainer from 'components/UI/PageContainer';
// utils
import { isNilOrError } from 'utils/helperUtils';

// events
import { signUpActiveStepChange$, openSignUpInModal$ } from './events';

// context
import { PreviousPathnameContext } from 'context';
import useAuthUser from 'hooks/useAuthUser';

interface Props {
  flow: 'signin' | 'signup';
}

// Note: we also use SignUpInModal (when not clicking Log in/Sign up in the top navigation)
// This component looks the same.
const SignUpInPage = ({ flow }: Props) => {
  const previousPathName = useContext(PreviousPathnameContext);
  const { pathname } = useLocation();
  const authUser = useAuthUser();
  const [metaData, setMetaData] = useState<ISignUpInMetaData>({
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
      <PageContainer
        backgroundColor="#fff"
        id="e2e-sign-up-in-page"
        display="flex"
        justifyContent="center"
      >
        <Box maxWidth="580px">
          <SignUpIn
            metaData={metaData}
            onSignUpInCompleted={onSignUpInCompleted}
          />
        </Box>
      </PageContainer>
    </>
  );
};

export default SignUpInPage;
