import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// router
import { Link } from 'react-router';

// components
import ContentContainer from 'components/ContentContainer';
import IdeaCards from 'components/IdeaCards';
import ProjectCards from 'components/ProjectCards';
import Icon from 'components/UI/Icon';
import Footer from './footer';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';

// i18n
import T from 'containers/T';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import i18n from 'utils/i18n';

// style
import styled from 'styled-components';
import { lighten } from 'polished';
import { media } from 'utils/styleUtils';

const header = require('./header.png');

const Container: any = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  background-image: url(${(props: any) => props.imageSrc});  
  background-repeat: no-repeat;
  background-position: center 0px;
`;

const Header: any = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
`;

const HeaderLogoWrapper = styled.div`
  width: 110px;
  height: 110px;
  padding: 15px;
  margin-top: 60px;
  margin-bottom: 15px;
  border: solid 2px #eaeaea;
  border-radius: 5px;
  background: #fff;
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
  color: ${props =>  props.theme.colorMain};
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
  color: ${props =>  props.theme.colorMain};
  font-size: 32px;
  line-height: 38px;
  font-weight: 100;
  max-width: 980px;
  text-align: center;
  padding: 0;
  margin: 0;
  margin-top: 10px;
  opacity: 0.8;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

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

const ProjectsSectionWrapper = styled.div`
  width: 100vw;
  background: #fff;
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

  /*
  ${media.phone`
    padding-top: 50px;
  `}

  ${media.smallPhone`
    flex-wrap: wrap;
  `}
  */
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

  /*
  ${media.phone`
    font-size: 23px;
    line-height: 36px;
  `}
  */
`;

const SectionContainer = styled.section`
  width: 100%;
  margin-top: 10px;
`;

const ViewAllButtonText = styled.div`
  margin-right: 10px;
`;

const ViewAllButtonIcon = styled(Icon)`;
  height: 10px;
  fill: #999;
  margin-top: 3px;
`;

const ViewAllButton = styled(Link)`
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 300;
  line-height: 18px;
  text-decoration: none;

  &:hover {
    color: #000;

    ${ViewAllButtonIcon} {
      fill: #000;
    }
  }

  ${media.phone`
    margin-top: 10px;
  `}
`;

type State = {
  currentTenant: ITenant | null;
};

export default class LandingPage extends React.PureComponent<{}, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      currentTenant: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const currentTenant$ = currentTenantStream().observable;

    this.subscriptions = [
      currentTenant$.subscribe(currentTenant => this.setState({ currentTenant }))
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { currentTenant } = this.state;

    if (currentTenant !== null) {
      const currentTenantName = i18n.getLocalized(currentTenant.data.attributes.settings.core.organization_name);
      const currentTenantLogo = currentTenant.data.attributes.logo.large;
      const currentTenantHeaderSlogan = i18n.getLocalized(currentTenant.data.attributes.settings.core.header_slogan);
      const subtitle = (currentTenantHeaderSlogan ? currentTenantHeaderSlogan : <FormattedMessage {...messages.subtitleCity} />);
      const ideaCardsFilter = { sort: 'trending', 'page[size]': 9 };
      const projectCardsFilter = { sort: 'new', 'page[number]': 1, 'page[size]': 2 };

      return (
        <div>
          <Container imageSrc={header}>
            <Header>
              {currentTenantLogo && 
              <HeaderLogoWrapper>
                <HeaderLogo imageSrc={currentTenantLogo} />
              </HeaderLogoWrapper>
              }
              <HeaderTitle>
                <FormattedMessage {...messages.titleCity} values={{ name: currentTenantName }} />
              </HeaderTitle>
              <HeaderSubtitle>
                {subtitle}
              </HeaderSubtitle>
            </Header>

            <ContentContainer>
              <Section>
                <SectionHeader>
                  <SectionTitle>
                    <FormattedMessage {...messages.ideasFrom} values={{ name: currentTenantName }} />
                  </SectionTitle>
                  <ViewAllButton to="/ideas">
                    <ViewAllButtonText>
                      <FormattedMessage {...messages.viewIdeas} />
                    </ViewAllButtonText>
                    <ViewAllButtonIcon name="chevron-right" />
                  </ViewAllButton>
                </SectionHeader>
                <SectionContainer>
                  <IdeaCards filter={ideaCardsFilter} loadMoreEnabled={false} />
                </SectionContainer>
              </Section>
            </ContentContainer>

            <ProjectsSectionWrapper>
              <ContentContainer>
                <Section>
                  <SectionHeader>
                    <SectionTitle>
                      <FormattedMessage {...messages.projectsFrom} values={{ name: currentTenantName }} />
                    </SectionTitle>
                    <ViewAllButton to="/projects">
                      <ViewAllButtonText>
                        <FormattedMessage {...messages.viewProjects} />
                      </ViewAllButtonText>
                      <ViewAllButtonIcon name="chevron-right" />
                    </ViewAllButton>
                  </SectionHeader>
                  <SectionContainer>
                    <ProjectCards filter={projectCardsFilter} />
                  </SectionContainer>
                </Section>
              </ContentContainer>
            </ProjectsSectionWrapper>

            <Footer />

          </Container>
        </div>
      );
    }

    return null;
  }
}
