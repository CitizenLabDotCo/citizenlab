import React, { PureComponent, Suspense } from 'react';
import { adopt } from 'react-adopt';

// components
import ContentContainer from 'components/ContentContainer';
import CityLogoSection from 'components/CityLogoSection';
import Button from 'components/UI/Button';
import AvatarBubbles from 'components/AvatarBubbles';
import SignedOutHeader from './SignedOutHeader';
import SignedInHeader from './SignedInHeader';
import InitiativesCTABox from './InitiativesCTABox';
import T from 'components/T';
import Fragment from 'components/Fragment';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import LoadingBox from 'components/ProjectAndFolderCards/LoadingBox';
const ProjectAndFolderCards = React.lazy(() =>
  import('components/ProjectAndFolderCards')
);

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAppConfiguration, { GetTenantChildProps } from 'resources/GetTenant';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetPage, { GetPageChildProps } from 'resources/GetPage';

// utils
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';
import { isNilOrError, isEmptyMultiloc } from 'utils/helperUtils';
import { openSignUpInModal } from 'components/SignUpIn/events';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled, { withTheme } from 'styled-components';
import { media, fontSizes, colors } from 'utils/styleUtils';
import GetInitiativesPermissions, {
  GetInitiativesPermissionsChildProps,
} from 'resources/GetInitiativesPermissions';
import FeatureFlag from 'components/FeatureFlag';

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

const FooterBanner = styled.div`
  background: ${({ theme }) => theme.colorMain};
  width: 100%;
  min-height: 300px;
  margin: 0;
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-left: 30px;
  padding-right: 30px;
  padding-top: 50px;
  padding-bottom: 60px;

  h2 {
    color: #fff;
    font-size: ${fontSizes.xxxl}px;
    line-height: normal;
    font-weight: 600;
    margin-bottom: 30px;
    max-width: 500px;
    text-align: center;

    ${media.smallerThanMaxTablet`
      font-size: ${fontSizes.xxxl}px;
    `}
  }
`;

const StyledAvatarBubbles = styled(AvatarBubbles)`
  margin-bottom: 45px;
`;

const Content = styled.div`
  width: 100%;
  z-index: 3;
`;

const StyledContentContainer = styled(ContentContainer)`
  background: ${colors.background};
  border-bottom: solid 1px #eaeaea;
`;

const ProjectSection = styled.div`
  width: 100%;
  padding-top: 40px;
  padding-bottom: 90px;

  ${media.smallerThanMinTablet`
    padding-bottom: 60px;
  `}
`;

const SectionContainer = styled.section`
  width: 100%;
  margin-top: 10px;
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

const StyledInitiativesCTABox = styled(InitiativesCTABox)`
  padding-top: 10px;
  padding-bottom: 40px;
`;

export interface InputProps {
  ideaId: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  tenant: GetTenantChildProps;
  authUser: GetAuthUserChildProps;
  homepageInfoPage: GetPageChildProps;
  postingPermission: GetInitiativesPermissionsChildProps;
}

interface Props extends InputProps, DataProps {
  theme: any;
}

interface State {}

class LandingPage extends PureComponent<Props, State> {
  signUpIn = (event: React.FormEvent) => {
    event.preventDefault();
    trackEventByName(tracks.clickCreateAccountCTA, {
      extra: { location: 'footer' },
    });
    openSignUpInModal();
  };

  render() {
    const {
      locale,
      tenant,
      authUser,
      homepageInfoPage,
      postingPermission,
    } = this.props;

    if (
      !isNilOrError(locale) &&
      !isNilOrError(tenant) &&
      !isNilOrError(homepageInfoPage)
    ) {
      // custom section
      const showCustomSection = !isEmptyMultiloc(
        homepageInfoPage.attributes.body_multiloc
      );
      const customSectionBodyMultiloc =
        homepageInfoPage.attributes.body_multiloc;
      const postingProposalsEnabled = !!postingPermission?.enabled;

      // tranlate header slogan into a h2 wih a fallback
      const headerSloganMultiLoc =
        tenant.attributes.settings.core.header_slogan;
      const genericSlogan = (
        <FormattedMessage tagName="h2" {...messages.subtitleCity} />
      );

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
              <StyledContentContainer mode="page">
                <ProjectSection id="e2e-landing-page-project-section">
                  <SectionContainer>
                    <Suspense fallback={<LoadingBox />}>
                      <ProjectAndFolderCards
                        publicationStatusFilter={['published', 'archived']}
                        showTitle={true}
                        layout="dynamic"
                        folderId={null}
                      />
                    </Suspense>
                  </SectionContainer>
                </ProjectSection>
                <FeatureFlag name="initiatives">
                  {postingProposalsEnabled && <StyledInitiativesCTABox />}
                </FeatureFlag>
              </StyledContentContainer>

              {showCustomSection && (
                <CustomSectionContentContainer>
                  <QuillEditedContent>
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
                  </QuillEditedContent>
                </CustomSectionContentContainer>
              )}

              {!authUser && (
                <FooterBanner>
                  {headerSloganMultiLoc ? (
                    <T value={headerSloganMultiLoc}>
                      {(translatedSlogan) =>
                        translatedSlogan ? (
                          <h2>{translatedSlogan}</h2>
                        ) : (
                          genericSlogan
                        )
                      }
                    </T>
                  ) : (
                    genericSlogan
                  )}
                  <StyledAvatarBubbles />
                  <Button
                    fontWeight="500"
                    padding="13px 22px"
                    buttonStyle="primary-inverse"
                    onClick={this.signUpIn}
                    text={<FormattedMessage {...messages.createAccount} />}
                  />
                </FooterBanner>
              )}
              <CityLogoSection />
            </Content>
          </Container>
        </>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  tenant: <GetAppConfiguration />,
  authUser: <GetAuthUser />,
  homepageInfoPage: <GetPage slug="homepage-info" />,
  postingPermission: <GetInitiativesPermissions action="posting_initiative" />,
});

const LandingPageWithHoC = withTheme(LandingPage);

// TODO: add spinner fallback for lazy-loaded cards?

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <LandingPageWithHoC {...inputProps} {...dataProps} />}
  </Data>
);
