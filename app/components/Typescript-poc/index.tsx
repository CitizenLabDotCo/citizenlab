// Libraries
import * as React from 'react';

// Define props for the component
type Props = {
  name: string,
}

// Define state for the component
type State = {
  counter: number,
}

export default class TSComponent extends React.Component<Props, State> {
  constructor () {
    super()

    this.state = {
      counter: 0,
    }
  }

  incrementCounter = (): void => {
    this.setState({counter: this.state.counter + 1})
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
    )
  }
}
