import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

// components
import { Menu, Segment } from 'semantic-ui-react';
import Loader from 'components/loaders';
import WatchSagas from 'containers/WatchSagas';

// style
import { media } from 'utils/styleUtils';
import projectImage from 'assets/img/landingpage/project1.png';

// store
import { preprocess } from 'utils';
import { LOAD_PROJECT_REQUEST } from 'resources/projects/constants';
import { loadProjectRequest } from 'resources/projects/actions';
import sagasWatchers from 'resources/projects/sagas';
import sagasWatchersPages from 'resources/projects/pages/sagas';

// message
import messages from './messages';
import { injectIntl, intlShape } from 'react-intl';
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
  opacity: 0.65;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const HeaderBackground = styled.div`
  background-image: url(${projectImage});
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
    const { location, params, pages, tFunc } = this.props;
    const basePath = `/projects/${params.projectId}`;
    const activeItem = location.pathname;

    return (
      <div>
        <WatchSagas sagas={sagasWatchers} />
        <WatchSagas sagas={sagasWatchersPages} />

        <Container>
          <HeaderContainer>
            <HeaderBackground></HeaderBackground>
            <HeaderOverlay></HeaderOverlay>
          </HeaderContainer>

          <Segment inverted style={{ width: '100%', margin: 0, zIndex: 999 }}>
            <Menu inverted pointing secondary>
              <MenuItemStyled
                title={formatMessage(messages.navInfo)}
                key={0}
                to={`${basePath}`}
                active={location.pathname === '/admin/users'}
              />
              <MenuItemStyled
                title={formatMessage(messages.navIdeas)}
                key={1}
                to={`${basePath}/ideas`}
                active={activeItem === 'messages'}
              />
              <MenuItemStyled
                title={formatMessage(messages.navTimeline)}
                key={2}
                to={`${basePath}/timeline`}
                active={activeItem === 'messages'}
              />
              {pages && pages.toJS().map((page, index) => ((index < 2 ? <MenuItemStyled
                key={999 + index}
                title={tFunc(page.attributes.title_multiloc)}
                to={`${basePath}/page/${page.id}`}
                active={location.pathname === `${basePath}/page/${page.id}`}
              /> : <span style={{ display: 'none' }}></span>)))}

            </Menu>
          </Segment>
          <Loader
            resourceLoader={this.combinedLoader}
            loadingMessage={messages.LoadingMessage}
            errorMessage={messages.LoadingError}
            listenenTo={LOAD_PROJECT_REQUEST}
            withError={false}
          >
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
};

const mapStateToProps = () => createStructuredSelector({
  pages: makeSelectProjectPages(),
});

export default injectTFunc(injectIntl(preprocess(mapStateToProps, {
  loadProject: loadProjectRequest,
  loadProjectPages: loadProjectPagesRequest,
})(ProjectView)));
