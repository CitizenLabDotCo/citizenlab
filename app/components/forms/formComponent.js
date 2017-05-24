import React from 'react';
import { PropTypes } from 'prop-types';
import generateErrorsObject from './generateErrorsObject';

// Comoponents

class FormComponent extends React.Component {
  constructor() {
    super();
    this.state = { errors: {} };
  }

  componentDidUpdate(prevProvs, prevState) {
    const { run } = this.context.sagas;
    if (!prevState.loading && this.state.loading) {
      run(this.saga, this.values, this.handleSuccess, this.handleErrors);
    }
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.setState({ loading: true, errors: {}, error: false });
  }

  handleErrors = (e = {}) => {
    const toNewState = { loading: false, error: true };
    const errorsObje = {};
    // translate Errors to arrays snake case strings
    Object.keys(e).forEach((type) => {
      errorsObje[type] = e[type].map(
        (ele) => `${type}_error_${ele.error}`
      );
    });
    toNewState.errors = generateErrorsObject(e);

    return this.setState(toNewState);
  }
}

FormComponent.contextTypes = {
  sagas: PropTypes.func.isRequired,
};

export default FormComponent;
