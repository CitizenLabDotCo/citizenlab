import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { isString } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { IAdminFeedbackData, adminFeedbackForIdeaStream } from 'services/adminFeedback';

interface InputProps {
  ideaId: string | null | undefined;
}

type children = (renderProps: GetAdminFeedbackChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  adminFeedbackPosts: IAdminFeedbackData[] | undefined | null | Error;
  loadingMore: boolean;
}

export type GetAdminFeedbackChildProps = State & {
  onLoadMore: () => void;
};

export default class GetAdminFeedbackPosts extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      adminFeedbackPosts: undefined,
      loadingMore: false
    };
  }

  componentDidMount() {
    const { ideaId } = this.props;

    this.inputProps$ = new BehaviorSubject({ ideaId });

    this.subscriptions = [
      this.inputProps$.pipe(
        distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
        filter(({ ideaId }) => isString(ideaId)),
        switchMap(({ ideaId }: { ideaId: string }) => adminFeedbackForIdeaStream(ideaId).observable)
      )
      .subscribe((adminFeedbackPosts) => this.setState({ adminFeedbackPosts: !isNilOrError(adminFeedbackPosts) ? adminFeedbackPosts.data : adminFeedbackPosts }))
    ];
  }

  componentDidUpdate() {
    const { ideaId } = this.props;
    this.inputProps$.next({ ideaId });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  loadMore = () => {

  }

  render() {
    const { children } = this.props;
    return (children as children)({
      ...this.state,
      onLoadMore: this.loadMore,
    });
  }
}
