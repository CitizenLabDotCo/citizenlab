import React from 'react';
import PropTypes from 'prop-types';

// components
import Form from './form';

// store
import { createPageFork } from 'resources/pages/sagas';

const Edit = ({ routeParams }) => <Form slug={routeParams.slug} saga={createPageFork} />;

Edit.propTypes = {
  routeParams: PropTypes.object.isRequired,
};

export default Edit;
