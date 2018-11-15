import React from 'react';
import { Subscription, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { IStreamParams, IStream } from 'utils/streams';
import { IUsersByBirthyear } from 'services/stats';

export type IGraphFormat = {
  name: string | number,
  value: number,
  code: string
}[] | null;

interface State {
  serie: IGraphFormat | null | undefined;
}

type children = (renderProps: {
  serie: IGraphFormat | null | undefined;
}) => JSX.Element | null;

type IResourceByX = IUsersByBirthyear;

interface QueryProps {
  startAt: string | undefined;
  endAt: string;
  currentGroupFilter: string | null;
}

interface Props extends QueryProps {
  stream: (streamParams?: IStreamParams | null) => IStream<IResourceByX>;
  convertToGraphFormat: (IResourceByX) => IGraphFormat;
}

export default class GetSerieFromStream extends React.PureComponent<Props, State> {
  private queryProps$: BehaviorSubject<QueryProps>;
  private subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      serie: undefined,
    };
  }

  componentDidMount() {
    const { startAt, endAt, currentGroupFilter, stream } = this.props;

    this.queryProps$ = new BehaviorSubject({ startAt, endAt, currentGroupFilter });

    this.subscriptions = [
      this.queryProps$.pipe(
        distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
        switchMap(({ startAt, endAt, currentGroupFilter }) => stream({ queryParameters: {
          start_at: startAt,
          end_at: endAt,
          group: currentGroupFilter
        }}).observable))
        .subscribe((serie) => {
          const convertedSerie = serie && this.props.convertToGraphFormat(serie);
          this.setState({ serie: convertedSerie });
        })
    ];
  }

  componentDidUpdate(prevProps: Props) {
    const { startAt, endAt, currentGroupFilter } = this.props;
    if (this.props.startAt !== prevProps.startAt
      || this.props.endAt !== prevProps.endAt
      || this.props.currentGroupFilter !== prevProps.currentGroupFilter) {
        this.queryProps$.next({ startAt, endAt, currentGroupFilter });
    }
  }

  componentWillUnmount() {
      this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    return (children as children)({
      ...this.state,
    });
  }
}
