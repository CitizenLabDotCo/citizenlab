import React from 'react';
import { adopt } from 'react-adopt';
import { browserHistory } from 'react-router';
import { Observable, Subscription } from 'rxjs/Rx';
import { isNilOrError } from 'utils/helperUtils';
import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

// components
import ContentContainer from 'components/ContentContainer';
import IdeaCards from 'components/IdeaCards';
import ProjectCards from 'components/ProjectCards';
import Footer from 'components/Footer';

// services
import { authUserStream } from 'services/auth';
import { ideaByIdStream, updateIdea } from 'services/ideas';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { getLocalized } from 'utils/i18n';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container: any = styled.div`
  height: 100%;
  min-height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background: #fff;

  ${media.smallerThanMaxTablet`
    min-height: auto;
  `}

  ${media.smallerThanMinTablet`
    background: #f9f9fa;
  `}
`;

const Header = styled.div`
  width: 100%;
  height: 450px;
  flex: 0 0 450px;
  margin: 0;
  padding: 0;
  position: relative;

  ${media.smallerThanMinTablet`
    height: 320px;
    flex: 0 0 320px;
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
  opacity: 0.4;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const HeaderContent = styled.div`
  width: 100%;
  max-width: ${(props) => props.theme.maxPageWidth + 60}px;
  height: 100%;
  position: absolute;
  left: 0;
  right: 0;
  margin: 0 auto;
  margin-top: -50px;
  padding-left: 30px;
  padding-right: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  ${media.smallerThanMinTablet`
    margin-top: -30px;
  `}
`;

const HeaderTitle: any = styled.h1`
  width: 100%;
  max-width: 980px;
  color: ${(props: any) => props.hasHeader ? '#fff' : props.theme.colorMain};
  font-size: 52px;
  line-height: 60px;
  font-weight: 600;
  text-align: center;
  white-space: normal;
  word-break: normal;
  word-wrap: normal;
  overflow-wrap: normal;
  margin: 0;
  padding: 0;

  ${media.smallerThanMaxTablet`
    font-size: 48px;
    line-height: 60px;
  `}

  ${media.smallerThanMinTablet`
    font-size: 34px;
    line-height: 39px;
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
  text-align: center;
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
  z-index: 3;
`;

const StyledContentContainer = styled(ContentContainer)`
  padding-bottom: 10px;
`;

const ProjectsStyledContentContainer = StyledContentContainer.extend``;

const IdeasStyledContentContainer = StyledContentContainer.extend`
  background: #f9f9fa;
`;

const Section = styled.div`
  width: 100%;
  padding-top: 100px;
  padding-bottom: 100px;

  ${media.smallerThanMinTablet`
    padding-top: 60px;
    padding-bottom: 60px;
  `}
`;

const ProjectSection = Section.extend`
  padding-top: 0px;
  margin-top: -80px;
  padding-bottom: 80px;

  ${media.smallerThanMinTablet`
    margin-top: -130px;
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
    width: 100%;
    font-size: 26px;
    line-height: 30px;
  `}
`;

const SectionContainer = styled.section`
  width: 100%;
  margin-top: 10px;
`;

export interface InputProps {
  ideaId: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  tenant: GetTenantChildProps;
  projects: GetProjectsChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class LandingPage extends React.PureComponent<Props, State> {
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const query = browserHistory.getCurrentLocation().query;
    const authUser$ = authUserStream().observable;
    const ideaToPublish$ = (query && query.idea_to_publish ? ideaByIdStream(query.idea_to_publish).observable : Observable.of(null));

    this.subscriptions = [
      // if 'idea_to_publish' parameter is present in landingpage url,
      // find the draft idea previously created (before login/signup)
      // and update its status and author name
      Observable.combineLatest(
        authUser$,
        ideaToPublish$
      ).subscribe(async ([authUser, ideaToPublish]) => {
        if (authUser && ideaToPublish && ideaToPublish.data.attributes.publication_status === 'draft') {
          await updateIdea(ideaToPublish.data.id, { author_id: authUser.data.id, publication_status: 'published' });
          streams.fetchAllStreamsWithEndpoint(`${API_PATH}/ideas`);
          window.history.replaceState(null, '', window.location.pathname);
        }
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
    const { locale, tenant, projects } = this.props;

    if (!isNilOrError(locale) && !isNilOrError(tenant)) {
      const tenantLocales = tenant.attributes.settings.core.locales;
      const organizationNameMultiLoc = tenant.attributes.settings.core.organization_name;
      const headerTitleMultiLoc = tenant.attributes.settings.core.header_title;
      const headerSloganMultiLoc = tenant.attributes.settings.core.header_slogan;
      const tenantName = getLocalized(organizationNameMultiLoc, locale, tenantLocales);
      const tenantHeaderTitle = (headerTitleMultiLoc ? getLocalized(headerTitleMultiLoc, locale, tenantLocales) : null);
      const tenantHeaderSlogan = (headerSloganMultiLoc ? getLocalized(headerSloganMultiLoc, locale, tenantLocales) : null);
      const tenantHeaderImage = (tenant.attributes.header_bg ? tenant.attributes.header_bg.large : null);
      const title = (tenantHeaderTitle ? tenantHeaderTitle : <FormattedMessage {...messages.titleCity} values={{ name: tenantName }}/>);
      const subtitle = (tenantHeaderSlogan ? tenantHeaderSlogan : <FormattedMessage {...messages.subtitleCity} />);
      const hasHeaderImage = (tenantHeaderImage !== null);
      const hasProjects = (projects.projectsList && projects.projectsList.length === 0 ? false : true);

      return (
        <>
          <Container id="e2e-landing-page" hasHeader={hasHeaderImage}>
            <Header id="hook-header">
              <HeaderImage id="hook-header-image">
                <HeaderImageBackground src={tenantHeaderImage} />
                <HeaderImageOverlay />
              </HeaderImage>

              <HeaderContent id="hook-header-content">
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
                  <ProjectSection>
                    <SectionContainer>
                      <ProjectCards
                        pageSize={3}
                        sort="new"
                        hideAllFilters={true}
                      />
                    </SectionContainer>
                  </ProjectSection>
                }
              </ProjectsStyledContentContainer>

              <IdeasStyledContentContainer>
                <Section className="ideas">
                  <SectionHeader>
                    <SectionTitle>
                      <FormattedMessage {...messages.trendingIdeas} />
                    </SectionTitle>
                  </SectionHeader>
                  <SectionContainer>
                    <IdeaCards
                      type="load-more"
                      sort="trending"
                      pageSize={9}
                    />
                  </SectionContainer>
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

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  tenant: <GetTenant />,
  projects: <GetProjects pageSize={250} sort="new" />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <LandingPage {...inputProps} {...dataProps} />}
  </Data>
);
