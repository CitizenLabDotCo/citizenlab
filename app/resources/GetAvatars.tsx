import React from 'react';
import { isEqual } from 'lodash-es';
import { Subscription, BehaviorSubject } from 'rxjs';
import { IAvatars, avatarsStream } from 'services/avatars';
import { isNilOrError } from 'utils/helperUtils';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';

interface InputProps {
  limit?: number;
  context?: {
    type: 'project' | 'group';
    id: string;
  };
}

type children = (renderProps: GetAvatarsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  avatars: IAvatars | undefined | null;
}

export type GetAvatarsChildProps = IAvatars | undefined | null;

export default class GetAvatars extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      avatars: undefined
    };
  }

  componentDidMount() {
    const { limit, context } = this.props;
    this.inputProps$ = new BehaviorSubject({ limit, context });

    this.subscriptions = [
      this.inputProps$.pipe(
        distinctUntilChanged((prev, next) => isEqual(prev, next)),
        switchMap(({ limit, context }) => {
          if (context) {
            return avatarsStream({
              queryParameters: {
                limit,
                context_type: context.type,
                context_id: context.id
              }
            }).observable;
          }

          return avatarsStream({
            queryParameters: {
              limit
            }
          }).observable;
        })
      ).subscribe((avatars) => this.setState({ avatars: (!isNilOrError(avatars) ? avatars : null) }))
    ];
  }

  componentDidUpdate() {
    const { limit, context } = this.props;
    this.inputProps$.next({ limit, context });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { avatars } = this.state;
    return (children as children)(avatars);
  }
}
