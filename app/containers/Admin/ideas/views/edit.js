import React from 'react';
import PropTypes from 'prop-types';

// components
import Loader from 'components/loaders';
import Form from './form';

// store
import { preprocess } from 'utils';
import { updateIdeaFork } from 'resources/ideas/sagas';
import { loadIdeaRequest } from 'resources/ideas/actions';
import { LOAD_IDEA_REQUEST } from 'resources/ideas/constants';

// messages
import messages from './messages';

const Edit = ({ resourceLoader, slug }) => (
  <Loader
    resourceLoader={resourceLoader}
    loadingMessage={messages.ideaLoadingMessage}
    errorMessage={messages.ideaLoadingError}
    listenenTo={LOAD_IDEA_REQUEST}
  >
    <Form slug={slug} saga={updateIdeaFork} />
  </Loader>
);

Edit.propTypes = {
  slug: PropTypes.string.isRequired,
  resourceLoader: PropTypes.func.isRequired,
};

const mergeProps = (stateP, dispatchP, ownP) => {
  const { slug } = ownP.routeParams;
  const dispatchLoadIdea = dispatchP.loadIdeaRequest;
  const resourceLoader = () => dispatchLoadIdea(slug);
  return { slug, resourceLoader };
};

export default preprocess(null, { loadIdeaRequest }, mergeProps)(Edit);
