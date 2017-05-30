import React from 'react';
import PropTypes from 'prop-types';

// components
import Loader from 'components/loaders';
import Form from './form';

// store
import { preprocess } from 'utils';
import { updateAreaFork } from 'resources/areas/sagas';
import { loadAreaRequest } from 'resources/areas/actions';
import { LOAD_AREA_REQUEST } from 'resources/areas/constants';

// messages
import messages from './messages';

const Edit = ({ resourceLoader, slug }) => (
  <Loader
    resourceLoader={resourceLoader}
    loadingMessage={messages.areaLoadingMessage}
    errorMessage={messages.areaLoadingError}
    listenenTo={LOAD_AREA_REQUEST}
  >
    <Form slug={slug} saga={updateAreaFork} />
  </Loader>
);

Edit.propTypes = {
  slug: PropTypes.string.isRequired,
  resourceLoader: PropTypes.func.isRequired,
};

const mergeProps = (stateP, dispatchP, ownP) => {
  const { slug } = ownP.routeParams;
  const dispatchLoadArea = dispatchP.loadAreaRequest;
  const resourceLoader = () => dispatchLoadArea(slug);
  return { slug, resourceLoader };
};

export default preprocess(null, { loadAreaRequest }, mergeProps)(Edit);
