import React from 'react';
import PropTypes from 'prop-types';

// components
import Loader from 'components/loaders';
import Form from './form';

// store
import { preprocess } from 'utils';
import { updatePageFork } from 'resources/pages/sagas';
import { loadPageRequest } from 'resources/pages/actions';
import { LOAD_PAGE_REQUEST } from 'resources/pages/constants';

// messages
import messages from './messages';

const Edit = ({ resourceLoader, slug }) => (
  <Loader
    resourceLoader={resourceLoader}
    loadingMessage={messages.pageLoadingMessage}
    errorMessage={messages.pageLoadingError}
    listenenTo={LOAD_PAGE_REQUEST}
  >
    <Form slug={slug} saga={updatePageFork} />
  </Loader>
);

Edit.propTypes = {
  slug: PropTypes.string.isRequired,
  resourceLoader: PropTypes.func.isRequired,
};

const mergeProps = (stateP, dispatchP, ownP) => {
  const { slug } = ownP.routeParams;
  const dispatchLoadPage = dispatchP.loadPageRequest;
  const resourceLoader = () => dispatchLoadPage(slug);
  return { slug, resourceLoader };
};

export default preprocess(null, { loadPageRequest }, mergeProps)(Edit);
