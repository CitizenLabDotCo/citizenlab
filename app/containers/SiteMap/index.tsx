import React, { useRef } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import scrollToComponent from 'react-scroll-to-component';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import Spinner from 'components/UI/Spinner';
import FeatureFlag from 'components/FeatureFlag';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import ContentContainer from 'components/ContentContainer';
import SiteMapMeta from './SiteMapMeta';
import ProjectsSection from './ProjectsSection';
import StoryLink from './StoryLink';
import Link from 'utils/cl-router/Link';

// styles
import styled from 'styled-components';
import { media, colors } from 'utils/styleUtils';

// resources
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';

const Container = styled.div`
  min-height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  display: flex;
  flex-direction: column;
  background: ${colors.background};

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
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

const Title = styled.h1``;

const Nav = styled.nav``;

const Header = styled.header``;

export const H2 = styled.h2``;

export const H3 = styled.h3``;

export const H4 = styled.h4``;

interface DataProps {
  projects: GetProjectsChildProps;
  tenant: GetTenantChildProps;
}

interface Props extends DataProps { }

const SiteMap = ({ projects, tenant }: Props) => {

  const loaded = projects !== undefined;

  const successStories = isNilOrError(tenant) ? [] : tenant.attributes.settings ?.initiatives ?.success_stories;

  const scrollTo = component => () => scrollToComponent(component.current, { align: 'top', offset: -90, duration: 300 });

  const homeSection = useRef(null);
  const projectsSection = useRef(null);
  const archivedSection = useRef(null);
  const currentSection = useRef(null);
  const draftSection = useRef(null);
  const initiativesSection = useRef(null);

  const hasProjectSubsection = archivedSection.current || draftSection.current || currentSection.current;

  return (
    <Container>
      <SiteMapMeta />
      {!loaded &&
        <Loading>
          <Spinner />
        </Loading>
      }
      {loaded &&
        <PageContent>
          <StyledContentContainer>
            <QuillEditedContent>
              <Title>
                <FormattedMessage {...messages.siteMapTitle} />
              </Title>

              <Nav aria-labelledby="nav-header">
                <Header>
                  <FormattedMessage {...messages.pageContents} />
                </Header>
                <ul>
                  <li>
                    <a onClick={scrollTo(homeSection)} role="button">
                      <FormattedMessage {...messages.homeSection} />
                    </a>
                  </li>
                  {!isNilOrError(projects) && <li>
                    <a onClick={scrollTo(projectsSection)} role="button">
                      <FormattedMessage {...messages.projectsSection} />
                    </a>
                    {hasProjectSubsection &&
                      <ul>
                        {currentSection.current && (
                          <li>
                            <a onClick={scrollTo(currentSection)} role="button">
                              <FormattedMessage {...messages.projectsCurrent} />
                            </a>
                          </li>
                        )}
                        {archivedSection.current && (
                          <li>
                            <a onClick={scrollTo(archivedSection)} role="button">
                              <FormattedMessage {...messages.projectsArchived} />
                            </a>
                          </li>
                        )}
                        {draftSection.current && (
                          <li>
                            <a onClick={scrollTo(draftSection)} role="button">
                              <FormattedMessage {...messages.projectsDraft} />
                            </a>
                          </li>
                        )}
                      </ul>
                    }
                  </li>
                  }
                  <FeatureFlag name="initiatives">
                    <li>
                      <a onClick={scrollTo(initiativesSection)} role="button">
                        <FormattedMessage {...messages.initiativesSection} />
                      </a>
                    </li>
                  </FeatureFlag>
                </ul>
              </Nav>

              <Link to="/">
                <H2 ref={homeSection}>
                  <FormattedMessage {...messages.homeSection} />
                </H2>
              </Link>
              <ul>
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
                  <Link to="/sign-in">
                    <FormattedMessage {...messages.signInPage} />
                  </Link>
                </li>
                <li>
                  <Link to="/sign-up">
                    <FormattedMessage {...messages.signUpPage} />
                  </Link>
                </li>
              </ul>
              <ProjectsSection
                projectsSectionRef={projectsSection}
                currentSectionRef={currentSection}
                archivedSectionRef={archivedSection}
                draftSectionRef={draftSection}
              />
              <FeatureFlag name="initiatives">
                <Link to="/initiatives" id="initiatives">
                  <H2 ref={initiativesSection}>
                    <FormattedMessage {...messages.initiativesSection} />
                  </H2>
                </Link>
                <ul>
                  <li>
                    <Link to="pages/initiatives">
                      <FormattedMessage {...messages.initiativesInfo} />
                    </Link>
                  </li>
                  {successStories && successStories.length === 3 && (
                    <li>
                      <FormattedMessage {...messages.successStories} />
                      <ul>
                        {successStories.map(story => (
                          <li key={story.page_slug}>
                            <StoryLink story={story} />
                          </li>
                        ))}
                      </ul>
                    </li>
                  )}
                  <li>
                    <Link to="/initiatives">
                      <FormattedMessage {...messages.initiativesList} />
                    </Link>
                  </li>
                </ul>
              </FeatureFlag>
            </QuillEditedContent>
          </StyledContentContainer>
        </PageContent>
      }
    </Container>
  );
};

const Data = adopt<DataProps>({
  projects: <GetProjects publicationStatuses={['draft', 'published', 'archived']} />,
  tenant: <GetTenant />
});

export default () => (
  <Data>
    {dataprops => <SiteMap {...dataprops} />}
  </Data>
);
