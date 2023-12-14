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
import useFeatureFlag from 'hooks/useFeatureFlag';
import Viewer from './Viewer';
import { isEmpty } from 'lodash-es';
import CityLogoSection from 'components/CityLogoSection';
import useHomepageLayout from 'api/home_page_layout/useHomepageLayout';
export const adminRedirectPath = '/admin';

const HomePage = () => {
  const { data: homepageLayout } = useHomepageLayout();
  const { data: homepageSettings } = useHomepageSettings();
  const { data: authUser } = useAuthUser();
  const { data: appConfiguration } = useAppConfiguration();

  const isHomepageBuilderEnabled = useFeatureFlag({
    name: 'homepage_builder',
  });

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

  if (!homepageSettings || !homepageLayout) return null;

  if (
    isHomepageBuilderEnabled &&
    !isEmpty(homepageLayout?.data.attributes.craftjs_json)
  ) {
    return (
      <div id="e2e-landing-page">
        <Viewer />
        <Fragment name="pages/homepage_info/content">
          <div />
        </Fragment>
        <CityLogoSection />
      </div>
    );
  }

  if (!isNilOrError(homepageSettings)) {
    return (
      <Container id="e2e-landing-page">
        {!isNilOrError(authUser) ? (
          <SignedInHeader homepageSettings={homepageSettings.data.attributes} />
        ) : (
          <Fragment name="signed-out-header">
            <SignedOutHeader
              homepageSettings={homepageSettings.data.attributes}
            />
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
