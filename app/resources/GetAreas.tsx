import React from 'react';
import { Subscription } from 'rxjs';
import { IAreaData, areasStream } from 'services/areas';

interface InputProps {}

type children = (renderProps: GetAreasChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  areas: IAreaData[] | null;
}

export type GetAreasChildProps = IAreaData[] | null;

export default class GetAreas extends React.Component<Props, State> {
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      areas: null
    };
  }

  componentDidMount() {
    this.subscriptions = [
        areasStream().observable.subscribe(areas => this.setState({ areas: areas.data }))
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { areas } = this.state;
    return (children as children)(areas);
  }
}
