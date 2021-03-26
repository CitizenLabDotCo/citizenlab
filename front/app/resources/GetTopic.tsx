import React from 'react';
import { isString } from 'lodash-es';
import { Subscription, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { ITopicData, topicByIdStream } from 'services/topics';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  id: string;
}

type children = (renderProps: GetTopicChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  topic: ITopicData | undefined | null | Error;
}

export type GetTopicChildProps = ITopicData | undefined | null | Error;

export default class GetTopic extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      topic: undefined,
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
          switchMap(({ id }) => topicByIdStream(id).observable)
        )
        .subscribe((topic) =>
          this.setState({ topic: !isNilOrError(topic) ? topic.data : topic })
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
    const { topic } = this.state;
    return (children as children)(topic);
  }
}
