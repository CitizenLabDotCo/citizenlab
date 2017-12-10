import React from 'react';
import { PropTypes } from 'prop-types';
import generateErrorsObject from './generateErrorsObject';

// Comoponents

class FormComponent extends React.Component {
  constructor() {
    super();
    this.state = { errors: {} };
    this.values = {};
  }

  componentDidUpdate(prevProvs, prevState) {
    const { run } = this.context.sagas;
    const saga = this.saga || this.props.saga;
    if (!prevState.loading && this.state.loading) {
      run(saga, this.values, this.defaulOnSuccess, this.defaulOnError);
    }
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  handleChange = (name, value) => {
    this.values[name] = value;
  }

  defaulOnSuccess = (...args) => {
    if (this.unmounted) return;

    this.setState({ loading: false }, () => {
      this.handleSuccess(...args);
    });
  }

  defaulOnError = (e = {}) => {
    if (this.unmounted) return;
    const toNewState = { loading: false, error: true };
    const errorsObje = {};
    // translate Errors to arrays snake case strings
    Object.keys(e).forEach((type) => {
      errorsObje[type] = e[type].map(
        (ele) => `${type}_error_${ele.error}`
      );
    });
    toNewState.errors = generateErrorsObject(e);

    this.setState(toNewState, () => {
      this.handleError(e);
    });
  }

  handleSuccess = () => { }
  handleError = () => { }

  defaultBeforeSubmit = () => {
    this.beforeSubmit();
  }

  beforeSubmit = () => { }

  defaultAfterSubmit = () => {
    this.afterSubmit();
  }

  afterSubmit = () => { }

  handleSubmit = (event) => {
    if (event && event.preventDefault) event.preventDefault();
    this.defaultBeforeSubmit();
    this.setState({ loading: true, errors: {}, error: false }, this.defaultAfterSubmit);
  }
}

FormComponent.contextTypes = {
  sagas: PropTypes.func.isRequired,
};

FormComponent.propTypes = {
  saga: PropTypes.func.isRequired,
};

export default FormComponent;
