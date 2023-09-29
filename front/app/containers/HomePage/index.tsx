import React, { lazy, Suspense, useEffect } from 'react';
import clHistory from 'utils/cl-router/history';

// components
import Fragment from 'components/Fragment';
import { Container, Content } from 'components/LandingPages/citizen';
import LoadingBox from 'components/ProjectAndFolderCards/components/LoadingBox';
import SignedInHeader from './SignedInHeader';
import SignedOutHeader from './SignedOutHeader';
const MainContent = lazy(() => import('./MainContent'));
const InfoSection = lazy(
  () => import('components/LandingPages/citizen/InfoSection')
);
const Footer = lazy(() => import('./Footer'));
import { canAccessRoute } from 'utils/permissions/rules/routePermissions';

// hooks
import useAuthUser from 'api/me/useAuthUser';
import useHomepageSettings from 'api/home_page/useHomepageSettings';
import useKeyPress from 'hooks/useKeyPress';

// utils
import { isNilOrError } from 'utils/helperUtils';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
export const adminRedirectPath = '/admin/dashboard/visitors';

const HomePage = () => {
  const { data: homepageSettings } = useHomepageSettings();
  const { data: authUser } = useAuthUser();
  const { data: appConfiguration } = useAppConfiguration();
  const pressedLetterAKey = useKeyPress('a');
  const userHasAdminAccess =
    !isNilOrError(authUser) && !isNilOrError(appConfiguration)
      ? canAccessRoute(
          { type: 'route', path: '/admin' },
          authUser,
          appConfiguration.data
        )
      : false;

  useEffect(() => {
    if (pressedLetterAKey && userHasAdminAccess) {
      clHistory.push(adminRedirectPath);
    }
  }, [pressedLetterAKey, userHasAdminAccess]);

  if (!isNilOrError(homepageSettings)) {
    return (
      <Container id="e2e-landing-page">
        {!isNilOrError(authUser) ? (
          <SignedInHeader />
        ) : (
          <Fragment name="signed-out-header">
            <SignedOutHeader />
          </Fragment>
        )}

        <Content>
          <Suspense fallback={<LoadingBox />}>
            {homepageSettings.data.attributes.top_info_section_enabled && (
              // top info section
              <InfoSection
                multilocContent={
                  homepageSettings.data.attributes.top_info_section_multiloc
                }
                fragmentName="pages/homepage_info/top-content"
              />
            )}
            <MainContent />
            {homepageSettings.data.attributes.bottom_info_section_enabled && (
              // bottom info section
              <InfoSection
                multilocContent={
                  homepageSettings.data.attributes.bottom_info_section_multiloc
                }
                fragmentName="pages/homepage_info/content"
              />
            )}
            <Footer />
          </Suspense>
        </Content>
      </Container>
    );
  }

  return null;
};

export default HomePage;
