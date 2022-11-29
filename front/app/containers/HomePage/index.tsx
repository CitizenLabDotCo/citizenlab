import React, { lazy, Suspense } from 'react';

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

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useHomepageSettings from 'hooks/useHomepageSettings';

// utils
import { isNilOrError } from 'utils/helperUtils';

const HomePage = () => {
  const homepageSettings = useHomepageSettings();
  const authUser = useAuthUser();

  return (
    <>
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
            {!isNilOrError(homepageSettings) &&
              homepageSettings.attributes.top_info_section_enabled && (
                // top info section
                <InfoSection
                  multilocContent={
                    homepageSettings.attributes.top_info_section_multiloc
                  }
                  fragmentName="pages/homepage_info/top-content"
                />
              )}
            <MainContent />
            {!isNilOrError(homepageSettings) &&
              homepageSettings.attributes.bottom_info_section_enabled && (
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
    </>
  );
};

export default HomePage;
