import React from 'react';
import { browserHistory } from 'react-router';
import { Location } from 'history';

interface Props {
  children: (renderProps: GetLocationChildProps) => JSX.Element | null ;
}

interface State {
  location: Location | null;
}

export type GetLocationChildProps = State;

export default class GetLocation extends React.PureComponent<Props, State> {
  unlisten: Function;

  constructor(props) {
    super(props);
    this.state = {
      location: null,
    };
  }

  componentDidMount() {
    this.unlisten = browserHistory.listen((location) => {
      this.setState({ location });
    });
  }

  componentWillUnmount() {
    this.unlisten();
  }

  render() {
    const { children } = this.props;
    const { location } = this.state;
    return children({ location });
  }
}
