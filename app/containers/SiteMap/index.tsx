import React, { useRef } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import scrollToComponent from 'react-scroll-to-component';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import { Spinner } from 'cl2-component-library';
import FeatureFlag from 'components/FeatureFlag';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import ContentContainer from 'components/ContentContainer';
import SiteMapMeta from './SiteMapMeta';
import ProjectsSection from './ProjectsSection';
import StoryLink from './StoryLink';
import Link from 'utils/cl-router/Link';

// styles
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';

// resources
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

const Container = styled.div`
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  flex-direction: column;
  background: ${colors.background};

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${(props) => props.theme.mobileMenuHeight}px - ${(
    props
  ) => props.theme.mobileTopBarHeight}px);
  `}
`;

const StyledContentContainer = styled(ContentContainer)`
  max-width: calc(${(props) => props.theme.maxPageWidth}px - 100px);
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 30px;
`;

const PageContent = styled.main`
  flex-shrink: 0;
  flex-grow: 1;
  background: #fff;
  padding-top: 60px;
  padding-bottom: 60px;
`;

const Loading = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  margin-bottom: 30px;
`;

const TOC = styled.div`
  border: 1px solid #ccc;
  padding: 20px;
  margin-bottom: 30px;
`;

const Ul = styled.ul`
  list-style-type: initial;
  margin-bottom: 0 !important;
`;

const ProjectsSubsectionUl = styled.ul`
  list-style-type: circle;
  margin-bottom: 0 !important;
`;

const Header = styled.h2`
  font-weight: bold;
`;

export const H2 = styled.h2`
  font-size: ${fontSizes.xxl}px !important;
`;

export const H3 = styled.h3`
  font-size: ${fontSizes.xl}px !important;
`;

export const H4 = styled.h4`
  font-size: ${fontSizes.large}px !important;
`;

const NavItem = styled.button`
  cursor: pointer;
  &:focus,
  &:hover {
    text-decoration: underline;
  }
`;

interface DataProps {
  projects: GetProjectsChildProps;
  tenant: GetAppConfigurationChildProps;
  authUser: GetAuthUserChildProps;
}

interface Props extends DataProps {}

const SiteMap = ({ projects, tenant, authUser }: Props) => {
  const loaded = projects !== undefined;
  const successStories = !isNilOrError(tenant)
    ? tenant.attributes.settings?.initiatives?.success_stories
    : [];

  const scrollTo = (component) => (event: any) => {
    // if the event is synthetic, it's a key event and we move focus
    // https://github.com/facebook/react/issues/3907
    if (event.detail === 0) {
      component.current.focus();
    }
    scrollToComponent(component.current, {
      align: 'top',
      offset: -90,
      duration: 300,
    });
  };

  const removeFocus = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
  };

  const homeSection = useRef(null);
  const projectsSection = useRef(null);
  const archivedSection = useRef(null);
  const currentSection = useRef(null);
  const draftSection = useRef(null);
  const initiativesSection = useRef(null);
  const userSpaceSection = useRef(null);
  const hasProjectSubsection =
    archivedSection.current || draftSection.current || currentSection.current;

  return (
    <Container>
      <SiteMapMeta />
      {!loaded && (
        <Loading>
          <Spinner />
        </Loading>
      )}
      {loaded && (
        <PageContent>
          <StyledContentContainer>
            <QuillEditedContent>
              <Title>
                <FormattedMessage {...messages.siteMapTitle} />
              </Title>

              <TOC aria-labelledby="nav-header">
                <Header id="nav-header">
                  <FormattedMessage {...messages.pageContents} />
                </Header>
                <Ul>
                  <li>
                    <NavItem
                      onMouseDown={removeFocus}
                      onClick={scrollTo(homeSection)}
                    >
                      <FormattedMessage {...messages.homeSection} />
                    </NavItem>
                  </li>
                  <li>
                    <NavItem
                      onMouseDown={removeFocus}
                      onClick={scrollTo(userSpaceSection)}
                    >
                      <FormattedMessage {...messages.userSpaceSection} />
                    </NavItem>
                  </li>
                  {!isNilOrError(projects) && (
                    <li>
                      <NavItem
                        onMouseDown={removeFocus}
                        onClick={scrollTo(projectsSection)}
                      >
                        <FormattedMessage {...messages.projectsSection} />
                      </NavItem>
                      {hasProjectSubsection && (
                        <ProjectsSubsectionUl>
                          {currentSection.current && (
                            <li>
                              <NavItem
                                onMouseDown={removeFocus}
                                onClick={scrollTo(currentSection)}
                              >
                                <FormattedMessage
                                  {...messages.projectsCurrent}
                                />
                              </NavItem>
                            </li>
                          )}
                          {archivedSection.current && (
                            <li>
                              <NavItem
                                onMouseDown={removeFocus}
                                onClick={scrollTo(archivedSection)}
                              >
                                <FormattedMessage
                                  {...messages.projectsArchived}
                                />
                              </NavItem>
                            </li>
                          )}
                          {draftSection.current && (
                            <li>
                              <NavItem
                                onMouseDown={removeFocus}
                                onClick={scrollTo(draftSection)}
                              >
                                <FormattedMessage {...messages.projectsDraft} />
                              </NavItem>
                            </li>
                          )}
                        </ProjectsSubsectionUl>
                      )}
                    </li>
                  )}
                  <FeatureFlag name="initiatives">
                    <li>
                      <NavItem
                        onMouseDown={removeFocus}
                        onClick={scrollTo(initiativesSection)}
                      >
                        <FormattedMessage {...messages.initiativesSection} />
                      </NavItem>
                    </li>
                  </FeatureFlag>
                </Ul>
              </TOC>

              <H2 ref={homeSection} tabIndex={-1}>
                <FormattedMessage {...messages.homeSection} />
              </H2>
              <ul>
                <li>
                  <Link to="/">
                    <FormattedMessage {...messages.homePage} />
                  </Link>
                </li>
                <li>
                  <Link to="/pages/information">
                    <FormattedMessage {...messages.aboutLink} />
                  </Link>
                </li>
                <li>
                  <Link to="/pages/cookie-policy">
                    <FormattedMessage {...messages.cookiePolicyLink} />
                  </Link>
                </li>
                <li>
                  <Link to="/pages/terms-and-conditions">
                    <FormattedMessage {...messages.termsAndConditionsLink} />
                  </Link>
                </li>
                <li>
                  <Link to="/pages/privacy-policy">
                    <FormattedMessage {...messages.privacyPolicyLink} />
                  </Link>
                </li>
                <li>
                  <Link to="/pages/accessibility-statement">
                    <FormattedMessage
                      {...messages.accessibilityStatementLink}
                    />
                  </Link>
                </li>
              </ul>

              <H2 ref={userSpaceSection} tabIndex={-1}>
                <FormattedMessage {...messages.userSpaceSection} />
              </H2>
              <ul>
                {isNilOrError(authUser) ? (
                  <>
                    <li>
                      <Link to="/sign-in">
                        <FormattedMessage {...messages.signInPage} />
                      </Link>
                    </li>
                    <li>
                      <Link to="/sign-up">
                        <FormattedMessage {...messages.signUpPage} />
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link to={`/profile/${authUser.attributes.slug}`}>
                        <FormattedMessage {...messages.profilePage} />
                      </Link>
                    </li>
                    <li>
                      <Link to="/profile/edit">
                        <FormattedMessage {...messages.profileSettings} />
                      </Link>
                    </li>
                  </>
                )}
              </ul>

              <ProjectsSection projectsSectionRef={projectsSection} />
              <FeatureFlag name="initiatives">
                <H2 ref={initiativesSection} tabIndex={-1}>
                  <FormattedMessage {...messages.initiativesSection} />
                </H2>
                <Ul>
                  <li>
                    <Link to="/initiatives">
                      <FormattedMessage {...messages.initiativesList} />
                    </Link>
                  </li>
                  <li>
                    <Link to="/pages/initiatives">
                      <FormattedMessage {...messages.initiativesInfo} />
                    </Link>
                  </li>
                  {successStories && successStories.length === 3 && (
                    <li>
                      <FormattedMessage {...messages.successStories} />
                      <ul>
                        {successStories.map((story) => (
                          <li key={story.page_slug}>
                            <StoryLink story={story} />
                          </li>
                        ))}
                      </ul>
                    </li>
                  )}
                </Ul>
              </FeatureFlag>
            </QuillEditedContent>
          </StyledContentContainer>
        </PageContent>
      )}
    </Container>
  );
};

const Data = adopt<DataProps>({
  projects: (
    <GetProjects publicationStatuses={['draft', 'published', 'archived']} />
  ),
  tenant: <GetAppConfiguration />,
  authUser: <GetAuthUser />,
});

export default () => <Data>{(dataprops) => <SiteMap {...dataprops} />}</Data>;
