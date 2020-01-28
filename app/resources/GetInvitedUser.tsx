import React from 'react';
import { isString } from 'lodash-es';
import { Subscription, BehaviorSubject, of } from 'rxjs';
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { IUserData, userByInviteStream } from 'services/users';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  token: string | null;
  resetOnChange?: boolean;
}

type children = (renderProps: GetInvitedUserChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  user: IUserData | undefined | null;
  isInvalidToken: boolean;
}

export type GetInvitedUserChildProps = State;

export default class GetInvitedUser extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<string | null>;
  private subscription: Subscription;

  static defaultProps = {
    resetOnChange: true
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      user: undefined,
      isInvalidToken: false
    };
  }

  componentDidMount() {
    const { token, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject(token);

    this.subscription = this.inputProps$.pipe(
      distinctUntilChanged(),
      tap(() => resetOnChange && this.setState({ user: undefined })),
      switchMap(token => {
        if (isString(token)) {
          return userByInviteStream(token).observable;
        }

        return of(null);
      })
    ).subscribe((user) => {
      this.setState({
        user: !isNilOrError(user) ? user.data : null,
        isInvalidToken: token && isNilOrError(user) ? true : false
      });
    });
  }

  componentDidUpdate() {
    const { token } = this.props;
    this.inputProps$.next(token);
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    const { children } = this.props;
    const { user } = this.state;
    if (user === undefined) {
      return null;
    } else {
      return (children as children)(this.state);
    }
  }
}
