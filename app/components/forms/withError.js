import React from 'react';
import { PropTypes } from 'prop-types';
import { Form } from 'semantic-ui-react';

import { appenDableName } from 'components/forms/inputs/utils';

const FormWithError = ({ onSubmit, error, action, children, messages }) => {
  const mKey = appenDableName(action.toLowerCase());
  const errorMessageObject = messages[mKey];
  return (
    <Form onSubmit={onSubmit} error={!!error} >
      <RenderError message={errorMessageObject} error={error} />
      {children}
    </Form>
  );
};

FormWithError.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  error: PropTypes.string,
  address: PropTypes.array,
  children: PropTypes.any,
};

export default FormWithError;
