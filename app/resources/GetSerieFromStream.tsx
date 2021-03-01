// libraries
import { PureComponent } from 'react';
import { Subscription, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';

// utils
import shallowCompare from 'utils/shallowCompare';

// typings
import { IStreamParams, IStream } from 'utils/streams';
import {
  IUsersByBirthyear,
  IIdeasByTopic,
  ICommentsByTopic,
  IVotesByTopic,
  IIdeasByStatus,
  IIdeasByProject,
  ICommentsByProject,
  IVotesByProject,
} from 'services/stats';
import { IGraphFormat, IParticipationByTopic } from 'typings';
import { isNilOrError } from 'utils/helperUtils';

interface State {
  serie: IGraphFormat | IParticipationByTopic | null | undefined;
}

type children = (renderProps: {
  serie: IGraphFormat | IParticipationByTopic | null | undefined;
}) => JSX.Element | null;

export type ISupportedDataType =
  | IUsersByBirthyear
  | IIdeasByTopic
  | ICommentsByTopic
  | IVotesByTopic
  | IIdeasByProject
  | IIdeasByStatus
  | IVotesByProject
  | ICommentsByProject;

interface QueryProps {
  startAt?: string | undefined | null;
  endAt: string | null;
  currentGroupFilter?: string | null;
  currentProjectFilter?: string | null;
  currentTopicFilter?: string | null;
  stream: (
    streamParams?: IStreamParams | null,
    customId?: string
  ) => IStream<ISupportedDataType>;
  customId?: string;
}

interface Props extends QueryProps {
  convertToGraphFormat: (
    data: ISupportedDataType
  ) => IGraphFormat | IParticipationByTopic | null;
}

export default class GetSerieFromStream extends PureComponent<Props, State> {
  private queryProps$: BehaviorSubject<QueryProps>;
  private subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      serie: undefined,
    };
  }

  componentDidMount() {
    const {
      startAt,
      endAt,
      currentGroupFilter,
      currentProjectFilter,
      currentTopicFilter,
      stream,
      convertToGraphFormat,
      customId,
    } = this.props;

    this.queryProps$ = new BehaviorSubject({
      startAt,
      endAt,
      currentGroupFilter,
      currentProjectFilter,
      currentTopicFilter,
      stream,
    });

    this.subscriptions = [
      this.queryProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          switchMap(
            ({
              startAt,
              endAt,
              currentGroupFilter,
              currentProjectFilter,
              currentTopicFilter,
              stream,
            }) =>
              stream(
                {
                  queryParameters: {
                    start_at: startAt,
                    end_at: endAt,
                    group: currentGroupFilter,
                    project: currentProjectFilter,
                    topic: currentTopicFilter,
                  },
                },
                customId
              ).observable
          )
        )
        .subscribe((serie) => {
          const convertedSerie = !isNilOrError(serie)
            ? convertToGraphFormat(serie)
            : null;
          this.setState({ serie: convertedSerie });
        }),
    ];
  }

  componentDidUpdate() {
    const {
      startAt,
      endAt,
      currentGroupFilter,
      currentProjectFilter,
      currentTopicFilter,
      stream,
    } = this.props;
    this.queryProps$.next({
      startAt,
      endAt,
      currentGroupFilter,
      currentTopicFilter,
      currentProjectFilter,
      stream,
    });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    return (children as children)({
      ...this.state,
    });
  }
}
