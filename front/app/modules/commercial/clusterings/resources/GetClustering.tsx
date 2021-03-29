import { Component } from 'react';
import { isString } from 'lodash-es';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { IClusteringData, clusteringByIdStream } from '../services/clusterings';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  id: string;
}

type children = (renderProps: GetClusteringChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  clustering: IClusteringData | undefined | null | Error;
}

export type GetClusteringChildProps =
  | IClusteringData
  | undefined
  | null
  | Error;

export default class GetClustering extends Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      clustering: undefined,
    };
  }

  componentDidMount() {
    const { id } = this.props;

    this.inputProps$ = new BehaviorSubject({ id });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          filter(({ id }) => isString(id)),
          switchMap(({ id }) => clusteringByIdStream(id).observable)
        )
        .subscribe((clustering) =>
          this.setState({
            clustering: !isNilOrError(clustering)
              ? clustering.data
              : clustering,
          })
        ),
    ];
  }

  componentDidUpdate() {
    const { id } = this.props;
    this.inputProps$.next({ id });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { clustering } = this.state;
    return (children as children)(clustering);
  }
}
