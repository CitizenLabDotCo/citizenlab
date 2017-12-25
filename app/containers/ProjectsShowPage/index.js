import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

// components
import WatchSagas from 'containers/WatchSagas';
import T from 'components/T';
import { Link } from 'react-router';
import ImageHeader, { HeaderTitle, HeaderSubtitle } from 'components/ImageHeader';
import Meta from './meta';
import EventsPreview from './EventsPreview';

// store
import { preprocess } from 'utils';
import { loadProjectBySlugRequest } from 'resources/projects/actions';
import sagasWatchers from 'resources/projects/sagas';
import sagasWatchersPages from 'resources/projects/pages/sagas';
import { makeSelectResourceBySlug } from 'utils/resources/selectors';

// message
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { loadProjectPagesRequest } from 'resources/projects/pages/actions';
import { createStructuredSelector } from 'reselect';
import { makeSelectProjectPages } from './selectors';
import ImmutablePropTypes from 'react-immutable-proptypes';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
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
  max-width: ${(props) => props.theme.maxPageWidth}px;
  height: 100%;
`;

const ProjectMenuItem = styled(Link).attrs({ activeClassName: 'active' })`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #232F45;
  opacity: 0.5;
  font-size: 17px;
  font-weight: 500;
  border-bottom: 3px solid rgba(0,0,0,0); //Takes the space so the hover doesn't make the text "jump"
  margin: 0 1rem;
  padding: 0 1rem;

  &:first-child {
    margin-left: 0;
  }

  &.active, &:hover {
    color: #232F45;
    opacity: 1;
    border-bottom: 3px solid ${(props) => props.theme.colorMain};
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

  componentDidMount = () => {
    this.props.loadProjectBySlug(this.props.params.slug);
  }

  render() {
    const { params, pages, project } = this.props;
    const basePath = `/projects/${params.slug}`;
    return (
      <div>
        <WatchSagas sagas={sagasWatchers} />
        <WatchSagas sagas={sagasWatchersPages} />

        {project && <Meta projectId={project.get('id')} location={location} />}

        <Container>
          <ImageHeader image={project && project.getIn(['attributes', 'header_bg', 'large'])}>
            <HeaderTitle>
              <FormattedMessage {...messages.project} />
            </HeaderTitle>
            <HeaderSubtitle>
              {project && <T value={project.toJS().attributes.title_multiloc} />}
            </HeaderSubtitle>
          </ImageHeader>

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
          {project && React.cloneElement(this.props.children, { project })}


          {(this.props.location.pathname !== `${basePath}/events`) &&
            <EventsPreview eventsPageUrl={`${basePath}/events`} projectId={project && project.get('id')} />
          }
        </Container>

      </div>
    );
  }
}

ProjectsShowPage.propTypes = {
  children: PropTypes.any,
  loadProjectBySlug: PropTypes.func.isRequired,
  loadProjectPages: PropTypes.func.isRequired,
  params: PropTypes.object,
  pages: ImmutablePropTypes.list,
  project: PropTypes.object,
  location: PropTypes.string,
};

const mapStateToProps = () => createStructuredSelector({
  pages: makeSelectProjectPages(),
  project: makeSelectResourceBySlug('projects', (props) => props.params.slug),
});

export default preprocess(mapStateToProps, {
  loadProjectBySlug: loadProjectBySlugRequest,
  loadProjectPages: loadProjectPagesRequest,
})(ProjectsShowPage);
