import React, { lazy, Suspense } from 'react';

// components
import ContentContainer from 'components/ContentContainer';
import SignedOutHeader from './SignedOutHeader';
import SignedInHeader from './SignedInHeader';
import T from 'components/T';
import Fragment from 'components/Fragment';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import LoadingBox from 'components/ProjectAndFolderCards/components/LoadingBox';
const MainContent = lazy(() => import('./MainContent'));
const Footer = lazy(() => import('./Footer'));

// hooks
import useAuthUser from 'hooks/useAuthUser';
import usePage from 'hooks/usePage';
import useAppConfiguration from 'hooks/useAppConfiguration';

// utils
import { isNilOrError, isEmptyMultiloc } from 'utils/helperUtils';

// style
import styled from 'styled-components';
import { media, colors } from 'utils/styleUtils';

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

const StyledQuillEditedContent = styled(QuillEditedContent)`
  h1,
  h2 {
    color: ${(props) => props.theme.colorText};
  }

  p,
  li {
    color: ${colors.label};
  }
`;

const Content = styled.div`
  width: 100%;
  z-index: 3;
`;

const CustomSectionContentContainer = styled(ContentContainer)`
  width: 100%;
  max-width: 750px;
  margin-left: auto;
  margin-right: auto;
  padding-top: 80px;
  padding-bottom: 80px;
  background: #fff;

  ${media.smallerThanMinTablet`
    padding-top: 40px;
    padding-bottom: 40px;
  `}
`;

export interface Props {
  ideaId: string;
}

const LandingPage = ({}: Props) => {
  const appConfiguration = useAppConfiguration();
  const authUser = useAuthUser();
  const homepageInfoPage = usePage({ pageSlug: 'homepage-info' });

  if (!isNilOrError(appConfiguration) && !isNilOrError(homepageInfoPage)) {
    // custom section
    const showCustomSection = !isEmptyMultiloc(
      homepageInfoPage.attributes.body_multiloc
    );
    const customSectionBodyMultiloc = homepageInfoPage.attributes.body_multiloc;

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
              <MainContent />
            </Suspense>
            {showCustomSection && (
              <CustomSectionContentContainer>
                <StyledQuillEditedContent>
                  <Fragment
                    name={
                      !isNilOrError(homepageInfoPage)
                        ? `pages/${
                            homepageInfoPage && homepageInfoPage.id
                          }/content`
                        : ''
                    }
                  >
                    <T value={customSectionBodyMultiloc} supportHtml={true} />
                  </Fragment>
                </StyledQuillEditedContent>
              </CustomSectionContentContainer>
            )}
            <Suspense fallback={null}>
              <Footer />
            </Suspense>
          </Content>
        </Container>
      </>
    );
  }

  return null;
};

export default LandingPage;
