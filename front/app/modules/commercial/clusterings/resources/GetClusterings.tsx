import { Component } from 'react';
import { Subscription } from 'rxjs';
import { IClusteringData, clusteringsStream } from '../services/clusterings';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {}

type children = (renderProps: GetClusteringsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  clusterings: IClusteringData[] | undefined | null | Error;
}

export type GetClusteringsChildProps =
  | IClusteringData[]
  | undefined
  | null
  | Error;

export default class GetAreas extends Component<Props, State> {
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      clusterings: undefined,
    };
  }

  componentDidMount() {
    this.subscriptions = [
      clusteringsStream().observable.subscribe((clusterings) =>
        this.setState({
          clusterings: !isNilOrError(clusterings)
            ? clusterings.data
            : clusterings,
        })
      ),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { clusterings } = this.state;
    return (children as children)(clusterings);
  }
}
