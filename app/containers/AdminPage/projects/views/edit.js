import React from 'react';
import PropTypes from 'prop-types';

// components
import Loader from 'components/loaders';
import Form from './form';

// store
import { preprocess } from 'utils';
import { updateProjectFork } from 'resources/projects/sagas';
import { loadProjectRequest } from 'resources/projects/actions';
import { LOAD_PROJECT_REQUEST } from 'resources/projects/constants';

// messages
import messages from './messages';

const Edit = ({ resourceLoader, slug }) => (
  <Loader
    resourceLoader={resourceLoader}
    loadingMessage={messages.projectLoadingMessage}
    errorMessage={messages.projectLoadingError}
    listenenTo={LOAD_PROJECT_REQUEST}
  >
    <Form slug={slug} saga={updateProjectFork} />
  </Loader>
);

Edit.propTypes = {
  slug: PropTypes.string.isRequired,
  resourceLoader: PropTypes.func.isRequired,
};

const mergeProps = (stateP, dispatchP, ownP) => {
  const { slug } = ownP.routeParams;
  const dispatchLoadProject = dispatchP.loadProjectRequest;
  const resourceLoader = () => dispatchLoadProject(slug);
  return { slug, resourceLoader };
};

export default preprocess(null, { loadProjectRequest }, mergeProps)(Edit);
