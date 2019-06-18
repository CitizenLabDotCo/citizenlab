import React from 'react';
import { get, isString } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap, filter, tap } from 'rxjs/operators';
import { IOfficialFeedbacks, officialFeedbacksForIdeaStream } from 'services/officialFeedback';

export interface InputProps {
  ideaId: string | null;
}

type children = (renderProps: GetOfficialFeedbacksChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

export type GetOfficialFeedbacksChildProps = State & {
  onLoadMore: () => void;
};

interface State {
  officialFeedbacksList: IOfficialFeedbacks | null | undefined | Error;
  hasMore: boolean;
  querying: boolean;
  loadingMore: boolean;
}

export default class GetOfficialFeedbacks extends React.Component<Props, State> {
  private initialState: State;
  private ideaId$: BehaviorSubject<string | null>;
  private pageSize$: BehaviorSubject<number>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    const initialState = {
      officialFeedbacksList: undefined,
      hasMore: false,
      querying: true,
      loadingMore: false
    };
    this.initialState = initialState;
    this.state = initialState;
    this.ideaId$ = new BehaviorSubject(props.ideaId);
    this.pageSize$ = new BehaviorSubject(1);
    this.subscriptions = [];
  }

  componentDidMount() {
    this.subscriptions = [
      this.ideaId$.pipe(
        distinctUntilChanged(),
        filter(ideaId => isString(ideaId)),
        tap(() => this.setState(this.initialState)),
        switchMap((ideaId: string) => {
          return this.pageSize$.pipe(
            distinctUntilChanged(),
            switchMap((pageSize) => {
              const isLoadingMore = (pageSize !== 1);
              const queryParameters = {
                'page[number]': 1,
                'page[size]': pageSize
              };

              this.setState({
                querying: !isLoadingMore,
                loadingMore: isLoadingMore,
              });

              return officialFeedbacksForIdeaStream(ideaId, { queryParameters }).observable;
            })
          );
        })
      ).subscribe((officialFeedbacksList) => {
        const selfLink = get(officialFeedbacksList, 'links.self');
        const lastLink = get(officialFeedbacksList, 'links.last');
        const hasMore = (isString(selfLink) && isString(lastLink) && selfLink !== lastLink);

        this.setState({
          hasMore,
          officialFeedbacksList: !isNilOrError(officialFeedbacksList) ? officialFeedbacksList : null,
          querying: false,
          loadingMore: false
        });
      })
    ];
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.ideaId !== prevProps.ideaId) {
      this.pageSize$.next(1);
      this.ideaId$.next(this.props.ideaId);
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  loadMore = () => {
    if (!this.state.loadingMore && this.state.hasMore) {
      const pageSize = this.pageSize$.getValue();
      this.pageSize$.next(pageSize + 1);
    }
  }

  render() {
    const { children } = this.props;
    return (children as children)({
      ...this.state,
      onLoadMore: this.loadMore
    });
  }
}
