import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// router
import { Link } from 'react-router';

// components
import ImageHeader, { HeaderTitle, HeaderSubtitle } from 'components/ImageHeader';
import ContentContainer from 'components/ContentContainer';
import IdeaCards from 'components/IdeaCards';
import ProjectCards from 'components/ProjectCards';
import Footer from './components/footer';

// services
import { state, IStateStream } from 'services/state';
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

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -70px;
`;

const ProjectsSectionWrapper = styled.div`
  background: #f9f9f9;
  width: 100vw;
`;

const Section = styled.div`
  margin-top: 80px;
  padding-bottom: 30px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-bottom: 15px;

  ${media.phone`
    padding-top: 50px;
  `}

  ${media.smallPhone`
    flex-wrap: wrap;
  `}
`;

const SectionTitle = styled.h2`
  flex: 1;
  color: #222222;
  font-size: 35px;
  line-height: 35px;
  font-weight: 600;
  margin: 0;
  margin-right: 20px;

  ${media.phone`
    font-size: 23px;
    line-height: 36px;
  `}
`;

const ViewAllButtonText = styled.div`
  color: #000;
`;

const ViewAllButton = styled(Link)`
  align-items: center;
  color: #cacaca;
  cursor: pointer;
  display: flex;
  font-size: 18px;
  font-weight: 300;
  line-height: 16px;
  margin-bottom: 8px;
  margin-right: 7px;
  text-decoration: underline;

  &:hover {
    color: ${lighten(0.1, '#000')};

    ${ViewAllButtonText} {
      color: ${lighten(0.1, '#000')};
    }
  }

  ${media.phone`
    margin-top: 10px;
  `}
`;

type Props = {

};

type State = {
  currentTenant: ITenant | null;
};

const SectionContainer = styled.section`
  margin-top: 10px;
`;

const namespace = 'LandingPage/index';

class LandingPage extends React.PureComponent<Props, State> {
  state$: IStateStream<State>;
  subscriptions: Rx.Subscription[];

  componentWillMount() {
    const initialState: State = { currentTenant: null };
    this.state$ = state.createStream<State>(namespace, namespace, initialState);

    this.subscriptions = [
      this.state$.observable.subscribe(state => this.setState(state)),
      currentTenantStream().observable.subscribe(currentTenant => this.state$.next({ currentTenant }))
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { currentTenant } = this.state;

    if (currentTenant) {
      const currentTenantName = i18n.getLocalized(currentTenant.data.attributes.settings.core.organization_name);
      const currentTenantHeaderBg = currentTenant.data.attributes.header_bg.large as string;
      const currentTenantHeaderSlogan = i18n.getLocalized(currentTenant.data.attributes.settings.core.header_slogan);
      const subtitle = (currentTenantHeaderSlogan ? currentTenantHeaderSlogan : <FormattedMessage {...messages.SubTitleCity} values={{ name: currentTenantName }} />);
      const ideaCardsFilter = { sort: 'trending', 'page[size]': 9 };

      return (
        <div>
          <Container>
            <ImageHeader image={currentTenantHeaderBg}>
              <HeaderTitle>
                <FormattedMessage {...messages.titleCity} values={{ name: currentTenantName }} />
              </HeaderTitle>
              <HeaderSubtitle>
                {subtitle}
              </HeaderSubtitle>
            </ImageHeader>

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
                    </ViewAllButton>
                  </SectionHeader>
                  <SectionContainer>
                    <ProjectCards />
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
