import React, { Children, Component } from 'react';
import PropTypes from 'prop-types';

// top level component
export class Sagas extends Component<{ middleware: Function }> {
  static propTypes = {
    // as returned from redux-saga:createSagaMiddleware
    middleware: PropTypes.func.isRequired
  };
  static childContextTypes = {
    sagas: PropTypes.func.isRequired,
  };
  getChildContext() {
    return {
      sagas: this.props.middleware,
    };
  }
  render() {
    return Children.only(this.props.children);
  }
}

// <Saga saga={generator} {...props}/>
// simple!
export class Saga extends Component<{ saga: Function }> {
  runningSaga: any;

  static propTypes = {
    saga: PropTypes.func.isRequired // todo - test fpr generator
  };
  static contextTypes = {
    sagas: PropTypes.func.isRequired
  };

  componentDidMount() {
    if (!this.context.sagas) {
      throw new Error('did you forget to include <Sagas/>?');
    }
    this.runningSaga = this.context.sagas.run(this.props.saga, this.props);
  }

  render() {
    return !this.props.children ? null : Children.only(this.props.children);
  }

  componentWillUnmount() {
    if (this.runningSaga) {
      this.runningSaga.cancel();
      delete this.runningSaga;
    }
  }
}

// decorator version
export function saga(run) {
  return function (Target) {
    return class SagaDecorator extends Component {
      static displayName = 'saga:' + (Target.displayName || Target.name);
      render() {
        return (
        <Saga saga={run} {...this.props}>
          <Target {...this.props} />
        </Saga>
        );
      }
    };
  };
}

