import React from 'react';
import { Subscription } from 'rxjs';
import {
  IGeotaggedInitiativeData,
  initiativesMarkersStream,
} from 'services/initiatives';

interface InputProps {}

type children = (
  renderProps: GetInitiativeMarkersChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  initiativeMarkers: IGeotaggedInitiativeData[] | undefined | null;
}

export type GetInitiativeMarkersChildProps =
  | IGeotaggedInitiativeData[]
  | undefined
  | null;

export default class GetInitiativeMarkers extends React.Component<
  Props,
  State
> {
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      initiativeMarkers: undefined,
    };
  }

  componentDidMount() {
    this.subscriptions = [
      initiativesMarkersStream().observable.subscribe((initiativeMarkers) => {
        this.setState({
          initiativeMarkers: initiativeMarkers ? initiativeMarkers.data : null,
        });
      }),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { initiativeMarkers } = this.state;
    return (children as children)(initiativeMarkers);
  }
}
