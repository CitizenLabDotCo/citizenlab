import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import { observeIdeas } from 'services/ideas';

type Props = {
  name: string,
};

type State = {
  counter: number,
};

export default class TSComponent extends React.Component<Props, State> {
  constructor () {
    super();

    this.state = {
      counter: 0
    };
  }

  incrementCounter = () => {
    this.setState({ counter: this.state.counter + 1 });
  }

  render () {
    const { name } = this.props;
    const { counter } = this.state;

    return (
      <div>
        <h1>Hello {name}</h1>
        <p>Counter: {counter}</p>
        <button onClick={this.incrementCounter}>Increment</button>
      </div>
    );
  }
}
