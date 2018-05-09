import React from 'react';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { ideaActivities, IdeaActivity } from 'services/ideas';

interface InputProps {
  ideaId: string | null;
}

type children = (renderProps: GetIdeaActivitiesChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  ideaActivities: IdeaActivity[] | undefined | null;
}

export type GetIdeaActivitiesChildProps = IdeaActivity[] | undefined | null;

export default class GetIdeaActivities extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      ideaActivities: undefined
    };
  }

  componentDidMount() {
    const { ideaId } = this.props;

    this.inputProps$ = new BehaviorSubject({ ideaId });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => shallowCompare(prev, next))
        .switchMap(({ ideaId }) => ideaId ? ideaActivities(ideaId).observable : Observable.of(null))
        .subscribe((ideaActivities) => this.setState({ ideaActivities: (ideaActivities ? ideaActivities.data : null) }))
    ];
  }

  componentDidUpdate() {
    const { ideaId } = this.props;
    this.inputProps$.next({ ideaId });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { ideaActivities } = this.state;
    return (children as children)(ideaActivities);
  }
}
