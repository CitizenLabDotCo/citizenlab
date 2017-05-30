import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import styled from 'styled-components';
import { lighten } from 'polished';
import WatchSagas from 'containers/WatchSagas';
import { preprocess } from 'utils';

import {
  selectLandingPage,
  makeSelectIdeas,
  makeSelectProjects,
} from './selectors';
import { loadIdeas, loadProjects } from './actions';
import sagas from './sagas';
import Idea from './components/idea';
import Project from './components/project';
import { media } from '../../utils/styleUtils';
import headerImage from '../../../assets/img/landingpage/header.png';
import logoImage from '../../../assets/img/landingpage/logo.png';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f4f4f4;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  positiob: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-left: 25px;
  padding-right: 25px;
  background-image: url(${headerImage});
  background-repeat: no-repeat;
  background-position: center top;
  background-size: cover;

  ${media.notPhone`
    height: 305px;
  `}

  ${media.phone`
    min-height: 305px;
  `}
`;

const Logo = styled.img`
  ${media.notPhone`
    width: 100px;
    position: absolute;
    top: 30px;
    left: 30px;
    cursor: pointer;
  `}

  ${media.phone`
    width: 100px;
    margin-top: 30px;
    margin-left: auto;
    margin-right: auto;
  `}
`;

const AddIdeaButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: #00a8e2;
  cursor: pointer;
  transition: all 200ms ease-out;

  ${media.notPhone`
    padding: 13px 22px;
    position: absolute;
    top: 30px;
    right: 30px;
  `}

  ${media.phone`
    width: 100%;
    height: 55px;
    margin-top: 35px;
    margin-bottom: 35px;
    margin-left: auto;
    margin-right: auto;
  `}

  &:hover {
    background: ${lighten(0.1, '#00a8e2')};
  }
`;

const AddIdeaButton = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AddIdeaButtonIcon = styled.svg`
  fill: #fff;

  ${media.notPhone`
    height: 32px;
    margin-top: -8px;
  `}

  ${media.phone`
    height: 38px;
    margin-top: -8px;
  `}
`;

const AddIdeaButtonText = styled.span`
  color: #fff;
  font-weight: 500;
  font-size: 19px;

  ${media.phone`
    font-size: 22px;
  `}
`;

const HeaderTitle = styled.h1`
  color: #fff;
  font-size: 46px;
  line-height: 50px;
  font-weight: 500;
  text-align: center;
  margin: 0;
  padding: 0;
  padding-top: 120px;
  display: flex;

  ${media.tablet`
    font-size: 40px;
    line-height: 48px;
    padding-top: 130px;
  `}

  ${media.phone`
    font-weight: 600;
    font-size: 34px;
    line-height: 38px;
    padding-top: 35px;
  `}

  ${media.smallPhone`
    font-weight: 600;
    font-size: 30px;
    line-height: 34px;
  `}
`;

const HeaderSubtitle = styled.h2`
  color: #fff;
  font-size: 32px;
  line-height: 36px;
  font-weight: 100;
  text-align: center;
  margin: 0;
  padding: 0;
  opacity: 0.8;

  ${media.tablet`
    font-size: 28px;
    line-height: 32px;
  `}

  ${media.notPhone`
    margin-top: 5px;
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

const TabBar = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding-left: 30px;
  padding-right: 30px;
  background: white;
  border-bottom: solid 1px #e0e0e0;

  ${media.phone`
    justify-content: center;
  `}
`;

const TabBarInner = styled.div`
  max-width: 1050px;
  display: flex;

  ${media.notPhone`
    width: 100%;
  `}
`;

const TabLine = styled.div`
  height: 4px;
  position: absolute;
  bottom: 0px;
  left: 0px;
  right: 0px;
  background: #00a8e2;
`;

const Tab = styled.div`
  font-size: 19px;
  font-weight: 500;
  color: ${(props) => props.active ? '#00a8e2' : '#444'};
  text-transform: uppercase;
  padding-top: 22px;
  padding-bottom: 22px;
  padding-left: 0px;
  padding-right: 0px;
  cursor: pointer;
  position: relative;
  margin-right: 50px;

  &:hover {
    color: #00a8e2;
  }

  & > ${TabLine} {
    opacity: ${(props) => props.active ? 1 : 0};
  }

  &:last-child {
    margin-right: 0px;
  }

  ${media.phone`
    font-size: 18px;
    margin-right: 40px;
    padding-top: 20px;
    padding-bottom: 20px;
  `}

  ${media.smallPhone`
    font-size: 16px;
    margin-right: 30px;
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
  max-width: 1050px;
  padding-bottom: 200px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-top: 80px;
  padding-bottom: 10px;
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
  color: #555;
  font-size: 34px;
  line-height: 38px;
  font-weight: 300;
  margin: 0;
  margin-right: 20px;
  /* border: solid 1px green; */

  ${media.phone`
    font-size: 32px;
    line-height: 36px;
  `}
`;

const ViewAllButton = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  cursor: pointer;
  /* border: solid 1px red; */

  &:hover {
    div {
      color: ${lighten(0.1, '#00a8e2')};
    }
  
    svg {
      fill: ${lighten(0.1, '#00a8e2')};
    }
  }

  ${media.phone`
    margin-top: 10px;
  `}
`;

const ViewAllButtonText = styled.div`
  color: #00a8e2;
  font-size: 18px;
  line-height: 16px;
  margin-right: 7px;
  /* border: solid 1px red; */
`;

const ViewAllButtonIcon = styled.svg`
  fill: #00a8e2;
  height: 12px;
  margin-top: 0px;
  /* border: solid 1px red; */
`;

const SectionContainer = styled.div`
  font-size: 20px;
  color: #999;
  margin-top: 10px;
  display: flex;

  ${media.tablet`
    flex-wrap: wrap;
  `}

  ${media.phone`
    flex-direction: column;
  `}
`;

class LandingPage extends React.Component {
  componentDidMount() {
    this.props.loadIdeas(1, 4);
    this.props.loadProjects(1, 2);
  }

  openIdea = (id) => () => {
    console.log(id);
  };

  openProject = (id) => () => {
    console.log(id);
  };

  render() {
    let ideasList = null;
    let projectsList = null;
    const { ideas, loadingIdeas, loadIdeasError, projects, loadingProjects, loadProjectsError } = this.props;

    if (loadingIdeas) {
      ideasList = <div>Loading...</div>;
    } else if (loadIdeasError) {
      ideasList = <div>An error occured</div>;
    } else if (ideas && ideas.size > 0) {
      ideasList = ideas.map((idea) => (
        <Idea key={idea.get('id')} idea={idea.get('attributes')} onClick={this.openIdea(idea.get('id'))}></Idea>
      ));
    }

    if (loadingProjects) {
      projectsList = <div>Loading...</div>;
    } else if (loadProjectsError) {
      projectsList = <div>An error occured</div>;
    } else if (projects && projects.size > 0) {
      projectsList = projects.map((project) => (
        <Project key={project.get('id')} project={project.get('attributes')} onClick={this.openProject(project.get('id'))}></Project>
      ));
    }

    return (
      <div>
        <WatchSagas sagas={sagas} />

        <Container>
          <Header>
            <Logo src={logoImage} styleName="logo" alt="logo" />
            <HeaderTitle>Co-create Oostende</HeaderTitle>
            <HeaderSubtitle>Share your ideas for Oostende and co-create your city</HeaderSubtitle>
            <AddIdeaButtonContainer>
              <AddIdeaButton>
                <AddIdeaButtonIcon height="100%" viewBox="0 0 24 24">
                  <path fill="none" d="M0 0h24v24H0V0z" /><path d="M6.57 21.64c0 .394.32.716.716.716h2.867c.394 0 .717-.322.717-.717v-.718h-4.3v.717zM8.72 8.02C5.95 8.02 3.7 10.273 3.7 13.04c0 1.704.853 3.202 2.15 4.112v1.62c0 .394.322.716.717.716h4.3c.393 0 .716-.322.716-.717v-1.618c1.298-.91 2.15-2.408 2.15-4.113 0-2.768-2.25-5.02-5.017-5.02zm2.04 7.957l-.608.43v1.648H7.286v-1.648l-.61-.43c-.967-.674-1.54-1.77-1.54-2.938 0-1.98 1.605-3.585 3.583-3.585s3.583 1.605 3.583 3.584c0 1.167-.574 2.263-1.542 2.937zM20.3 7.245h-3.61v3.61h-1.202v-3.61h-3.61V6.042h3.61v-3.61h1.202v3.61h3.61v1.203z" />
                </AddIdeaButtonIcon>
                <AddIdeaButtonText>
                  Add an idea
                </AddIdeaButtonText>
              </AddIdeaButton>
            </AddIdeaButtonContainer>
          </Header>

          <TabBar>
            <TabBarInner>
              <Tab first active>Overview<TabLine /></Tab>
              <Tab>Ideas<TabLine /></Tab>
              <Tab>Projects<TabLine /></Tab>
            </TabBarInner>
          </TabBar>

          <ContentContainer>
            <Content>
              <SectionHeader>
                <SectionTitle>Ideas for Oostende</SectionTitle>
                <ViewAllButton>
                  <ViewAllButtonText>View all ideas</ViewAllButtonText>
                  <ViewAllButtonIcon height="100%" viewBox="8.86 6.11 6.279 10.869">
                    <path d="M15.14 11.545L9.705 6.11l-.845.846 4.298 4.306.282.283-.282.283-4.298 4.307.845.844" />
                  </ViewAllButtonIcon>
                </ViewAllButton>
              </SectionHeader>
              <SectionContainer>
                {ideasList}
              </SectionContainer>

              <SectionHeader>
                <SectionTitle>Projects from Oostende</SectionTitle>
                <ViewAllButton>
                  <ViewAllButtonText>View all projects</ViewAllButtonText>
                  <ViewAllButtonIcon height="100%" viewBox="8.86 6.11 6.279 10.869">
                    <path d="M15.14 11.545L9.705 6.11l-.845.846 4.298 4.306.282.283-.282.283-4.298 4.307.845.844" />
                  </ViewAllButtonIcon>
                </ViewAllButton>
              </SectionHeader>
              <SectionContainer>
                {projectsList}
              </SectionContainer>
            </Content>
          </ContentContainer>
        </Container>
      </div>
    );
  }
}

LandingPage.propTypes = {
  ideas: ImmutablePropTypes.list.isRequired,
  loadingIdeas: PropTypes.bool,
  loadIdeasError: PropTypes.bool.isRequired,
  projects: ImmutablePropTypes.list.isRequired,
  loadingProjects: PropTypes.bool,
  loadProjectsError: PropTypes.bool.isRequired,
  loadIdeas: PropTypes.func.isRequired,
  loadProjects: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  pageState: selectLandingPage,
  ideas: makeSelectIdeas(),
  projects: makeSelectProjects(),
});

const actions = { loadIdeas, loadProjects };

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch);

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { pageState, ideas, projects } = stateProps;
  return {
    ideas,
    loadingIdeas: pageState.get('loadingIdeas'),
    loadIdeasError: pageState.get('loadIdeasError'),
    projects,
    loadingProjects: pageState.get('loadingProjects'),
    loadProjectsError: pageState.get('loadProjectsError'),
    ...dispatchProps,
    ...ownProps,
  };
};

export default preprocess(mapStateToProps, mapDispatchToProps, mergeProps)(LandingPage);
