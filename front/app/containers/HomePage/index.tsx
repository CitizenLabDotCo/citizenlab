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
import { canAccessRoute } from 'services/permissions/rules/routePermissions';

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useHomepageSettings from 'hooks/useHomepageSettings';

// utils
import { isNilOrError } from 'utils/helperUtils';
import useAppConfiguration from 'hooks/useAppConfiguration';

const HomePage = () => {
  const homepageSettings = useHomepageSettings();
  const authUser = useAuthUser();
  const appConfiguration = useAppConfiguration();
  const userHasAdminAccess =
    !isNilOrError(authUser) && !isNilOrError(appConfiguration)
      ? canAccessRoute(
          { type: 'route', path: '/admin' },
          { data: authUser },
          appConfiguration
        )
      : false;

  const handleKeyPress = (event: KeyboardEvent) => {
    if (userHasAdminAccess && event.key === 'a') {
      clHistory.push('/admin/dashboard');
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

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
            {homepageSettings.attributes.top_info_section_enabled && (
              // top info section
              <InfoSection
                multilocContent={
                  homepageSettings.attributes.top_info_section_multiloc
                }
                fragmentName="pages/homepage_info/top-content"
              />
            )}
            <MainContent />
            {homepageSettings.attributes.bottom_info_section_enabled && (
              // bottom info section
              <InfoSection
                multilocContent={
                  homepageSettings.attributes.bottom_info_section_multiloc
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
