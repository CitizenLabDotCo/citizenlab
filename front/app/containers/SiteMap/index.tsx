import React, { KeyboardEvent, MouseEvent, RefObject, useRef } from 'react';
import { isNilOrError, removeFocusAfterMouseClick } from 'utils/helperUtils';

// hooks
import useLocalize from 'hooks/useLocalize';
import useNavbarItems from 'hooks/useNavbarItems';
import useCustomPages from 'hooks/useCustomPages';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import { Spinner } from '@citizenlab/cl2-component-library';
import ContentContainer from 'components/ContentContainer';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import Link from 'utils/cl-router/Link';
import ProjectsAndFoldersSection from './ProjectsAndFoldersSection';
import SiteMapMeta from './SiteMapMeta';

// styles
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';

// resources
import useFeatureFlag from 'hooks/useFeatureFlag';

// services
import { DEFAULT_PAGE_SLUGS } from 'services/navbar';
import { TPageCode } from 'services/customPages';
import useAuthUser from 'hooks/useAuthUser';
import useProjects from 'api/projects/useProjects';

const Container = styled.div`
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  flex-direction: column;
  background: ${colors.background};

  ${(props) => media.tablet`
    min-height: calc(100vh - ${props.theme.mobileMenuHeight}px - ${props.theme.mobileTopBarHeight}px);
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
  font-size: ${fontSizes.l}px !important;
`;

const NavItem = styled.button`
  cursor: pointer;
  &:focus,
  &:hover {
    text-decoration: underline;
  }
`;

const SiteMap = () => {
  const proposalsEnabled = useFeatureFlag({ name: 'initiatives' });
  const projects = useProjects({
    publicationStatuses: ['draft', 'published', 'archived'],
  });
  const loaded = projects !== undefined;
  const navBarItems = useNavbarItems();
  const localize = useLocalize();
  const pages = useCustomPages();
  const authUser = useAuthUser();

  const scrollTo =
    (component: RefObject<HTMLHeadingElement | null>) =>
    (event: MouseEvent | KeyboardEvent) => {
      if (component.current) {
        // if the event is synthetic, it's a key event and we move focus
        // https://github.com/facebook/react/issues/3907
        if (event.detail === 0) {
          component.current.focus();
        }

        component.current.scrollIntoView();
      }
    };

  const homeSection = useRef<HTMLHeadingElement | null>(null);
  const projectsSection = useRef<HTMLHeadingElement | null>(null);
  const archivedSection = useRef<HTMLHeadingElement | null>(null);
  const currentSection = useRef<HTMLHeadingElement | null>(null);
  const draftSection = useRef<HTMLHeadingElement | null>(null);
  const initiativesSection = useRef<HTMLHeadingElement | null>(null);
  const userSpaceSection = useRef<HTMLHeadingElement | null>(null);
  const customPagesSection = useRef<HTMLHeadingElement | null>(null);
  const hasProjectSubsection =
    archivedSection.current || draftSection.current || currentSection.current;

  if (!isNilOrError(pages)) {
    const nonCustomStaticPages = pages.filter((page) => {
      const showPageConditions: Record<TPageCode, boolean> = {
        proposals: proposalsEnabled,
        about: true,
        faq: true,
        'terms-and-conditions': true,
        'privacy-policy': true,
        custom: false,
      };

      return showPageConditions[page.attributes.code];
    });

    const customStaticPages = pages.filter((page) => {
      return page.attributes.code === 'custom';
    });

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

                <TOC>
                  <Header>
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
                                  <FormattedMessage
                                    {...messages.projectsDraft}
                                  />
                                </NavItem>
                              </li>
                            )}
                          </ProjectsSubsectionUl>
                        )}
                      </li>
                    )}
                    {proposalsEnabled && (
                      <li>
                        <NavItem
                          onMouseDown={removeFocusAfterMouseClick}
                          onClick={scrollTo(initiativesSection)}
                        >
                          <FormattedMessage {...messages.initiativesSection} />
                        </NavItem>
                      </li>
                    )}
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
                        (navBarItem) =>
                          navBarItem.relationships.static_page.data === null
                      )
                      .map((navBarItem) => (
                        <li key={navBarItem.id}>
                          <Link
                            to={DEFAULT_PAGE_SLUGS[navBarItem.attributes.code]}
                          >
                            {localize(navBarItem.attributes.title_multiloc)}
                          </Link>
                        </li>
                      ))}
                  {/* Non-custom static pages */}
                  {nonCustomStaticPages.map((page) => {
                    return (
                      <li key={page.id}>
                        <Link to={`/pages/${page.attributes.slug}`}>
                          {localize(page.attributes.title_multiloc)}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <>
                  {!isNilOrError(authUser) && (
                    <>
                      <H2 ref={userSpaceSection} tabIndex={-1}>
                        <FormattedMessage {...messages.userSpaceSection} />
                      </H2>
                      <ul>
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
                      </ul>
                    </>
                  )}
                </>

                <ProjectsAndFoldersSection
                  projectsSectionRef={projectsSection}
                />
                <>
                  {proposalsEnabled && (
                    <>
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
                    </>
                  )}
                </>
                <>
                  {customStaticPages.length > 0 && (
                    <>
                      <H2 ref={customPagesSection} tabIndex={-1}>
                        <FormattedMessage {...messages.customPageSection} />
                      </H2>
                      <Ul>
                        {/* Custom static pages */}
                        {customStaticPages.map((item) => (
                          <li key={item.id}>
                            <Link to={`/pages/${item.attributes.slug}`}>
                              {localize(item.attributes.title_multiloc)}
                            </Link>
                          </li>
                        ))}
                      </Ul>
                    </>
                  )}
                </>
              </QuillEditedContent>
            </StyledContentContainer>
          </PageContent>
        )}
      </Container>
    );
  }

  return null;
};

export default SiteMap;
