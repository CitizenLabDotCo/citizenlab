import React from 'react';
import { Subscription } from 'rxjs';
import { IAreaData, areasStream } from 'services/areas';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {}

type children = (renderProps: GetAreasChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  areas: IAreaData[] | undefined | null | Error;
}

export type GetAreasChildProps = IAreaData[] | undefined | null | Error;

export default class GetAreas extends React.Component<Props, State> {
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      areas: undefined
    };
  }

  componentDidMount() {
    this.subscriptions = [
      areasStream().observable.subscribe(areas => this.setState({ areas: !isNilOrError(areas) ? areas.data : areas }))
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
