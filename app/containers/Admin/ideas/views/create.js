import React from 'react';
import PropTypes from 'prop-types';

// components
import Form from './form';

// store
import { createIdeaFork } from 'resources/ideas/sagas';

const Edit = ({ routeParams }) => <Form slug={routeParams.slug} saga={createIdeaFork} />;

Edit.propTypes = {
  routeParams: PropTypes.object.isRequired,
};

export default Edit;
