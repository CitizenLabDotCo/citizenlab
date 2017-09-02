import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import styled from 'styled-components';
import { preprocess } from 'utils';
import { lighten } from 'polished';
import { media } from 'utils/styleUtils';
import { makeSelectCurrentTenantImm } from 'utils/tenant/selectors';
import { injectTFunc } from 'utils/containers/t/utils';


import WatchSagas from 'containers/WatchSagas';
import Modal from 'components/UI/Modal';
import IdeasShow from 'containers/IdeasShow';
import { Link } from 'react-router';
import T from 'containers/T';
import ImageHeader, { HeaderTitle, HeaderSubtitle } from 'components/ImageHeader';
import ContentContainer from 'components/ContentContainer';
import IdeaCards from 'components/IdeaCards';
import ProjectCard from 'components/ProjectCard';
import { FormattedMessage } from 'react-intl';


import { loadProjects } from './actions';
import messages from './messages';
import sagas from './sagas';
import { selectLandingPage, makeSelectProjects } from './selectors';


const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
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
  font-weight: 500;
  margin: 0;
  margin-right: 20px;
  /* border: solid 1px green; */

  ${media.phone`
    font-size: 23px;
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

          <ImageHeader image={tenantHeaderBg}>
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
          </ImageHeader>

          <ContentContainer>
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

            {projectsList &&
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
            }
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
