import React from 'react';
import { Subscription, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { IStreamParams, IStream } from 'utils/streams';
import {
  IUsersByBirthyear,
  IIdeasByTopic,
  ICommentsByTopic,
  IVotesByTopic,
  IIdeasByProject,
  ICommentsByProject,
  IVotesByProject
} from 'services/stats';

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

type IResourceByX = IUsersByBirthyear | IIdeasByTopic | ICommentsByTopic | IVotesByTopic | IIdeasByProject | IVotesByProject | ICommentsByProject;

interface QueryProps {
  startAt: string | undefined | null;
  endAt: string | null;
  currentGroupFilter?: string | null;
  currentProjectFilter?: string | null;
  stream: (streamParams?: IStreamParams | null) => IStream<IResourceByX>;
}

interface Props extends QueryProps {
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
    const { startAt, endAt, currentGroupFilter, currentProjectFilter, stream, convertToGraphFormat } = this.props;

    this.queryProps$ = new BehaviorSubject({ startAt, endAt, currentGroupFilter, currentProjectFilter, stream });

    this.subscriptions = [
      this.queryProps$.pipe(
        distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
        switchMap(({ startAt, endAt, currentGroupFilter, currentProjectFilter, stream }) => stream({
          queryParameters: {
            start_at: startAt,
            end_at: endAt,
            group: currentGroupFilter,
            project: currentProjectFilter
          }
        }).observable))
        .subscribe((serie) => {
          const convertedSerie = serie && convertToGraphFormat(serie);
          this.setState({ serie: convertedSerie });
        })
    ];
  }

  componentDidUpdate(prevProps: QueryProps) {
    const { startAt, endAt, currentGroupFilter, currentProjectFilter, stream } = this.props;
    if (this.props.startAt !== prevProps.startAt
      || this.props.endAt !== prevProps.endAt
      || this.props.stream !== prevProps.stream
      || this.props.currentGroupFilter !== prevProps.currentGroupFilter
      || this.props.currentProjectFilter !== prevProps.currentProjectFilter) {
      this.queryProps$.next({ startAt, endAt, currentGroupFilter, currentProjectFilter, stream });
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
