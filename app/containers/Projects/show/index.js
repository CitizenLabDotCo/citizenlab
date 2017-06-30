import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

// components
import { Menu, Segment } from 'semantic-ui-react';
import Loader from 'components/loaders';
import WatchSagas from 'containers/WatchSagas';
import T from 'containers/T';

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
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { loadProjectPagesRequest } from 'resources/projects/pages/actions';
import { createStructuredSelector } from 'reselect';
import { makeSelectProjectPages } from './selectors';
import { injectTFunc } from 'containers/T/utils';
import ImmutablePropTypes from 'react-immutable-proptypes';
import MenuItemStyled from './MenuItemStyled';

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
  background-position: center top;
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

const MenuStyled = styled(Menu)`
  margin-bottom: 10px;
  border-bottom: none !important;
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

class ProjectView extends React.Component {
  constructor() {
    super();

    this.state = {
      modalOpened: false,
      pageUrl: null,
      modalUrl: null,
      selectedIdeaId: null,
    };

    // provide context to bindings
    this.combinedLoader = this.combinedLoader.bind(this);
  }

  combinedLoader() {
    const { loadProject, loadProjectPages, params } = this.props;
    const projectId = params.projectId;

    loadProject(projectId);
    loadProjectPages(projectId);
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { location, params, pages, tFunc, project } = this.props;
    const basePath = `/projects/${params.projectId}`;

    return (
      <div>
        <WatchSagas sagas={sagasWatchers} />
        <WatchSagas sagas={sagasWatchersPages} />

        <Container>
          <HeaderContainer>
            <HeaderBackground
              projectCover={project && project.toJS().attributes.project_cover_image}
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

          <Segment
            style={{
              width: '100%',
              margin: '0 0 15px',
              zIndex: 999,
              border: 0,
              padding: 0,
            }}
          >
            <MenuStyled
              pointing
              secondary
              style={{
                borderBottom: 'none !important',
              }}
            >
              <MenuItemStyled
                title={formatMessage(messages.navInfo)}
                key={0}
                to={`${basePath}`}
                active={location.pathname === `${basePath}`}
              />
              <MenuItemStyled
                title={formatMessage(messages.navIdeas)}
                key={1}
                to={`${basePath}/ideas`}
                active={location.pathname === `${basePath}/ideas`}
              />
              <MenuItemStyled
                title={formatMessage(messages.navTimeline)}
                key={2}
                to={`${basePath}/timeline`}
                active={location.pathname === `${basePath}/timeline`}
              />
              <MenuItemStyled
                title={formatMessage(messages.navEvents)}
                key={3}
                to={`${basePath}/events`}
                active={activeItem === 'messages'}
              />
            </Menu>
              {pages && pages.toJS().map((page, index) => ((index < 2 ? <MenuItemStyled
                key={999 + page.id}
                title={tFunc(page.attributes.title_multiloc)}
                to={`${basePath}/page/${page.id}`}
                isProject
                active={location.pathname === `${basePath}/page/${page.id}`}
              /> : <span
                style={{ display: 'none' }}
                key={999 + page.id}
              />)))}

            </MenuStyled>
          </Segment>
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

ProjectView.propTypes = {
  children: PropTypes.any,
  loadProject: PropTypes.func.isRequired,
  loadProjectPages: PropTypes.func.isRequired,
  params: PropTypes.object,
  location: PropTypes.object,
  intl: intlShape,
  pages: ImmutablePropTypes.list,
  tFunc: PropTypes.func.isRequired,
  project: PropTypes.object,
};

const mapStateToProps = () => createStructuredSelector({
  pages: makeSelectProjectPages(),
  project: (state, { params }) => state.getIn(['resources', 'projects', params.projectId]),
});

export default injectTFunc(injectIntl(preprocess(mapStateToProps, {
  loadProject: loadProjectRequest,
  loadProjectPages: loadProjectPagesRequest,
})(ProjectView)));
