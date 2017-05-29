/*
 *
 * ProjectsIndexPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import styled from 'styled-components';
import { preprocess } from 'utils/reactRedux';
import { bindActionCreators } from 'redux';
import WatchSagas from 'containers/WatchSagas';
import { Button, Label } from 'semantic-ui-react';
import { Link } from 'react-router';

import ImmutablePropTypes from 'react-immutable-proptypes';
import T from 'containers/T';

import sagas from './sagas';
import messages from './messages';
import { loadProjectsRequest, resetProjects } from './actions';
import selectProjectsIndexPage, { makeSelectProjects } from './selectors';
import projectsMap from './projectsMap';

export class ProjectsIndexPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    // provide context to bindings
    this.goToNextPage = this.goToNextPage.bind(this);
  }

  componentDidMount() {
    this.props.loadProjectsRequest(true);
  }

  componentWillUnmount() {
    // reset projects upon page leaving, to avoid double items when going back
    this.props.resetProjects();
  }

  goToNextPage() {
    const { nextPageNumber, nextPageItemCount } = this.props;

    this.props.loadMoreProjects(nextPageNumber, nextPageItemCount);
  }

  render() {
    const { className, loading, loadError, nextPageNumber, projectsImm } = this.props;
    return (
      <div className={className}>
        <Helmet
          title="Project listing"
          meta={[
            { name: 'description', content: 'Project listing' },
          ]}
        />
        <WatchSagas sagas={sagas} />

        <h1>
          <FormattedMessage {...messages.header} />
        </h1>
        {loading && <FormattedMessage {...messages.loading} />}
        {loadError && <Label>{loadError}</Label>}

        {projectsMap(projectsImm).map((project) => (<div key={project.id}>
          <Link to={`/projects/${project.id}`}>
            <T value={project.attributes.title_multiloc} />
            {project.id}
          </Link>
        </div>))}

        {nextPageNumber && <Button onClick={this.goToNextPage}>
          <FormattedMessage {...messages.loadMore} />
        </Button>}
      </div>
    );
  }
}

ProjectsIndexPage.propTypes = {
  className: PropTypes.string,
  // mapDispatch
  loadProjectsRequest: PropTypes.func.isRequired,
  loadMoreProjects: PropTypes.func.isRequired,
  resetProjects: PropTypes.func.isRequired,
  nextPageNumber: PropTypes.number,
  nextPageItemCount: PropTypes.number,
  loading: PropTypes.bool.isRequired,
  loadError: PropTypes.bool,
  projectsImm: ImmutablePropTypes.list.isRequired,
};

const mapStateToProps = createStructuredSelector({
  pageState: selectProjectsIndexPage,
  projectsImm: makeSelectProjects(),
});

const customActionCreators = {
  loadMoreProjects(nextPageNumber, nextPageItemCount) {
    return loadProjectsRequest(false, nextPageNumber, nextPageItemCount);
  },
};

export const mapDispatchToProps = (dispatch) => bindActionCreators({
  /*
   * auto-binding
   */
  loadProjectsRequest,
  resetProjects,
  /*
   * manual bindings
   * (return actions to dispatch - with custom logic)
   */
  ...customActionCreators,
}, dispatch);

const mergeProps = ({ pageState, projectsImm }, dispatchProps) => ({
  loading: pageState.get('loading'),
  loadError: pageState.get('loadError'),
  nextPageNumber: pageState.get('nextPageNumber'),
  nextPageItemCount: pageState.get('nextPageItemCount'),
  projectsImm,
  ...dispatchProps,
});

// preprocess to avoid unnecessary re-renders when using mapDispatchToProps
export default styled(preprocess(mapStateToProps, mapDispatchToProps, mergeProps)(ProjectsIndexPage))`
  // none yet
`;
