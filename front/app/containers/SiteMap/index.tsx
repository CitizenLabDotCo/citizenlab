import React, { useRef } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError, removeFocusAfterMouseClick } from 'utils/helperUtils';
import scrollToComponent from 'react-scroll-to-component';

// hooks
import usePages from 'hooks/usePages';
import useNavbarItems from 'hooks/useNavbarItems';
import useLocalize from 'hooks/useLocalize';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import { Spinner } from '@citizenlab/cl2-component-library';
import FeatureFlag from 'components/FeatureFlag';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import ContentContainer from 'components/ContentContainer';
import SiteMapMeta from './SiteMapMeta';
import ProjectsAndFoldersSection from './ProjectsAndFoldersSection';
import Link from 'utils/cl-router/Link';

// styles
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';

// resources
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// services
import { DEFAULT_PAGE_SLUGS } from 'services/navbar';

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
  authUser: GetAuthUserChildProps;
}

interface Props extends DataProps {}

const SiteMap = ({ projects, authUser }: Props) => {
  const loaded = projects !== undefined;
  const navBarItems = useNavbarItems();
  const localize = useLocalize();
  const pages = usePages();

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

  const homeSection = useRef(null);
  const projectsSection = useRef(null);
  const archivedSection = useRef(null);
  const currentSection = useRef(null);
  const draftSection = useRef(null);
  const initiativesSection = useRef(null);
  const userSpaceSection = useRef(null);
  const customPagesSection = useRef(null);
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
                      onMouseDown={removeFocusAfterMouseClick}
                      onClick={scrollTo(homeSection)}
                    >
                      <FormattedMessage {...messages.homeSection} />
                    </NavItem>
                  </li>
                  <li>
                    <NavItem
                      onMouseDown={removeFocusAfterMouseClick}
                      onClick={scrollTo(userSpaceSection)}
                    >
                      <FormattedMessage {...messages.userSpaceSection} />
                    </NavItem>
                  </li>
                  {!isNilOrError(projects) && (
                    <li>
                      <NavItem
                        onMouseDown={removeFocusAfterMouseClick}
                        onClick={scrollTo(projectsSection)}
                      >
                        <FormattedMessage {...messages.projectsSection} />
                      </NavItem>
                      {hasProjectSubsection && (
                        <ProjectsSubsectionUl>
                          {currentSection.current && (
                            <li>
                              <NavItem
                                onMouseDown={removeFocusAfterMouseClick}
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
                                onMouseDown={removeFocusAfterMouseClick}
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
                                onMouseDown={removeFocusAfterMouseClick}
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
                        onMouseDown={removeFocusAfterMouseClick}
                        onClick={scrollTo(initiativesSection)}
                      >
                        <FormattedMessage {...messages.initiativesSection} />
                      </NavItem>
                    </li>
                  </FeatureFlag>
                  <li>
                    <NavItem
                      onMouseDown={removeFocusAfterMouseClick}
                      onClick={scrollTo(customPagesSection)}
                    >
                      <FormattedMessage {...messages.customPageSection} />
                    </NavItem>
                  </li>
                </Ul>
              </TOC>

              <H2 ref={homeSection} tabIndex={-1}>
                <FormattedMessage {...messages.homeSection} />
              </H2>
              <ul>
                {/* Nav bar items that are not included in pages */}
                {!isNilOrError(navBarItems) &&
                  navBarItems
                    .filter(
                      (item) => item.relationships.static_page.data === null
                    )
                    .map((item) => (
                      <li key={item.id}>
                        <Link to={DEFAULT_PAGE_SLUGS[item.attributes.code]}>
                          {localize(item.attributes.title_multiloc)}
                        </Link>
                      </li>
                    ))}
                {/* Non-custom static pages */}
                {!isNilOrError(pages) &&
                  pages
                    .filter((page) => page.attributes.code !== 'custom')
                    .map((item) => (
                      <li key={item.id}>
                        <Link to={`/${item.attributes.slug}`}>
                          {localize(item.attributes.title_multiloc)}
                        </Link>
                      </li>
                    ))}
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

              <ProjectsAndFoldersSection projectsSectionRef={projectsSection} />
              <FeatureFlag name="initiatives">
                <H2 ref={initiativesSection} tabIndex={-1}>
                  <FormattedMessage {...messages.initiativesSection} />
                </H2>
                <ul>
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
                </ul>
              </FeatureFlag>

              <H2 ref={customPagesSection} tabIndex={-1}>
                <FormattedMessage {...messages.customPageSection} />
              </H2>
              <Ul>
                {/* Custom static pages */}
                {!isNilOrError(pages) &&
                  pages
                    .filter((page) => page.attributes.code === 'custom')
                    .map((item) => (
                      <li key={item.id}>
                        <Link to={`/pages/${item.attributes.slug}`}>
                          {localize(item.attributes.title_multiloc)}
                        </Link>
                      </li>
                    ))}
              </Ul>
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
  authUser: <GetAuthUser />,
});

export default () => <Data>{(dataprops) => <SiteMap {...dataprops} />}</Data>;
