import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import styled from 'styled-components';
import WatchSagas from 'containers/WatchSagas';
import Modal from 'components/UI/Modal';
import { preprocess } from 'utils';
import IdeasShow from 'containers/IdeasShow';
import { Link } from 'react-router';
import { lighten } from 'polished';

import {
  selectLandingPage,
  makeSelectProjects,
} from './selectors';
import { loadProjects } from './actions';
import sagas from './sagas';
import T from 'containers/T';
import IdeaCards from 'components/IdeaCards';
import ProjectCard from 'components/ProjectCard';
import { media } from 'utils/styleUtils';

import { makeSelectCurrentTenantImm } from 'utils/tenant/selectors';

import { injectTFunc } from 'utils/containers/t/utils';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f2f2f2;
`;

const HeaderContainer = styled.div`
  width: 100%;
  height: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-left: 25px;
  padding-right: 25px;
  position: relative;
  z-index: 1;

  ${media.notPhone`
    height: 360px;
  `}

  ${media.phone`
    min-height: 305px;
  `}
`;

const HeaderOverlay = styled.div`
  background-color: #000;
  opacity: 0.35;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const HeaderBackground = styled.div`
  background-image: url(${(props) => props.src});
  background-repeat: no-repeat;
  background-position: center top;
  background-size: cover;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const HeaderTitle = styled.h1`
  font-size: 45px;
  line-height: 50px;
  font-weight: 600;
  text-align: center;
  color: #FFFFFF;
  margin: 0;
  padding: 0;
  padding-top: 115px;
  display: flex;
  z-index: 1;

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
  color: #fff;
  font-size: 30px;
  line-height: 34px;
  font-weight: 100;
  max-width: 980px;
  text-align: center;
  margin: 0;
  margin-top: 10px;
  padding: 0;
  opacity: 0.8;
  z-index: 1;

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

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 30px;
  padding-right: 30px;
`;

const Content = styled.div`
  width: 100%;
  max-width: 980px;
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
  /* border: solid 1px purple; */

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
  font-weight: 500;
  margin: 0;
  margin-right: 20px;
  /* border: solid 1px green; */

  ${media.phone`
    font-size: 32px;
    line-height: 36px;
  `}
`;

const ViewAllButtonText = styled.div`
  color: ${(props) => props.theme.colorMain};
  font-size: 18px;
  font-weight: 300;
  line-height: 16px;
  margin-right: 7px;
  cursor: pointer;
`;

const ViewAllButtonIcon = styled.svg`
  fill: ${(props) => props.theme.colorMain};
  height: 11px;
  margin-top: -1px;
  cursor: pointer;
`;

const ViewAllButton = styled(Link)`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  cursor: pointer;

  &:hover {
    ${ViewAllButtonIcon} {
      fill: ${(props) => lighten(0.2, props.theme.colorMain)};
    }

    ${ViewAllButtonText} {
      color: ${(props) => lighten(0.2, props.theme.colorMain)};
    }
  }

  ${media.phone`
    margin-top: 10px;
  `}
`;

const SectionContainer = styled.section`
  margin-top: 10px;
`;

const Footer = styled.div`
  color: #333;
  font-weight: 400;
  font-size: 17px;
  text-align: center;
  display: inline-block;
  padding-left: 30px;
  padding-right: 30px;
  margin: 60px auto 50px auto;
`;

class LandingPage extends React.Component {
  constructor() {
    super();

    this.state = {
      modalOpened: false,
      // pageUrl: null,
      modalUrl: null,
      selectedIdeaId: null,
    };
  }

  componentDidMount() {
    this.props.loadProjects(1, 2);
  }

  openIdea = (id) => () => {
    this.setState({
      modalOpened: true,
      // pageUrl: window.location.href,
      modalUrl: `${window.location.protocol}//${window.location.host}/ideas/${id}`,
      selectedIdeaId: id,
    });
  };

  openProject = (id) => () => {
    console.log(id);
  };

  closeModal = () => {
    this.setState({
      modalOpened: false,
      // pageUrl: null,
      modalUrl: null,
      selectedIdeaId: null,
    });
  }

  render() {
    let projectsList = null;

    const { projects, loadingProjects, loadProjectsError, location } = this.props;
    const { modalOpened, selectedIdeaId } = this.state;

    if (loadingProjects) {
      projectsList = <div>Loading...</div>;
    } else if (loadProjectsError) {
      projectsList = <div>An error occured</div>;
    } else if (projects && projects.size > 0) {
      projectsList = projects.map((project) => (
        <ProjectCard key={project.get('id')} id={project.get('id')} />
      ));
    }

    const { tenant, tFunc } = this.props;
    const tenantName = tenant.getIn(['attributes', 'settings', 'core', 'organization_name']);
    const tenantHeaderBg = tenant.getIn(['attributes', 'header_bg', 'large']);
    const headerSlogan = tenant.getIn(['attributes', 'settings', 'core', 'header_slogan']);


    return (
      <div>
        <WatchSagas sagas={sagas} />

        <Container>
          <HeaderContainer>
            <HeaderBackground src={tenantHeaderBg}></HeaderBackground>
            <HeaderOverlay></HeaderOverlay>
            <HeaderTitle>
              <FormattedMessage {...messages.titleCity} values={{ name: tFunc(tenantName) }} />
            </HeaderTitle>
            <HeaderSubtitle>
              {headerSlogan ?
                <T value={headerSlogan} />
              :
                <FormattedMessage {...messages.SubTitleCity} values={{ name: tFunc(tenantName) }} />
              }
            </HeaderSubtitle>
          </HeaderContainer>

          <ContentContainer>
            <Content>
              <Section>
                <SectionHeader>
                  <SectionTitle>
                    <FormattedMessage {...messages.ideasFrom} values={{ name: tFunc(tenantName) }} />
                  </SectionTitle>
                  <ViewAllButton to="/ideas">
                    <ViewAllButtonText>
                      <FormattedMessage {...messages.viewIdeas} />
                    </ViewAllButtonText>
                    <ViewAllButtonIcon height="100%" viewBox="8.86 6.11 6.279 10.869">
                      <path d="M15.14 11.545L9.705 6.11l-.845.846 4.298 4.306.282.283-.282.283-4.298 4.307.845.844" />
                    </ViewAllButtonIcon>
                  </ViewAllButton>
                </SectionHeader>
                <SectionContainer>
                  <IdeaCards
                    filter={{ sort: 'trending', 'page[size]': 3 }}
                    loadMoreEnabled={false}
                  />
                </SectionContainer>
              </Section>

              <Section>
                <SectionHeader>
                  <SectionTitle>
                    <FormattedMessage {...messages.projectsFrom} values={{ name: tFunc(tenantName) }} />
                  </SectionTitle>
                  <ViewAllButton to="/projects">
                    <ViewAllButtonText>
                      <FormattedMessage {...messages.viewProjects} />
                    </ViewAllButtonText>
                    <ViewAllButtonIcon height="100%" viewBox="8.86 6.11 6.279 10.869">
                      <path d="M15.14 11.545L9.705 6.11l-.845.846 4.298 4.306.282.283-.282.283-4.298 4.307.845.844" />
                    </ViewAllButtonIcon>
                  </ViewAllButton>
                </SectionHeader>
                <SectionContainer>
                  {projectsList}
                </SectionContainer>
              </Section>
            </Content>
          </ContentContainer>

          <Footer>
            <FormattedMessage {...messages.poweredBy} />
          </Footer>
        </Container>

        <Modal
          opened={modalOpened}
          url={`${window.location.protocol}//${window.location.host}/ideas/${selectedIdeaId}`}
          close={this.closeModal}
        >
          <IdeasShow location={location} id={selectedIdeaId} />
        </Modal>
      </div>
    );
  }
}

LandingPage.propTypes = {
  projects: ImmutablePropTypes.list.isRequired,
  loadingProjects: PropTypes.bool,
  loadProjectsError: PropTypes.bool.isRequired,
  loadProjects: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  tFunc: PropTypes.func.isRequired,
  tenant: ImmutablePropTypes.map.isRequired,
};

const mapStateToProps = createStructuredSelector({
  pageState: selectLandingPage,
  projects: makeSelectProjects(),
  tenant: makeSelectCurrentTenantImm(),
});

const actions = { loadProjects };

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch);

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { pageState, projects, tenant } = stateProps;
  return {
    tenant,
    projects,
    loadingProjects: pageState.get('loadingProjects'),
    loadProjectsError: pageState.get('loadProjectsError'),
    ...dispatchProps,
    ...ownProps,
  };
};

export default injectTFunc(preprocess(mapStateToProps, mapDispatchToProps, mergeProps)(LandingPage));
