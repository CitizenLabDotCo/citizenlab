import React, { lazy, Suspense } from 'react';

// components
import Fragment from 'components/Fragment';
import LoadingBox from 'components/ProjectAndFolderCards/components/LoadingBox';
import SignedInHeader from './SignedInHeader';
import SignedOutHeader from './SignedOutHeader';
const MainContent = lazy(() => import('./MainContent'));
const HomepageInfoSection = lazy(() => import('./HomepageInfoSection'));
const Footer = lazy(() => import('./Footer'));

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useHomepageSettings from 'hooks/useHomepageSettings';

// utils
import { isNilOrError } from 'utils/helperUtils';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.main`
  height: 100%;
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background: #fff;

  ${media.smallerThanMaxTablet`
    min-height: auto;
  `}
`;

const Content = styled.div`
  width: 100%;
  z-index: 3;
`;

const LandingPage = () => {
  const homepageSettings = useHomepageSettings();
  const authUser = useAuthUser();

  return (
    <>
      <Container id="e2e-landing-page">
        {!isNilOrError(authUser) ? (
          <SignedInHeader homepageSettings={homepageSettings} />
        ) : (
          <Fragment name="signed-out-header">
            <SignedOutHeader />
          </Fragment>
        )}

        <Content>
          <Suspense fallback={<LoadingBox />}>
            {!isNilOrError(homepageSettings) &&
              homepageSettings.data.attributes.top_info_section_enabled && (
                // top info section
                <HomepageInfoSection
                  multilocContent={
                    homepageSettings.data.attributes.top_info_section_multiloc
                  }
                  fragmentName="pages/homepage_info/top-content"
                />
              )}
            <MainContent />
            {!isNilOrError(homepageSettings) &&
              homepageSettings.data.attributes.bottom_info_section_enabled && (
                // bottom info section
                <HomepageInfoSection
                  multilocContent={
                    homepageSettings.data.attributes
                      .bottom_info_section_multiloc
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

export default LandingPage;
