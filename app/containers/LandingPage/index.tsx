import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// router
import { Link, browserHistory } from 'react-router';

// components
import ContentContainer from 'components/ContentContainer';
import IdeaCards from 'components/IdeaCards';
import ProjectCards from 'components/ProjectCards';
import Icon from 'components/UI/Icon';
import Button from 'components/UI/Button';
import Footer from 'components/Footer';
import Spinner from 'components/UI/Spinner';

// services
import { authUserStream } from 'services/auth';
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { ideaByIdStream, ideasStream, updateIdea } from 'services/ideas';
import { projectsStream } from 'services/projects';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { getLocalized } from 'utils/i18n';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

// typings
import { Locale } from 'typings';

const Container: any = styled.div`
  height: 100%;
  min-height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${(props: any) => props.hasHeader ? '#f6f6f6' : '#fff'};
  position: relative;

  ${media.smallerThanMaxTablet`
    min-height: auto;
  `}
`;

const Loading = styled.div`
  width: 100%;
  height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  display: flex;
  align-items: center;
  justify-content: center;

  ${media.smallerThanMaxTablet`
    height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - 70px);
  `}
`;

const Header = styled.div`
  width: 100vw;
  height: 480px;
  margin: 0;
  padding: 0;
  position: relative;

  ${media.smallerThanMinTablet`
    height: 250px;
  `}
`;

const HeaderImage = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const HeaderImageBackground: any = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-image: url(${(props: any) => props.src});
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  background-image: url(${(props: any) => props.src});
`;

const HeaderImageOverlay = styled.div`
  background: #000;
  opacity: 0.55;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
`;

const HeaderContent = styled.div`
  width: 100%;
  max-width: ${(props) => props.theme.maxPageWidth + 60}px;
  height: 100%;
  position: absolute;
  left: 0;
  right: 0;
  margin: 0 auto;
  margin-top: -10px;
  padding-left: 30px;
  padding-right: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 2;
`;

const HeaderTitle: any = styled.h1`
  width: 100%;
  max-width: 600px;
  color: ${(props: any) => props.hasHeader ? '#fff' : props.theme.colorMain};
  font-size: 55px;
  line-height: 64px;
  font-weight: 600;
  text-align: left;
  white-space: normal;
  word-break: normal;
  word-wrap: normal;
  overflow-wrap: normal;
  margin: 0;
  padding: 0;

  ${media.smallerThanMinTablet`
    font-size: 34px;
    line-height: 39px;
    padding: 0;
  `}
`;

const HeaderSubtitle: any = styled.h2`
  width: 100%;
  max-width: 580px;
  color: ${(props: any) => props.hasHeader ? '#fff' : props.theme.colorMain};
  font-size: 22px;
  line-height: 26px;
  font-weight: 100;
  white-space: normal;
  word-break: normal;
  word-wrap: normal;
  overflow-wrap: normal;
  hyphens: auto;
  max-width: 980px;
  text-align: left;
  text-decoration: none;
  padding: 0;
  padding-bottom: 0px;
  margin: 0;
  margin-top: 25px;
  border-bottom: solid 1px transparent;

  ${media.smallerThanMinTablet`
    font-size: 20px;
    font-weight: 300;
    line-height: 26px;
    margin-top: 20px;
  `}
`;

const Content = styled.div`
  width: 100%;
  background: #f6f6f6;
  z-index: 1;
`;

const StyledContentContainer = styled(ContentContainer)`
  padding-bottom: 10px;
`;

const IdeasStyledContentContainer = StyledContentContainer.extend``;

const ProjectsStyledContentContainer = StyledContentContainer.extend`
  background: #fff;
`;

const Section = styled.div`
  width: 100%;
  margin-top: 80px;
  padding-bottom: 60px;

  ${media.smallerThanMinTablet`
    margin-top: 60px;
  `}
`;

const SectionHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 35px;
`;

const SectionTitle = styled.h2`
  color: #333;
  font-size: 28px;
  line-height: 32px;
  font-weight: 500;
  white-space: normal;
  display: flex;
  align-items: flex-end;
  margin: 0;
  padding: 0;

  ${media.smallerThanMaxTablet`
    font-size: 26px;
    line-height: 30px;
  `}
`;

const SectionContainer = styled.section`
  width: 100%;
  margin-top: 10px;
`;

const ExploreText = styled.div`
  color: #84939E;
  font-size: 17px;
  font-weight: 400;
  line-height: 21px;
  white-space: normal;
  margin-right: 8px;
  text-decoration: underline;
  transition: all 100ms ease-out;

  ${media.smallerThanMaxTablet`
    font-size: 15px;
    line-height: 19px;
  `}
`;

const ExploreIcon = styled(Icon) `
  height: 19px;
  fill: #84939E;
  margin-top: 1px;
  transition: all 100ms ease-out;
`;

const Explore = styled(Link) `
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-bottom: 4px;

  &:hover {
    ${ExploreText} {
      color: #000;
    }

    ${ExploreIcon} {
      fill: #000;
    }
  }

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const SectionFooter = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ViewMoreButton = styled(Button) `
  margin-top: 20px;
`;

type Props = {};

type State = {
  locale: Locale | null;
  currentTenant: ITenant | null;
  currentTenantHeader: string | null;
  hasIdeas: boolean;
  hasProjects: boolean;
  loaded: boolean;
};

export const landingPageIdeasQuery = { sort: 'trending', 'page[number]': 1, 'page[size]': 6 };
export const landingPageProjectsQuery = { sort: 'new', 'page[number]': 1, 'page[size]': 2 };

export default class LandingPage extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null,
      currentTenant: null,
      currentTenantHeader: null,
      hasIdeas: false,
      hasProjects: false,
      loaded: false
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const query = browserHistory.getCurrentLocation().query;
    const authUser$ = authUserStream().observable;
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;
    const ideas$ = ideasStream({ queryParameters: landingPageIdeasQuery }).observable;
    const projects$ = projectsStream({ queryParameters: landingPageProjectsQuery }).observable;
    const ideaToPublish$ = (query && query.idea_to_publish ? ideaByIdStream(query.idea_to_publish).observable : Rx.Observable.of(null));

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenant$,
        ideas$,
        projects$
      ).subscribe(([locale, currentTenant, ideas, projects]) => {
        this.setState({
          locale,
          currentTenant,
          currentTenantHeader: (currentTenant.data.attributes.header_bg ? currentTenant.data.attributes.header_bg.large : null),
          hasIdeas: (ideas !== null && ideas.data.length > 0),
          hasProjects: (projects !== null && projects.data.length > 0),
          loaded: true
        });
      }),

      // if 'idea_to_publish' parameter is present in landingpage url,
      // find the draft idea previously created (before login/signup)
      // and update its status and author name
      Rx.Observable.combineLatest(
        authUser$,
        ideaToPublish$
      ).subscribe(async ([authUser, ideaToPublish]) => {
        if (authUser && ideaToPublish && ideaToPublish.data.attributes.publication_status === 'draft') {
          await updateIdea(ideaToPublish.data.id, { author_id: authUser.data.id, publication_status: 'published' });
          ideasStream({ queryParameters: landingPageIdeasQuery }).fetch();
        }

        // remove 'idea_to_publish' parameter from url
        window.history.replaceState(null, '', window.location.pathname);
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  goToIdeasPage = () => {
    browserHistory.push('/ideas');
  }

  goToProjectsPage = () => {
    browserHistory.push('/projects');
  }

  goToAddIdeaPage = () => {
    browserHistory.push('/ideas/new');
  }

  render() {
    const { locale, currentTenant, currentTenantHeader, hasIdeas, hasProjects, loaded } = this.state;

    if (!loaded) {
      return (
        <Loading id="ideas-loading">
          <Spinner size="30px" color="#666" />
        </Loading>
      );
    }

    if (loaded && locale && currentTenant) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;
      const organizationNameMultiLoc = currentTenant.data.attributes.settings.core.organization_name;
      const headerTitleMultiLoc = currentTenant.data.attributes.settings.core.header_title;
      const headerSloganMultiLoc = currentTenant.data.attributes.settings.core.header_slogan;
      const currentTenantName = getLocalized(organizationNameMultiLoc, locale, currentTenantLocales);
      const currentTenantHeaderTitle = (headerTitleMultiLoc ? getLocalized(headerTitleMultiLoc, locale, currentTenantLocales) : null);
      const currentTenantHeaderSlogan = (headerSloganMultiLoc ? getLocalized(headerSloganMultiLoc, locale, currentTenantLocales) : null);
      const title = (currentTenantHeaderTitle ? currentTenantHeaderTitle : <FormattedMessage {...messages.titleCity} values={{ name: currentTenantName }}/>);
      const subtitle = (currentTenantHeaderSlogan ? currentTenantHeaderSlogan : <FormattedMessage {...messages.subtitleCity} />);
      const hasHeaderImage = (currentTenantHeader !== null);

      return (
        <>
          <Container id="e2e-landing-page" hasHeader={hasHeaderImage}>
            <Header>
              <HeaderImage>
                <HeaderImageBackground src={currentTenantHeader} />
                <HeaderImageOverlay />
              </HeaderImage>

              <HeaderContent>
                <HeaderTitle hasHeader={hasHeaderImage}>
                  {title}
                </HeaderTitle>
                <HeaderSubtitle hasHeader={hasHeaderImage}>
                  {subtitle}
                </HeaderSubtitle>
              </HeaderContent>
            </Header>

            <Content>
              <ProjectsStyledContentContainer>
                {hasProjects &&
                  <Section>
                    <SectionHeader>
                      <SectionTitle>
                        <FormattedMessage {...messages.cityProjects} />
                      </SectionTitle>
                      <Explore to="/projects">
                        <ExploreText>
                          <FormattedMessage {...messages.exploreAllProjects} />
                        </ExploreText>
                        <ExploreIcon name="compass" />
                      </Explore>
                    </SectionHeader>
                    <SectionContainer>
                      <ProjectCards filter={landingPageProjectsQuery} loadMoreEnabled={false} />
                    </SectionContainer>
                    <SectionFooter>
                      <ViewMoreButton
                        text={<FormattedMessage {...messages.exploreAllProjects} />}
                        style="primary"
                        size="2"
                        icon="compass"
                        onClick={this.goToProjectsPage}
                        circularCorners={false}
                      />
                    </SectionFooter>
                  </Section>
                }
              </ProjectsStyledContentContainer>

              <IdeasStyledContentContainer>
                <Section className="ideas">
                  <SectionHeader>
                    <SectionTitle>
                      <FormattedMessage {...messages.trendingIdeas} />
                    </SectionTitle>
                    {hasIdeas &&
                      <Explore to="/ideas">
                        <ExploreText>
                          <FormattedMessage {...messages.exploreAllIdeas} />
                        </ExploreText>
                        <ExploreIcon name="compass" />
                      </Explore>
                    }
                  </SectionHeader>
                  <SectionContainer>
                    <IdeaCards filter={landingPageIdeasQuery} loadMoreEnabled={false} />
                  </SectionContainer>
                  {hasIdeas &&
                    <SectionFooter>
                      <ViewMoreButton
                        text={<FormattedMessage {...messages.exploreAllIdeas} />}
                        style="primary"
                        size="2"
                        icon="compass"
                        onClick={this.goToIdeasPage}
                        circularCorners={false}
                      />
                    </SectionFooter>
                  }
                </Section>
              </IdeasStyledContentContainer>

              <Footer />
            </Content>
          </Container>
        </>
      );
    }

    return null;
  }
}
