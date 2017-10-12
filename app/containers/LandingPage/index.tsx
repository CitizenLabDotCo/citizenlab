import * as React from 'react';
import * as _ from 'lodash';
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

// services
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { ideasStream, IIdeas } from 'services/ideas';
import { projectsStream, IProjects } from 'services/projects';

// i18n
import T from 'components/T';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import messages from './messages';
import { getLocalized } from 'utils/i18n';

// style
import styled from 'styled-components';
import { lighten, darken } from 'polished';
import { media } from 'utils/styleUtils';

// const header = require('./header.png');
const header = null;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  position: relative;
`;

const BackgroundImage: any = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 0;
  background-image: url(${(props: any) => props.imageSrc});
  background-repeat: no-repeat;
  background-size: auto 535px;
  background-position: center 0px;
`;

const BackgroundColor = styled.div`
  position: absolute;
  top: 575px;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 0;
  background-color: #fff;
  background-color: #f8f8f8;
`;

const Header: any = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
  z-index: 1;
`;

const HeaderLogoWrapper = styled.div`
  width: 110px;
  height: 110px;
  padding: 15px;
  margin-top: 60px;
  margin-bottom: 15px;
  border: solid 2px #eaeaea;
  border-radius: 6px;
  background: #fff;
  border: solid 2px #eaeaea;
  /* box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1); */
`;

const HeaderLogo: any = styled.div`
  width: 100%;
  height: 100%;
  background-image: url(${(props: any) => props.imageSrc});
  background-repeat: no-repeat;
  background-position: center center;
  background-size: contain;
`;

const HeaderTitle = styled.h1`
  color: ${props => props.theme.colorMain};
  font-size: 41px;
  line-height: 45px;
  font-weight: 500;
  text-align: center;
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  ${media.tablet`
    font-size: 40px;
    line-height: 48px;
  `}

  ${media.phone`
    font-weight: 600;
    font-size: 34px;
    line-height: 38px;
  `}

  ${media.smallPhone`
    font-weight: 600;
    font-size: 30px;
    line-height: 34px;
  `}
`;

const HeaderSubtitle = styled.h2`
  color: ${props => props.theme.colorMain};
  font-size: 32px;
  line-height: 38px;
  font-weight: 100;
  max-width: 980px;
  text-align: center;
  text-decoration: none;
  padding: 0;
  padding-bottom: 0px;
  margin: 0;
  margin-top: 10px;
  cursor: pointer;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  border-bottom: solid 1px transparent;
  transition: all 150ms ease-out;

  &:hover {
    border-bottom: solid 1px ${props => props.theme.colorMain};    
  }

  ${media.tablet`
    font-size: 28px;
    line-height: 32px;
  `}

  ${media.phone`
    font-size: 24px;
    line-height: 28px;
  `}

  ${media.smallPhone`
    font-size: 20px;
    line-height: 24px;
  `}
`;

const StyledContentContainer = styled(ContentContainer)`
  padding-bottom: 80px;
`;

const Section = styled.div`
  width: 100%;
  margin-top: 80px;
  padding-bottom: 60px;
`;

const SectionHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 35px;

  ${media.phone`
    padding-top: 50px;
  `}

  ${media.smallPhone`
    flex-wrap: wrap;
  `}
`;

const SectionTitle = styled.h2`
  color: #333;
  font-size: 30px;
  line-height: 34px;
  font-weight: 500;
  display: flex;
  margin: 0;
  padding: 0;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;

  ${media.phone`
    font-size: 23px;
    line-height: 36px;
  `}
`;

const SectionContainer = styled.section`
  width: 100%;
  margin-top: 10px;
`;

const ExploreText = styled.div`
  color: #84939E;
  font-size: 17px;
  font-weight: 300;
  line-height: 17px;
  margin-right: 8px;
  text-decoration: underline;
  transition: all 100ms ease-out;
`;

const ExploreIcon = styled(Icon) `;
  height: 19px;
  fill: #84939E;
  margin-top: 1px;
  transition: all 100ms ease-out;
`;

const Explore = styled(Link) `
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-bottom: 3px;

  &:hover {
    ${ExploreText} {
      color: #000;
    }

    ${ExploreIcon} {
      fill: #000;
    }
  }

  ${media.phone`
    margin-top: 10px;
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
  locale: string | null;
  currentTenant: ITenant | null;
  hasIdeas: boolean;
  hasProjects: boolean;
};

class LandingPage extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];
  ideasQueryParameters: object;
  projectsQueryParameters: object;

  constructor() {
    super();
    this.state = {
      locale: null,
      currentTenant: null,
      hasIdeas: false,
      hasProjects: false
    };
    this.subscriptions = [];
    this.ideasQueryParameters = { sort: 'trending', 'page[size]': 6 };
    this.projectsQueryParameters = { sort: 'new', 'page[number]': 1, 'page[size]': 2 };
  }

  componentWillMount() {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;
    const ideas$ = ideasStream({ queryParameters: this.ideasQueryParameters }).observable;
    const projects$ = projectsStream({ queryParameters: this.ideasQueryParameters }).observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenant$,
        ideas$,
        projects$
      ).subscribe(([locale, currentTenant, ideas, projects]) => this.setState({
        locale,
        currentTenant,
        hasIdeas: (ideas !== null && ideas.data.length > 0),
        hasProjects: (projects !== null && projects.data.length > 0)
      }))
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
    const { locale, currentTenant, hasIdeas, hasProjects } = this.state;
    const { formatMessage } = this.props.intl;

    if (locale && currentTenant) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;
      const organizationNameMultiLoc = currentTenant.data.attributes.settings.core.organization_name;
      const headerSloganMultiLoc = currentTenant.data.attributes.settings.core.header_slogan;
      const currentTenantName = getLocalized(organizationNameMultiLoc, locale, currentTenantLocales);
      const currentTenantLogo = currentTenant.data.attributes.logo.large;
      const currentTenantHeaderSlogan = getLocalized(headerSloganMultiLoc, locale, currentTenantLocales);
      const subtitle = (currentTenantHeaderSlogan ? currentTenantHeaderSlogan : <FormattedMessage {...messages.subtitleCity} />);

      return (
        <div>
          <Container id="e2e-landing-page">
            <BackgroundImage imageSrc={header} />
            <BackgroundColor />

            <Header>
              {currentTenantLogo &&
                <HeaderLogoWrapper>
                  <HeaderLogo imageSrc={currentTenantLogo} />
                </HeaderLogoWrapper>
              }
              <HeaderTitle>
                <FormattedMessage {...messages.titleCity} values={{ name: currentTenantName }} />
              </HeaderTitle>
              <HeaderSubtitle onClick={this.goToAddIdeaPage}>
                {subtitle}
              </HeaderSubtitle>
            </Header>

            <StyledContentContainer>
              <Section>
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
                  <IdeaCards filter={this.ideasQueryParameters} loadMoreEnabled={false} />
                </SectionContainer>
                {hasIdeas &&
                  <SectionFooter>
                    <ViewMoreButton
                      text={formatMessage(messages.exploreAllIdeas)}
                      style="primary"
                      size="3"
                      icon="compass"
                      onClick={this.goToIdeasPage}
                      circularCorners={false}
                    />
                  </SectionFooter>
                }
              </Section>

              {hasProjects &&
                <Section>
                  <SectionHeader>
                    <SectionTitle>
                      {/* <FormattedMessage {...messages.projectsFrom} values={{ name: currentTenantName }} /> */}
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
                    <ProjectCards filter={this.projectsQueryParameters} />
                  </SectionContainer>
                  <SectionFooter>
                    <ViewMoreButton
                      text={formatMessage(messages.exploreAllProjects)}
                      style="primary"
                      size="3"
                      icon="compass"
                      onClick={this.goToProjectsPage}
                      circularCorners={false}
                    />
                  </SectionFooter>
                </Section>
              }
            </StyledContentContainer>

            <Footer />

          </Container>
        </div>
      );
    }

    return null;
  }
}

export default injectIntl<Props>(LandingPage);
