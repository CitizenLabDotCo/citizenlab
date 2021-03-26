import React from 'react';
import { BehaviorSubject, Subscription, of } from 'rxjs';
import { distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { IIdeaStatusData, ideaStatusStream } from 'services/ideaStatuses';
import { isString } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  id: string | null;
}

type children = (renderProps: GetIdeaStatusChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  ideaStatus: IIdeaStatusData | undefined | null;
}

export type GetIdeaStatusChildProps = IIdeaStatusData | undefined | null;

export default class GetIdeaStatus extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      ideaStatus: undefined,
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
          switchMap(({ id }: { id: string }) => {
            if (isString(id)) {
              return ideaStatusStream(id).observable;
            }

            return of(null);
          })
        )
        .subscribe((ideaStatus) =>
          this.setState({
            ideaStatus: !isNilOrError(ideaStatus) ? ideaStatus.data : null,
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
    const { ideaStatus } = this.state;
    return (children as children)(ideaStatus);
  }
}
