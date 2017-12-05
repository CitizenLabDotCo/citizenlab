import * as React from 'react';
import generateErrorsObject from './generateErrorsObject';


interface Props {
  saga?: Function;
}

interface State {
  loading: boolean;
  errors: any;
  error: boolean;
  disabled?: boolean;
}

// Comoponents
class FormComponent<ExtraProps> extends React.Component<Props & ExtraProps, State> {
  values: any;
  saga?: Function;
  unmounted: boolean;

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      errors: {},
      error: false
    };
    this.values = {};
  }

  componentDidUpdate(prevProvs, prevState) {
    if (this.context.sagas && this.context.sagas) {
      const { run } = this.context.sagas;
      const saga = this.saga || this.props.saga;
      if (!prevState.loading && this.state.loading) {
        run(saga, this.values, this.defaulOnSuccess, this.defaulOnError);
      }
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
    const toNewState = { loading: false, error: true } as State;
    const errorsObje = {};
    // translate Errors to arrays snake case strings
    Object.keys(e).forEach((type) => {
      errorsObje[type] = e[type].map(
        (ele) => `${type}_error_${ele.error}`
      );
    });
    toNewState.errors = generateErrorsObject(e);

    this.setState(toNewState, () => {
      this.handleError();
    });
  }

  handleSuccess = () => {};
  handleError = () => {};

  defaultBeforeSubmit = () => {
    this.beforeSubmit();
  }

  beforeSubmit = () => {};

  defaultAfterSubmit = () => {
    this.afterSubmit();
  }

  afterSubmit = () => {};

  handleSubmit = (event) => {
    if (event && event.preventDefault) event.preventDefault();
    this.defaultBeforeSubmit();
    this.setState({ loading: true, errors: {}, error: false }, this.defaultAfterSubmit);
  }
}

export default FormComponent;
