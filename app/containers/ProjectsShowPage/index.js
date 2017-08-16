import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

// components
import Loader from 'components/loaders';
import WatchSagas from 'containers/WatchSagas';
import T from 'containers/T';
import { Link } from 'react-router';

// style
import { media } from 'utils/styleUtils';
// import projectImage from 'assets/img/landingpage/project1.png';

// store
import { preprocess } from 'utils';
import { LOAD_PROJECT_REQUEST } from 'resources/projects/constants';
import { loadProjectRequest } from 'resources/projects/actions';
import sagasWatchers from 'resources/projects/sagas';
import sagasWatchersPages from 'resources/projects/pages/sagas';

// message
import messages from './messages';
import { FormattedMessage } from 'react-intl';
import { loadProjectPagesRequest } from 'resources/projects/pages/actions';
import { createStructuredSelector } from 'reselect';
import { makeSelectProjectPages } from './selectors';
import ImmutablePropTypes from 'react-immutable-proptypes';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f2f2f2;
`;

const HeaderContainer = styled.div`
  width: 100%;
  height: 305px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-left: 25px;
  padding-right: 25px;
  position: relative;
  z-index: 1;
  margin-top: -70px;

  ${media.notPhone`
    height: 305px;
  `}

  ${media.phone`
    min-height: 305px;
  `}
`;

const HeaderOverlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const HeaderBackground = styled.div`
  opacity: 0.65;
  filter: blur(1px);
  background-image: url(${(props) => props.projectCover});
  background-repeat: no-repeat;
  background-size: cover;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;


const Footer = styled.div`
  color: #333;
  font-weight: 400;
  font-size: 17px;
  text-align: center;
  display: inline-block;
  padding-left: 30px;
  padding-right: 30px;
  margin-top: 60px;
  margin-bottom: 50px;
  margin-left: auto;
  margin-right: auto;
`;

const ProjectHeaderStyled = styled.div`
  font-size: 25px;
  text-align: center;
  color: #ffffff;
  width: 100%;
  display: block;
  margin-top: 150px;
`;

const ProjectTitleStyled = styled.div`
  position: absolute;
  font-size: 45px;
  text-align: center;
  color: #ffffff;
  width: 100%;
  display: block;
  margin-top: 30px;
`;


const ProjectMenu = styled.div`
  background-color: #FFFFFF;
  border-bottom: 1px solid #EAEAEA;
  width: 100%;
  height: 55px;
`;

const ProjectMenuItems = styled.div`
  display: flex;
  overflow-x: auto;
  margin: 0 auto;
  max-width: 980px;
  height: 100%;
`;

const ProjectMenuItem = styled(Link).attrs({ activeClassName: 'active' })`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #232F45;
  opacity: 0.5;
  font-size: 16px;
  border-bottom: 1px solid rgba(0,0,0,0); //Takes the space so the hover doesn't make the text "jump"
  margin: 0 1rem;
  padding: 0 1rem;

  &:first-child {
    margin-left: 0;
  }

  &.active, &:hover {
    color: #232F45;
    opacity: 1;
    border-bottom: 1px solid ${(props) => props.theme.colorMain};
  }
`;

class ProjectsShowPage extends React.Component {
  constructor() {
    super();

    this.state = {
      modalOpened: false,
      pageUrl: null,
      modalUrl: null,
      selectedIdeaId: null,
    };
  }

  combinedLoader = () => {
    const { loadProject, loadProjectPages, params } = this.props;
    const projectId = params.projectId;

    loadProject(projectId);
    loadProjectPages(projectId);
  }

  render() {
    const { params, pages, project } = this.props;
    const basePath = `/projects/${params.projectId}`;

    return (
      <div>
        <WatchSagas sagas={sagasWatchers} />
        <WatchSagas sagas={sagasWatchersPages} />

        <Container>
          <HeaderContainer>
            <HeaderBackground
              projectCover={project && project.getIn(['attributes', 'header_bg', 'large'])}
            />
            <HeaderOverlay>
              <ProjectHeaderStyled>
                <FormattedMessage {...messages.project} />
              </ProjectHeaderStyled>
              <ProjectTitleStyled>
                {project && <T value={project.toJS().attributes.title_multiloc} />}
              </ProjectTitleStyled>
            </HeaderOverlay>
          </HeaderContainer>

          <ProjectMenu>
            <ProjectMenuItems>
              <ProjectMenuItem to={basePath} onlyActiveOnIndex>
                <FormattedMessage {...messages.navInfo} />
              </ProjectMenuItem>
              <ProjectMenuItem to={`${basePath}/ideas`}>
                <FormattedMessage {...messages.navIdeas} />
              </ProjectMenuItem>
              <ProjectMenuItem to={`${basePath}/timeline`}>
                <FormattedMessage {...messages.navTimeline} />
              </ProjectMenuItem>
              <ProjectMenuItem to={`${basePath}/events`}>
                <FormattedMessage {...messages.navEvents} />
              </ProjectMenuItem>
              {pages && pages.map((page) =>
                <ProjectMenuItem to={`${basePath}/page/${page.slug}`}>
                  <T>page.attributes.title_multiloc</T>
                </ProjectMenuItem>
              )}
            </ProjectMenuItems>
          </ProjectMenu>
          <Loader
            resourceLoader={this.combinedLoader}
            loadingMessage={messages.LoadingMessage}
            errorMessage={messages.LoadingError}
            listenenTo={LOAD_PROJECT_REQUEST}
            withError={false}
          >
            {/* FROM REACT ROUTER */}
            {this.props.children}
          </Loader>
          <Footer>
          </Footer>
        </Container>

      </div>
    );
  }
}

ProjectsShowPage.propTypes = {
  children: PropTypes.any,
  loadProject: PropTypes.func.isRequired,
  loadProjectPages: PropTypes.func.isRequired,
  params: PropTypes.object,
  pages: ImmutablePropTypes.list,
  project: PropTypes.object,
};

const mapStateToProps = () => createStructuredSelector({
  pages: makeSelectProjectPages(),
  project: (state, { params }) => state.getIn(['resources', 'projects', params.projectId]),
});

export default preprocess(mapStateToProps, {
  loadProject: loadProjectRequest,
  loadProjectPages: loadProjectPagesRequest,
})(ProjectsShowPage);
