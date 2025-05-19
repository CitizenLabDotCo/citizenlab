import React, { KeyboardEvent, MouseEvent, RefObject, useRef } from 'react';

import { colors, fontSizes, media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { TCustomPageCode } from 'api/custom_pages/types';
import useCustomPages from 'api/custom_pages/useCustomPages';
import useAuthUser from 'api/me/useAuthUser';
import useNavbarItems from 'api/navbar/useNavbarItems';
import { DEFAULT_PAGE_SLUGS } from 'api/navbar/util';

import useLocalize from 'hooks/useLocalize';

import ContentContainer from 'components/ContentContainer';
import QuillEditedContent from 'components/UI/QuillEditedContent';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { removeFocusAfterMouseClick } from 'utils/helperUtils';

import messages from './messages';
import ProjectsAndFoldersSection from './ProjectsAndFoldersSection';
import SiteMapMeta from './SiteMapMeta';

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

const PageContent = styled.div`
  flex-shrink: 0;
  flex-grow: 1;
  background: #fff;
  padding-top: 60px;
  padding-bottom: 60px;
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
  const { data: navBarItems } = useNavbarItems();
  const localize = useLocalize();
  const { data: pages } = useCustomPages();
  const { data: authUser } = useAuthUser();

  const hasStaticPageWithCode = (code: TCustomPageCode): boolean => {
    return pages?.data?.some((page) => page.attributes.code === code) || false;
  };

  const scrollTo =
    (component: RefObject<HTMLHeadingElement | null>) =>
    (event: MouseEvent | KeyboardEvent) => {
      if (component.current) {
        // if the event is synthetic, it's a key event and we move focus
        // https://github.com/facebook/react/issues/3907
        if ((event as any).detail === 0) {
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
  const userSpaceSection = useRef<HTMLHeadingElement | null>(null);
  const customPagesSection = useRef<HTMLHeadingElement | null>(null);
  const hasProjectSubsection =
    archivedSection.current || draftSection.current || currentSection.current;

  if (pages) {
    const nonCustomStaticPages = pages.data.filter((page) => {
      const showPageConditions: Record<TCustomPageCode, boolean> = {
        about: true,
        faq: true,
        'terms-and-conditions': true,
        'privacy-policy': true,
        'cookie-policy': true,
        custom: false,
      };

      return showPageConditions[page.attributes.code];
    });

    const customStaticPages = pages.data.filter((page) => {
      return page.attributes.code === 'custom';
    });

    return (
      <>
        <SiteMapMeta />
        <main>
          <Container>
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
                    {navBarItems &&
                      navBarItems.data
                        .filter(
                          (navBarItem) =>
                            navBarItem.relationships.static_page.data ===
                              null &&
                            navBarItem.relationships.project.data === null
                        )
                        .map((navBarItem) => (
                          <li key={navBarItem.id}>
                            <Link
                              to={
                                DEFAULT_PAGE_SLUGS[navBarItem.attributes.code]
                              }
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
                    {/* Default cookie policy link if no custom one exists */}
                    {!hasStaticPageWithCode('cookie-policy') && (
                      <li key="default-cookie-policy">
                        <Link to="/pages/cookie-policy">
                          <FormattedMessage
                            {...messages.cookiePolicyLinkTitle}
                          />
                        </Link>
                      </li>
                    )}
                  </ul>
                  <>
                    {authUser && (
                      <>
                        <H2 ref={userSpaceSection} tabIndex={-1}>
                          <FormattedMessage {...messages.userSpaceSection} />
                        </H2>
                        <ul>
                          <>
                            <li>
                              <Link
                                to={`/profile/${authUser.data.attributes.slug}`}
                              >
                                <FormattedMessage {...messages.profilePage} />
                              </Link>
                            </li>
                            <li>
                              <Link to="/profile/edit">
                                <FormattedMessage
                                  {...messages.profileSettings}
                                />
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
          </Container>
        </main>
      </>
    );
  }

  return null;
};

export default SiteMap;
