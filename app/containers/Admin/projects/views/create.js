import React from 'react';
import PropTypes from 'prop-types';

// components
import Form from './form';

// store
import { createProjectFork } from 'resources/projects/sagas';


const Edit = ({ routeParams }) => <Form slug={routeParams.slug} saga={createProjectFork} />;

Edit.propTypes = {
  routeParams: PropTypes.object.isRequired,
};

export default Edit;
