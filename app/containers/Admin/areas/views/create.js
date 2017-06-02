import React from 'react';
import PropTypes from 'prop-types';

// components
import Form from './form';

// store
import { createAreaFork } from 'resources/areas/sagas';

const Edit = ({ routeParams }) => <Form slug={routeParams.slug} saga={createAreaFork} />;

Edit.propTypes = {
  routeParams: PropTypes.object.isRequired,
};

export default Edit;
